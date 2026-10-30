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
        var sockets = _state.Sockets.GetOrAdd(id, _ => new());

        // списки досок общие для всех подключений — трогаем только под lock
        lock (sockets)
        {
            if (sockets.Count == 0)
            {
                _state.BoardManager.LoadBoard(id, $"{id}.board");
            }

            sockets.Add(socket);
        }

        if (ClientConnectedAsync != null)
        {
            await ClientConnectedAsync(socket, id);
        }

        var history = _state.History.GetOrAdd(id, _ => new());
        byte[][] snapshot;

        lock (history)
        {
            snapshot = history.ToArray();
        }

        try
        {
            await SendAsync(socket, Encoding.UTF8.GetBytes(FormatMessage("message", $"Элементов на доске: {snapshot.Length}")));

            foreach (var t in snapshot)
            {
                await SendAsync(socket, t);
            }

            if (_state.PrivateBoards.Contains(id))
            {
                await SendAsync(socket, Encoding.UTF8.GetBytes(FormatMessage("message", "Это закрытая доска. Изменения не сохраняются")));
            }
        }
        catch
        {
            // ignored
        }

        while (socket.State == WebSocketState.Open)
        {
            try
            {
                var buffer = await SocketMessages.ReceiveAsync(socket);

                if (buffer == null)
                    break;

                if (_state.PrivateBoards.Contains(id))
                    continue;

                var message = Encoding.UTF8.GetString(buffer);

                AddToHistory(buffer, id);
                await DeleteHistory(buffer, id, socket);

                if (message == "save")
                {
                    SaveHistory(id);
                }

                await SendData(socket, buffer, id);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                break;
            }
        }

        lock (sockets)
        {
            sockets.Remove(socket);
        }

        if (ClientDisconnectAsync != null)
        {
            await ClientDisconnectAsync(socket, id);
        }

        await CloseAsync(socket);
        _state.SendLocks.TryRemove(socket, out _);
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
        if (_state.Sockets.TryGetValue(boardId, out var sockets))
        {
            lock (sockets)
            {
                if (sockets.Count != 0) return Task.CompletedTask;
            }
        }

        // ponytail: историю в памяти не обнуляем — если двое вышли одновременно, оба сохранят,
        // и второй раньше затирал файл пустым списком. При следующем входе LoadBoard всё равно перечитает файл
        SaveHistory(boardId);
        return Task.CompletedTask;
    }

    private void SaveHistory(int boardId)
    {
        var history = _state.History[boardId];

        lock (history)
        {
            _state.BoardManager.SaveBoard(boardId, $"{boardId}.board");
        }
    }

    private Task DeleteHistory(byte[] buffer, int id, WebSocket socket)
    {
        var message = Encoding.UTF8.GetString(buffer);
        var parts = message.Split(Separator);

        if (parts.Length < 2)
            return Task.CompletedTask;

        if (parts[0] != "delete") return Task.CompletedTask;

        var delId = (JsonConvert.DeserializeObject(parts[1]) as dynamic)?.objId.ToString();

        var history = _state.History[id];

        lock (history)
        {
            history.RemoveAll(bytes => delId != null && Encoding.UTF8.GetString(bytes).Contains(delId));
        }

        return Task.CompletedTask;
    }

    private void AddToHistory(byte[] buffer, int id)
    {
        var message = Encoding.UTF8.GetString(buffer);

        if (message.StartsWith("cur") || message.StartsWith("temp"))
            return;

        var history = _state.History[id];

        lock (history)
        {
            if (history.Count > MaxArrayLength)
            {
                history.RemoveAt(0);
            }

            if (message.StartsWith("clear"))
            {
                history.Clear();
            }

            history.Add(buffer);
        }
    }

    private async Task SendData(WebSocket socketSender, byte[] buffer, int id)
    {
        var sockets = _state.Sockets[id];
        WebSocket[] clients;

        lock (sockets)
        {
            clients = sockets.ToArray();
        }

        foreach (var client in clients)
        {
            if (client == socketSender || client.State != WebSocketState.Open)
                continue;

            try
            {
                await SendAsync(client, buffer);
            }
            catch (Exception e)
            {
                // отвалился получатель — это не повод рвать соединение отправителя
                Console.WriteLine(e.Message);
            }
        }
    }

    private async Task SendAsync(WebSocket socket, byte[] data)
    {
        var sendLock = _state.SendLocks.GetOrAdd(socket, _ => new SemaphoreSlim(1, 1));
        await sendLock.WaitAsync();

        try
        {
            await socket.SendAsync(data, WebSocketMessageType.Text, true, CancellationToken.None);
        }
        finally
        {
            sendLock.Release();
        }
    }

    // закрываем по-человечески, иначе клиент видит обрыв 1006
    private async Task CloseAsync(WebSocket socket)
    {
        var sendLock = _state.SendLocks.GetOrAdd(socket, _ => new SemaphoreSlim(1, 1));
        await sendLock.WaitAsync();

        try
        {
            if (socket.State is WebSocketState.Open or WebSocketState.CloseReceived)
            {
                await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, null, CancellationToken.None);
            }
        }
        catch
        {
            // ignored
        }
        finally
        {
            sendLock.Release();
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
    }
}
