using Drawga.Data;
using Drawga.Models;
using Microsoft.AspNetCore.Identity;

namespace Drawga.Services;

public class AccountService
{
    private readonly DataContext _context;
    private readonly PasswordHasher<User> _hasher = new();

    public AccountService(DataContext context)
    {
        _context = context;
    }

    public void Register(string name, string email, string password)
    {
        var user = new User { Name = name, Email = email };
        user.Password = _hasher.HashPassword(user, password);
        _context.Users.Add(user);
        _context.SaveChanges();
    }

    public User? Authenticate(string email, string password)
    {
        var user = _context.Users.FirstOrDefault(u => u.Email == email);
        if (user == null)
            return null;

        try
        {
            return _hasher.VerifyHashedPassword(user, user.Password, password) == PasswordVerificationResult.Failed
                ? null
                : user;
        }
        catch (FormatException)
        {
            // ponytail: старые пароли открытым текстом не base64 — просто не пускаем, пусть регаются заново
            return null;
        }
    }
}
