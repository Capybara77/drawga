using System.Collections.Concurrent;
using System.Net.WebSockets;
using Drawga.Services;

namespace Drawga.Draw;

public sealed class DrawState
{
    private static readonly Lazy<DrawState> _instance = 
        new Lazy<DrawState>(() => new DrawState(), LazyThreadSafetyMode.ExecutionAndPublication);

    private DrawState()
    {
        Sockets = new ConcurrentDictionary<string, List<WebSocket>>();
        History = new ConcurrentDictionary<string, List<byte[]>>();
        SendLocks = new ConcurrentDictionary<WebSocket, SemaphoreSlim>();
        PrivateBoards = new[] { "7", "9" };
        BoardManager = new BoardManager(History);
    }

    public static DrawState Instance => _instance.Value;

    public string[] PrivateBoards { get; private set; }
    public ConcurrentDictionary<string, List<WebSocket>> Sockets { get; }
    public ConcurrentDictionary<string, List<byte[]>> History { get; }
    // WebSocket не разрешает два SendAsync одновременно, а пишут в сокет циклы всех участников доски
    public ConcurrentDictionary<WebSocket, SemaphoreSlim> SendLocks { get; }
    public BoardManager BoardManager { get; }
}