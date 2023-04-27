using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace websocket_chat.Controllers
{
    [Authorize]
    public class Profile : Controller
    {
        public IActionResult Index()
        {
            return View("Profile");
        }
    }
}
