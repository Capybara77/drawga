using System.Net.WebSockets;

namespace Drawga.Draw;

public static class SocketMessages
{
    // больше — рвём соединение, чтобы один клиент не съел память сервера
    public const int MaxMessageBytes = 4 * 1024 * 1024;

    // одно сообщение WebSocket может прийти несколькими кадрами — читаем до EndOfMessage.
    // null — сокет закрывается или сообщение больше лимита
    public static async Task<byte[]?> ReceiveAsync(WebSocket socket, CancellationToken ct = default)
    {
        var buffer = new byte[16 * 1024];
        using var message = new MemoryStream();

        while (true)
        {
            var result = await socket.ReceiveAsync(buffer, ct);

            if (result.MessageType == WebSocketMessageType.Close)
                return null;

            message.Write(buffer, 0, result.Count);

            if (message.Length > MaxMessageBytes)
                return null;

            if (result.EndOfMessage)
                return message.ToArray();
        }
    }
}
