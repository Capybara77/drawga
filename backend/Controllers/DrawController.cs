using System.Net.WebSockets;
using System.Text;
using Drawga.Draw;
using Drawga.Services;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Drawga.Controllers;

public class DrawController : Controller, IDisposable
{
    private const int MaxArrayLength = 10000 * 50;
    private const string Separator = ":::";

    private readonly DrawState _state = DrawState.Instance;

    public event Func<WebSocket, int, Task>? ClientDisconnectAsync;
    public event Func<WebSocket, int, Task>? ClientConnectedAsync;
    
    private bool _disposed;

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

        if (!_state.Sockets.ContainsKey(id))
        {
            _state.Sockets.Add(id, new());
        }

        if (_state.Sockets[id].Count == 0)
        {
            _state.BoardManager.LoadBoard(id, $"{id}.board");
        }

        _state.Sockets[id].Add(socket);

        if (ClientConnectedAsync != null)
        {
            await ClientConnectedAsync(socket, id);
        }

        var msg = FormatMessage("message", $"Элементов на доске: {_state.History[id].Count}");

        await socket.SendAsync(Encoding.UTF8.GetBytes(msg), WebSocketMessageType.Text, true,
            CancellationToken.None);

        if (!_state.History.ContainsKey(id))
            _state.History.Add(id, new());

        try
        {
            foreach (var t in _state.History[id])
            {
                await socket.SendAsync(t, WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }
        catch
        {
            // ignored
        }

        if (_state.PrivateBoards.Contains(id))
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

                if (!successParse || _state.PrivateBoards.Contains(id))
                    continue;

                var buffer = new byte[size];

                await socket.ReceiveAsync(buffer, CancellationToken.None);
                var message = Encoding.UTF8.GetString(buffer);

                AddToHistory(buffer, id);
                await DeleteHistory(buffer, id, socket);

                if (message == "save")
                {
                    _state.BoardManager.SaveBoard(id, $"{id}.board");
                }

                await SendData(socket, buffer, id);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                break;
            }
        }

        _state.Sockets[id].Remove(socket);
        if (ClientDisconnectAsync != null)
        {
            await ClientDisconnectAsync(socket, id);
        }
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
        if (_state.Sockets.ContainsKey(boardId) && _state.Sockets[boardId].Count != 0) return Task.CompletedTask;

        _state.BoardManager.SaveBoard(boardId, $"{boardId}.board");
        _state.History[boardId] = new();
        return Task.CompletedTask;
    }

    private Task DeleteHistory(byte[] buffer, int id, WebSocket socket)
    {
        var message = Encoding.UTF8.GetString(buffer);
        var parts = message.Split(Separator);

        if (parts.Length < 2)
            return Task.CompletedTask;

        if (parts[0] != "delete") return Task.CompletedTask;

        var delId = (JsonConvert.DeserializeObject(parts[1]) as dynamic)?.objId.ToString();

        var historyToDelete = _state.History[id]
            .Where(bytes => delId != null && Encoding.UTF8.GetString(bytes).Contains(delId))
            .ToArray();

        foreach (var bytes in historyToDelete)
        {
            _state.History[id].Remove(bytes);
        }

        return Task.CompletedTask;
    }

    private void AddToHistory(byte[] buffer, int id)
    {
        if (_state.History[id].Count > MaxArrayLength)
        {
            _state.History[id].Remove(_state.History[id][0]);
        }

        var message = Encoding.UTF8.GetString(buffer);

        if (message.StartsWith("clear"))
        {
            _state.History[id].Clear();
        }

        if (message.StartsWith("cur"))
            return;

        _state.History[id].Add(buffer);
    }

    private async Task SendData(WebSocket socketSender, byte[] buffer, int id)
    {
        for (var i = 0; i < _state.Sockets[id].Count; i++)
        {
            var client = _state.Sockets[id][i];
            if (client.State != WebSocketState.Open)
            {
                continue;
            }

            if (socketSender == client)
                continue;

            await client.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
        }
    }
    
    protected override void Dispose(bool disposing)
    {
        if (_disposed) return;
        
        if (disposing)
        {
            ClientDisconnectAsync -= SaveBoard;
            ClientDisconnectAsync -= EventForClientDisconnectAsync;
            ClientConnectedAsync -= OnClientConnectedAsync;
        }
        
        _disposed = true;
    }

    public new void Dispose()
    {
        base.Dispose();
        Dispose(true);
        GC.SuppressFinalize(this);
    }}