using System.Net;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Text;
using Drawga.Draw;
using Xunit;

namespace Drawga.Tests;

public class SocketMessagesTests : IAsyncLifetime
{
    private TcpListener _listener = null!;
    private TcpClient _clientTcp = null!;
    private TcpClient _serverTcp = null!;
    private WebSocket _client = null!;
    private WebSocket _server = null!;

    // пара настоящих WebSocket поверх TCP на loopback — без хоста ASP.NET
    public async Task InitializeAsync()
    {
        _listener = new TcpListener(IPAddress.Loopback, 0);
        _listener.Start();
        _clientTcp = new TcpClient();
        var accept = _listener.AcceptTcpClientAsync();
        await _clientTcp.ConnectAsync(IPAddress.Loopback, ((IPEndPoint)_listener.LocalEndpoint).Port);
        _serverTcp = await accept;

        _client = WebSocket.CreateFromStream(_clientTcp.GetStream(), isServer: false, null, Timeout.InfiniteTimeSpan);
        _server = WebSocket.CreateFromStream(_serverTcp.GetStream(), isServer: true, null, Timeout.InfiniteTimeSpan);
    }

    public Task DisposeAsync()
    {
        _client.Dispose();
        _server.Dispose();
        _clientTcp.Dispose();
        _serverTcp.Dispose();
        _listener.Stop();
        return Task.CompletedTask;
    }

    [Fact]
    public async Task Receive_MessageSplitIntoFrames_ReturnsWholeMessage()
    {
        var parts = new[] { "drawObj:::", "{\"objId\":\"A\",", "\"points\":[1,2,3]}" };
        for (var i = 0; i < parts.Length; i++)
        {
            await _client.SendAsync(Encoding.UTF8.GetBytes(parts[i]), WebSocketMessageType.Text,
                i == parts.Length - 1, CancellationToken.None);
        }

        var message = await SocketMessages.ReceiveAsync(_server);

        Assert.Equal(string.Concat(parts), Encoding.UTF8.GetString(message!));
    }

    [Fact]
    public async Task Receive_BigMessage_ReturnsWholeMessage()
    {
        // длинная кривая: больше любого разумного буфера чтения
        var big = "drawObj:::" + new string('x', 300_000);
        await _client.SendAsync(Encoding.UTF8.GetBytes(big), WebSocketMessageType.Text, true, CancellationToken.None);

        var message = await SocketMessages.ReceiveAsync(_server);

        Assert.Equal(big, Encoding.UTF8.GetString(message!));
    }

    [Fact]
    public async Task Receive_Cyrillic_IsNotCut()
    {
        const string text = "message:::Привет, доска";
        await _client.SendAsync(Encoding.UTF8.GetBytes(text), WebSocketMessageType.Text, true, CancellationToken.None);

        var message = await SocketMessages.ReceiveAsync(_server);

        Assert.Equal(text, Encoding.UTF8.GetString(message!));
    }

    [Fact]
    public async Task Receive_TwoMessages_AreNotGlued()
    {
        await _client.SendAsync(Encoding.UTF8.GetBytes("cur:::1"), WebSocketMessageType.Text, true, CancellationToken.None);
        await _client.SendAsync(Encoding.UTF8.GetBytes("cur:::2"), WebSocketMessageType.Text, true, CancellationToken.None);

        Assert.Equal("cur:::1", Encoding.UTF8.GetString((await SocketMessages.ReceiveAsync(_server))!));
        Assert.Equal("cur:::2", Encoding.UTF8.GetString((await SocketMessages.ReceiveAsync(_server))!));
    }

    [Fact]
    public async Task Receive_TooBigMessage_ReturnsNull()
    {
        var huge = new byte[SocketMessages.MaxMessageBytes + 1];
        // не ждём отправку: сервер бросит читать раньше, чем клиент дошлёт всё
        _ = _client.SendAsync(huge, WebSocketMessageType.Text, true, CancellationToken.None);

        Assert.Null(await SocketMessages.ReceiveAsync(_server));
    }

    [Fact]
    public async Task Receive_Close_ReturnsNull()
    {
        await _client.CloseOutputAsync(WebSocketCloseStatus.NormalClosure, null, CancellationToken.None);

        Assert.Null(await SocketMessages.ReceiveAsync(_server));
    }
}
