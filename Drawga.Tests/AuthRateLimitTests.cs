using System.Net;
using System.Threading.RateLimiting;
using Drawga.Services;
using Microsoft.AspNetCore.Http;
using Xunit;

namespace Drawga.Tests;

public class AuthRateLimitTests
{
    private static HttpContext Request(string path, string ip = "1.2.3.4")
    {
        var context = new DefaultHttpContext();
        context.Request.Path = path;
        context.Connection.RemoteIpAddress = IPAddress.Parse(ip);
        return context;
    }

    private static bool Allowed(PartitionedRateLimiter<HttpContext> limiter, HttpContext context) =>
        limiter.AttemptAcquire(context).IsAcquired;

    [Fact]
    public void Login_AfterLimit_IsRejected()
    {
        using var limiter = AuthRateLimit.Create();

        for (var i = 0; i < AuthRateLimit.PermitsPerMinute; i++)
            Assert.True(Allowed(limiter, Request("/api/login")));

        Assert.False(Allowed(limiter, Request("/api/login")));
    }

    // перебирать пароли через регистрацию не выйдет: счётчик общий
    [Fact]
    public void Register_SharesCounterWithLogin()
    {
        using var limiter = AuthRateLimit.Create();

        for (var i = 0; i < AuthRateLimit.PermitsPerMinute; i++)
            Allowed(limiter, Request("/api/login"));

        Assert.False(Allowed(limiter, Request("/api/register")));
    }

    [Fact]
    public void OtherIp_HasOwnCounter()
    {
        using var limiter = AuthRateLimit.Create();

        for (var i = 0; i < AuthRateLimit.PermitsPerMinute; i++)
            Allowed(limiter, Request("/api/login"));

        Assert.True(Allowed(limiter, Request("/api/login", "5.6.7.8")));
    }

    [Theory]
    [InlineData("/api/me")]
    [InlineData("/draw")]
    [InlineData("/")]
    public void OtherPaths_AreNotLimited(string path)
    {
        using var limiter = AuthRateLimit.Create();

        for (var i = 0; i < AuthRateLimit.PermitsPerMinute * 3; i++)
            Assert.True(Allowed(limiter, Request(path)));
    }
}
