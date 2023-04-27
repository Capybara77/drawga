using Microsoft.AspNetCore.Mvc;
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

        public IActionResult Index()
        {
            return View("Login");
        }

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

            return LocalRedirect("/profile");
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