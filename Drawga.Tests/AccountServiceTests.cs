using Drawga.Data;
using Drawga.Models;
using Drawga.Services;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Drawga.Tests;

public class AccountServiceTests : IDisposable
{
    private readonly string _dbPath = Path.Combine(Path.GetTempPath(), $"drawga-{Guid.NewGuid()}.db");
    private readonly DataContext _context;
    private readonly AccountService _accounts;

    public AccountServiceTests()
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
    }

    public void Dispose()
    {
        _context.Dispose();
        SqliteConnection.ClearAllPools();
        File.Delete(_dbPath);
    }

    [Fact]
    public void Register_DoesNotStorePlainPassword()
    {
        _accounts.Register("Ilya", "a@b.c", "secret123");

        var stored = _context.Users.Single().Password;
        Assert.NotEqual("secret123", stored);
        Assert.DoesNotContain("secret123", stored);
    }

    [Fact]
    public void Register_SamePasswordTwice_ProducesDifferentHashes()
    {
        _accounts.Register("A", "a@b.c", "secret123");
        _accounts.Register("B", "b@b.c", "secret123");

        var hashes = _context.Users.Select(u => u.Password).ToList();
        Assert.NotEqual(hashes[0], hashes[1]);
    }

    [Fact]
    public void Authenticate_CorrectPassword_ReturnsUser()
    {
        _accounts.Register("Ilya", "a@b.c", "secret123");

        var user = _accounts.Authenticate("a@b.c", "secret123");

        Assert.NotNull(user);
        Assert.Equal("Ilya", user.Name);
    }

    [Fact]
    public void Authenticate_WrongPassword_ReturnsNull()
    {
        _accounts.Register("Ilya", "a@b.c", "secret123");

        Assert.Null(_accounts.Authenticate("a@b.c", "wrong"));
    }

    [Fact]
    public void Authenticate_UnknownEmail_ReturnsNull()
    {
        _accounts.Register("Ilya", "a@b.c", "secret123");

        Assert.Null(_accounts.Authenticate("x@b.c", "secret123"));
    }

    [Fact]
    public void Authenticate_LegacyPlainTextPassword_ReturnsNullWithoutThrowing()
    {
        _context.Users.Add(new User { Name = "Old", Email = "old@b.c", Password = "123" });
        _context.SaveChanges();

        Assert.Null(_accounts.Authenticate("old@b.c", "123"));
    }
}
