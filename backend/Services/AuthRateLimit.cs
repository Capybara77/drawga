using System.Threading.RateLimiting;
using Drawga.Controllers;
using Microsoft.AspNetCore.RateLimiting;

namespace Drawga.Services;

// Перебор паролей: вход и регистрация делят один счётчик на IP, остальное не трогаем
public static class AuthRateLimit
{
    public const int PermitsPerMinute = 10;

    private static readonly string[] LimitedPaths = ["/api/login", "/api/register"];

    public static PartitionedRateLimiter<HttpContext> Create() =>
        PartitionedRateLimiter.Create<HttpContext, string>(context =>
        {
            if (!LimitedPaths.Contains(context.Request.Path.Value))
                return RateLimitPartition.GetNoLimiter("");

            // ponytail: за Caddy настоящий IP приходит через UseForwardedHeaders, иначе тут был бы адрес прокси
            var ip = context.Connection.RemoteIpAddress?.ToString() ?? "";

            return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = PermitsPerMinute,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            });
        });

    public static void Configure(RateLimiterOptions options)
    {
        options.GlobalLimiter = Create();
        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
        // форма показывает message из ответа, поэтому отвечаем тем же AuthError, что и контроллер
        options.OnRejected = (context, token) => new ValueTask(
            context.HttpContext.Response.WriteAsJsonAsync(
                new AuthError(null, "Слишком много попыток. Подожди минуту"), token));
    }
}
