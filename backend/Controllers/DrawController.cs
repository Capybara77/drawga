using System.Net.WebSockets;
using System.Text;
using Drawga.Services;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Drawga.Controllers;

public class DrawController : Controller
{
    private const int MaxArrayLength = 10000 * 50;
    private const string Separator = ":::";
    private static int[] PrivateBoards { get; set; } = { 7, 9 };
    public static Dictionary<int, List<WebSocket>> Sockets { get; } = new();
    public static Dictionary<int, List<byte[]>> History { get; } = new();
    private static BoardManager BoardManager { get; } = new(History);
    public event Func<WebSocket, int, Task> ClientDisconnectAsync;
    public event Func<WebSocket, int, Task> ClientConnectedAsync;

    public DrawController()
    {
        ClientDisconnectAsync += SaveBoard;
        ClientDisconnectAsync += EventForClientDisconnectAsync;
        ClientConnectedAsync += OnClientConnectedAsync;
    }

    [Route("/draw/ws")]
    public async Task StartSocketDraw(int id)
    {
        if (!HttpContext.WebSockets.IsWebSocketRequest)
        {
            return;
        }

        var socket = await HttpContext.WebSockets.AcceptWebSocketAsync();

        if (!Sockets.ContainsKey(id))
        {
            Sockets.Add(id, new());
        }

        if (Sockets[id].Count == 0)
        {
            BoardManager.LoadBoard(id, $"{id}.board");
        }

        Sockets[id].Add(socket);

        await ClientConnectedAsync(socket, id);

        var msg = FormatMessage("message", $"Элементов на доске: {History[id].Count}");

        await socket.SendAsync(Encoding.UTF8.GetBytes(msg), WebSocketMessageType.Text, true,
            CancellationToken.None);

        if (!History.ContainsKey(id))
            History.Add(id, new());

        try
        {
            foreach (var t in History[id])
            {
                await socket.SendAsync(t, WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }
        catch
        {
            // ignored
        }

        if (PrivateBoards.Contains(id))
        {
            var saveMsg = FormatMessage("message", "Это закрытая доска. Изменения не сохраняются");

            await socket.SendAsync(Encoding.UTF8.GetBytes(saveMsg),
                WebSocketMessageType.Text, true, CancellationToken.None);
        }

        while (socket.State == WebSocketState.Open)
        {
            try
            {
                var bufferSize = new byte[32];
                await socket.ReceiveAsync(bufferSize, CancellationToken.None);

                var successParse = int.TryParse(Encoding.UTF8.GetString(bufferSize), out int size);

                if (!successParse || PrivateBoards.Contains(id))
                    continue;

                var buffer = new byte[size];

                await socket.ReceiveAsync(buffer, CancellationToken.None);
                var message = Encoding.UTF8.GetString(buffer);

                AddToHistory(buffer, id);
                await DeleteHistory(buffer, id, socket);

                if (message == "save")
                {
                    BoardManager.SaveBoard(id, $"{id}.board");
                }

                await SendData(socket, buffer, id);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                break;
            }
        }

        Sockets[id].Remove(socket);
        await ClientDisconnectAsync(socket, id);
    }

    private static string FormatMessage(string msgType, string msgContent)
    {
        var result = msgType + Separator + msgContent;

        return result;
    }

    private async Task OnClientConnectedAsync(WebSocket socket, int id)
    {
        var msg = FormatMessage("message", "Пользователь подключился");

        await SendData(socket, Encoding.UTF8.GetBytes(msg), id);
    }

    private async Task EventForClientDisconnectAsync(WebSocket socket, int id)
    {
        var msg = FormatMessage("disconnect", "");

        await SendData(socket, Encoding.UTF8.GetBytes(msg), id);
    }

    private Task SaveBoard(WebSocket client, int boardId)
    {
        if (Sockets[boardId].Count != 0) return Task.CompletedTask;

        BoardManager.SaveBoard(boardId, $"{boardId}.board");
        History[boardId] = new();
        return Task.CompletedTask;
    }

    private static Task DeleteHistory(byte[] buffer, int id, WebSocket socket)
    {
        var message = Encoding.UTF8.GetString(buffer);
        var parts = message.Split(Separator);

        if (parts.Length < 2)
            return Task.CompletedTask;

        if (parts[0] != "delete") return Task.CompletedTask;

        var delId = (JsonConvert.DeserializeObject(parts[1]) as dynamic)?.objId.ToString();

        var historyToDelete = History[id]
            .Where(bytes => delId != null && Encoding.UTF8.GetString(bytes).Contains(delId))
            .ToArray();

        foreach (var bytes in historyToDelete)
        {
            History[id].Remove(bytes);
        }

        return Task.CompletedTask;
    }

    private static void AddToHistory(byte[] buffer, int id)
    {
        if (History[id].Count > MaxArrayLength)
        {
            History[id].Remove(History[id][0]);
        }

        var message = Encoding.UTF8.GetString(buffer);

        if (message.StartsWith("clear"))
        {
            History[id].Clear();
        }

        if (message.StartsWith("cur"))
            return;

        History[id].Add(buffer);
    }

    private static async Task SendData(WebSocket socketSender, byte[] buffer, int id)
    {
        for (var i = 0; i < Sockets[id].Count; i++)
        {
            var client = Sockets[id][i];
            if (client.State != WebSocketState.Open)
            {
                continue;
            }

            if (socketSender == client)
                continue;

            await client.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
        }
    }

    ~DrawController()
    {
        ClientDisconnectAsync -= SaveBoard;
        ClientDisconnectAsync -= EventForClientDisconnectAsync;
        ClientConnectedAsync -= OnClientConnectedAsync;
    }
}