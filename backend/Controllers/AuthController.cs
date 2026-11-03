using System.Security.Claims;
using Drawga.Models;
using Drawga.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;

namespace Drawga.Controllers;

public record RegisterRequest(string? Name, string? Email, string? Password);
public record LoginRequest(string? Email, string? Password);
public record UserInfo(string Name, string Email);
// Field говорит форме, под каким полем показать сообщение
public record AuthError(string? Field, string Message);

// ApiController: кривой JSON сам получает 400, а не падает на request == null
[ApiController]
[Route("api")]
public class AuthController : ControllerBase
{
    private const int MaxNameLength = 50;
    private const int MaxEmailLength = 254;
    private const int MinPasswordLength = 8;
    // ponytail: хэшируем то, что пришло, поэтому длину режем, чтобы мегабайтный пароль не грузил CPU
    private const int MaxPasswordLength = 128;

    private readonly AccountService _accounts;

    public AuthController(AccountService accounts)
    {
        _accounts = accounts;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var name = request.Name?.Trim();
        var email = request.Email?.Trim();
        var password = request.Password;

        if (string.IsNullOrEmpty(name) || name.Length > MaxNameLength)
            return BadRequest(new AuthError("name", $"Имя — от 1 до {MaxNameLength} символов"));

        if (!IsEmail(email))
            return BadRequest(new AuthError("email", "Проверь email"));

        if (password == null || password.Length < MinPasswordLength || password.Length > MaxPasswordLength)
            return BadRequest(new AuthError("password", $"Пароль — от {MinPasswordLength} до {MaxPasswordLength} символов"));

        var user = _accounts.Register(name, email, password);

        if (user == null)
            return Conflict(new AuthError("email", "Этот email уже занят"));

        await SignIn(user);

        return Ok(new UserInfo(user.Name, user.Email));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = request.Email == null || request.Password == null || request.Password.Length > MaxPasswordLength
            ? null
            : _accounts.Authenticate(request.Email, request.Password);

        if (user == null)
            return Unauthorized(new AuthError(null, "Неверный email или пароль"));

        await SignIn(user);

        return Ok(new UserInfo(user.Name, user.Email));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

        return NoContent();
    }

    // гость — не ошибка: 204 без тела, чтобы в консоли браузера не краснело
    [HttpGet("me")]
    public UserInfo? Me()
    {
        var email = HttpContext.User.Identity?.Name;
        var user = email == null ? null : _accounts.FindByEmail(email);

        return user == null ? null : new UserInfo(user.Name, user.Email);
    }

    private static bool IsEmail(string? email) =>
        email is { Length: <= MaxEmailLength } &&
        !email.Any(char.IsWhiteSpace) &&
        email.IndexOf('@') > 0 &&
        email.IndexOf('@') < email.Length - 1;

    private Task SignIn(User user)
    {
        var claims = new List<Claim>
        {
            new(ClaimsIdentity.DefaultNameClaimType, user.Email),
            new(ClaimsIdentity.DefaultRoleClaimType, "user"),
        };
        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);

        return HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(identity),
            new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddDays(365),
            });
    }
}
