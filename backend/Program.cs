using Microsoft.AspNetCore.Authentication.Cookies;
using Drawga.Data;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddSingleton<DataContext>();

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie(options =>
{
    options.Cookie.MaxAge = new TimeSpan(365, 0, 0, 0);
    options.ExpireTimeSpan = new TimeSpan(365, 0, 0, 0);
    options.AccessDeniedPath = "/login/noaccess";
    options.LoginPath = "/login";
    options.LogoutPath = "/login/logout";
});

var app = builder.Build();

app.UseWebSockets();

//app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Environment.CurrentDirectory, "dist")),
});

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseEndpoints(endpoints =>
    endpoints.MapDefaultControllerRoute());

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

if (app.Environment.IsDevelopment())
{
    app.UseSpa(spaBuilder =>
    {
        if (app.Environment.IsDevelopment())
        {
            spaBuilder.UseProxyToSpaDevelopmentServer("http://localhost:5173/");
        }
    });
}

app.Use(GetVueMain);

async Task GetVueMain(HttpContext context, RequestDelegate arg2)
{
    context.Response.ContentType = "text/html";
    await context.Response.SendFileAsync(Path.Combine("dist", "index.html"));
}

app.Run();
