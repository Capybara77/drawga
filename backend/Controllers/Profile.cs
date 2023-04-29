using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using websocket_chat.Data;

namespace websocket_chat.Controllers
{
    [Authorize]
    public class Profile : Controller
    {
        public DataContext Context { get; }

        public Profile(DataContext context)
        {
            Context = context;
        }

        public IActionResult Index()
        {
            Models.User user = Context.Users.FirstOrDefault(user1 => HttpContext.User.Identity != null && user1.Email == HttpContext.User.Identity.Name);
            if (user == null)
            {
                return LocalRedirect("/login/logout");
            }

            return View("Profile", Context.Boards.Where(board => board.User.Id == user.Id).ToList());
        }
    }
}
