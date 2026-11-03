using Drawga.Data;
using Drawga.Models;
using Microsoft.AspNetCore.Identity;

namespace Drawga.Services;

public class AccountService
{
    private readonly DataContext _context;
    private readonly PasswordHasher<User> _hasher = new();
    // DataContext — синглтон и не потокобезопасен, а проверка email и запись должны идти одним шагом.
    // ponytail: уникального индекса нет (миграции делает пользователь), его заменяет этот lock
    private readonly object _dbLock = new();

    public AccountService(DataContext context)
    {
        _context = context;
    }

    private static string Normalize(string email) => email.Trim().ToLowerInvariant();

    // null — email уже занят
    public User? Register(string name, string email, string password)
    {
        var user = new User { Name = name, Email = Normalize(email) };
        user.Password = _hasher.HashPassword(user, password);

        lock (_dbLock)
        {
            if (Find(user.Email) != null)
                return null;

            _context.Users.Add(user);
            _context.SaveChanges();
        }

        return user;
    }

    public User? FindByEmail(string email)
    {
        lock (_dbLock)
        {
            return Find(Normalize(email));
        }
    }

    public User? Authenticate(string email, string password)
    {
        var user = FindByEmail(email);
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

    // старые записи могли сохраниться с заглавными, поэтому сравниваем без учёта регистра
    private User? Find(string normalizedEmail) =>
        _context.Users.FirstOrDefault(u => u.Email.ToLower() == normalizedEmail);
}
