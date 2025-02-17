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
        Sockets = new ConcurrentDictionary<int, List<WebSocket>>();
        History = new ConcurrentDictionary<int, List<byte[]>>();
        PrivateBoards = new[] { 7, 9 };
        BoardManager = new BoardManager(History);
    }

    public static DrawState Instance => _instance.Value;

    public int[] PrivateBoards { get; private set; }
    public ConcurrentDictionary<int, List<WebSocket>> Sockets { get; }
    public ConcurrentDictionary<int, List<byte[]>> History { get; }
    public BoardManager BoardManager { get; }
}