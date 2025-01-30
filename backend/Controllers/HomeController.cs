using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using Drawga.Data;
using Drawga.Models;

namespace Drawga.Controllers
{
    public class HomeController : Controller
    {
        public DataContext Context { get; }

        public HomeController(DataContext context)
        {
            Context = context;
            context.Users.ToList();
        }

        public IActionResult Index()
        {
            return View("Home");
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}