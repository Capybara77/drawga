using System.Diagnostics;
using System.Net.WebSockets;
using System.Text;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.Extensions.Hosting.Internal;
using websocket_chat.Data;

//var writer = new System.IO.StreamWriter("C:\\Temp\\ConsoleOutput.txt");
//writer.AutoFlush = true;
//Console.SetOut(writer);

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

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    //app.UseHsts();
}
app.UseWebSockets();

//app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseEndpoints(endpoints =>
    endpoints.MapDefaultControllerRoute());

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.UseSpa(spaBuilder =>
{
    if (app.Environment.IsDevelopment())
    {
        spaBuilder.UseProxyToSpaDevelopmentServer("http://localhost:5173/");
    }
});

app.Run();
