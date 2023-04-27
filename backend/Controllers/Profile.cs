using Microsoft.AspNetCore.Mvc;

namespace websocket_chat.Controllers
{
    public class Profile : Controller
    {
        public IActionResult Index()
        {
            return View("Profile");
        }
    }
}
