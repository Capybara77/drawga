using System.Security.Claims;
using Drawga.Controllers;
using Drawga.Data;
using Drawga.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;

namespace Drawga.Tests;

public class AuthControllerTests : IDisposable
{
    private readonly string _dbPath = Path.Combine(Path.GetTempPath(), $"drawga-{Guid.NewGuid()}.db");
    private readonly DataContext _context;
    private readonly AccountService _accounts;
    private readonly Mock<IAuthenticationService> _auth = new();
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:Default"] = $"Data Source={_dbPath}",
            })
            .Build();
        _context = new DataContext(config);
        _context.Database.EnsureCreated();
        _accounts = new AccountService(_context);

        var services = new ServiceCollection().AddSingleton(_auth.Object).BuildServiceProvider();
        _controller = new AuthController(_accounts)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { RequestServices = services },
            },
        };
    }

    public void Dispose()
    {
        _context.Dispose();
        SqliteConnection.ClearAllPools();
        File.Delete(_dbPath);
    }

    private void VerifySignedIn(Times times, string? email = null) =>
        _auth.Verify(a => a.SignInAsync(
            It.IsAny<HttpContext>(),
            It.IsAny<string>(),
            It.Is<ClaimsPrincipal>(p => email == null || p.Identity!.Name == email),
            It.Is<AuthenticationProperties>(props => props.IsPersistent)), times);

    private static AuthError ErrorOf(IActionResult result) =>
        Assert.IsType<AuthError>(Assert.IsAssignableFrom<ObjectResult>(result).Value);

    [Fact]
    public async Task Register_CreatesUserAndSignsIn()
    {
        var result = await _controller.Register(new RegisterRequest("Ilya", "a@b.c", "secret123"));

        var user = Assert.IsType<UserInfo>(Assert.IsType<OkObjectResult>(result).Value);
        Assert.Equal(new UserInfo("Ilya", "a@b.c"), user);
        VerifySignedIn(Times.Once(), "a@b.c");
    }

    [Fact]
    public async Task Register_TakenEmail_Conflict_WithoutSignIn()
    {
        _accounts.Register("Old", "a@b.c", "secret123");

        var result = await _controller.Register(new RegisterRequest("Ilya", "A@B.C", "secret123"));

        Assert.IsType<ConflictObjectResult>(result);
        Assert.Equal("email", ErrorOf(result).Field);
        VerifySignedIn(Times.Never());
    }

    [Theory]
    [InlineData("", "a@b.c", "secret123", "name")]
    [InlineData("   ", "a@b.c", "secret123", "name")]
    [InlineData(null, "a@b.c", "secret123", "name")]
    [InlineData("Ilya", "not-email", "secret123", "email")]
    [InlineData("Ilya", "a b@c.d", "secret123", "email")]
    [InlineData("Ilya", null, "secret123", "email")]
    [InlineData("Ilya", "a@b.c", "short", "password")]
    [InlineData("Ilya", "a@b.c", null, "password")]
    public async Task Register_InvalidField_BadRequest(
        string? name, string? email, string? password, string field)
    {
        var result = await _controller.Register(new RegisterRequest(name, email, password));

        Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(field, ErrorOf(result).Field);
        Assert.Empty(_context.Users);
    }

    [Fact]
    public async Task Login_CorrectPassword_SignsIn()
    {
        _accounts.Register("Ilya", "a@b.c", "secret123");

        var result = await _controller.Login(new LoginRequest(" A@b.c ", "secret123"));

        Assert.Equal(new UserInfo("Ilya", "a@b.c"), Assert.IsType<OkObjectResult>(result).Value);
        VerifySignedIn(Times.Once(), "a@b.c");
    }

    [Theory]
    [InlineData("a@b.c", "wrong")]
    [InlineData("x@b.c", "secret123")]
    [InlineData(null, null)]
    public async Task Login_BadCredentials_Unauthorized(string? email, string? password)
    {
        _accounts.Register("Ilya", "a@b.c", "secret123");

        var result = await _controller.Login(new LoginRequest(email, password));

        Assert.IsType<UnauthorizedObjectResult>(result);
        VerifySignedIn(Times.Never());
    }

    [Fact]
    public async Task Logout_SignsOut()
    {
        Assert.IsType<NoContentResult>(await _controller.Logout());

        _auth.Verify(a => a.SignOutAsync(
            It.IsAny<HttpContext>(), It.IsAny<string>(), It.IsAny<AuthenticationProperties>()), Times.Once());
    }

    private void SetIdentity(string email) =>
        _controller.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity(
            new[] { new Claim(ClaimsIdentity.DefaultNameClaimType, email) }, "test"));

    [Fact]
    public void Me_Guest_Null()
    {
        Assert.Null(_controller.Me());
    }

    [Fact]
    public void Me_SignedIn_ReturnsUser()
    {
        _accounts.Register("Ilya", "a@b.c", "secret123");
        SetIdentity("a@b.c");

        Assert.Equal(new UserInfo("Ilya", "a@b.c"), _controller.Me());
    }

    // кука живёт год, а пользователя могли удалить из базы
    [Fact]
    public void Me_StaleCookie_Null()
    {
        SetIdentity("gone@b.c");

        Assert.Null(_controller.Me());
    }
}
