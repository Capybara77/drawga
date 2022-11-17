using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Net.WebSockets;
using websocket_chat.Models;

namespace websocket_chat.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private static readonly List<WebSocket> Clients = new List<WebSocket>();

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }

        [Route("/ws")]
        public async Task StartWebsocket()
        {
            if (HttpContext.WebSockets.IsWebSocketRequest)
            {
                var socket = HttpContext.WebSockets.AcceptWebSocketAsync().Result;
                Clients.Add(socket);
                while (socket.State == WebSocketState.Open)
                {
                    var buffer = new byte[1024 * 4];

                    await socket.ReceiveAsync(buffer, CancellationToken.None);
                    
                    for (var i = 0; i < Clients.Count; i++)
                    {
                        var client = Clients[i];
                        if (client.State != WebSocketState.Open)
                        {
                            Clients.Remove(client);
                            i--;
                            continue;
                        }

                        await client.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
                    }

                    Thread.Sleep(5);
                }
            }

        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}