using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Web;
using websocket_chat.Data;
using websocket_chat.Models;

namespace websocket_chat.Controllers
{
    public class Login : Controller
    {
        public DataContext DataContext { get; }

        public Login(DataContext dataContext)
        {
            DataContext = dataContext;
        }

        public IActionResult Index() => View("Login");

        [HttpPost]
        [Route("/login/login")]
        public IActionResult In(string email, string password)
        {
            User? user = DataContext.Users.FirstOrDefault(user1 => user1.Password == password && user1.Email == email);
            if (user == null)
            {
                return View("~/Views/Login/Login.cshtml", "Неверный логин или пароль");
                return LocalRedirect("/login");
            }

            List<Claim> claims = new List<Claim>
            {
                new(ClaimsIdentity.DefaultNameClaimType, email),
                new(ClaimsIdentity.DefaultRoleClaimType, "user")
            };

            ClaimsIdentity ci = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            ClaimsPrincipal cp = new ClaimsPrincipal(ci);

            HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, cp, new AuthenticationProperties
            {
                ExpiresUtc = DateTimeOffset.Now + new TimeSpan(365, 0, 0)
            });

            if (HttpContext.Request.Headers.ContainsKey("referer"))
            {
                var refererUrl = new Uri(HttpContext.Request.Headers["referer"]);
                string urlPara = HttpUtility.ParseQueryString(refererUrl.Query).Get("ReturnUrl");
                if (!string.IsNullOrWhiteSpace(urlPara))
                    return LocalRedirect(urlPara);
            }

            return LocalRedirect("/profile");
        }

        public IActionResult Logout()
        {
            HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return LocalRedirect("/");
        }

        public IActionResult Register()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Register(string name, string password, string email)
        {
            DataContext.Users.Add(new User()
            {
                Email = email,
                Name = name,
                Password = password
            });
            DataContext.SaveChanges();
            return LocalRedirect("/profile");
        }
    }
}