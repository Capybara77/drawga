using Drawga.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Drawga.Controllers
{
    [Authorize]
    public class ProfileController : Controller
    {
        public DataContext Context { get; }

        public ProfileController(DataContext context)
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
