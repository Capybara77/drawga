using System.Net.WebSockets;
using Drawga.Services;

namespace Drawga.Draw;

public sealed class DrawState
{
    private static readonly Lazy<DrawState> _instance = 
        new Lazy<DrawState>(() => new DrawState(), LazyThreadSafetyMode.ExecutionAndPublication);

    private DrawState()
    {
        Sockets = new Dictionary<int, List<WebSocket>>();
        History = new Dictionary<int, List<byte[]>>();
        PrivateBoards = new[] { 7, 9 };
        BoardManager = new BoardManager(History);
    }

    public static DrawState Instance => _instance.Value;

    public int[] PrivateBoards { get; private set; }
    public Dictionary<int, List<WebSocket>> Sockets { get; }
    public Dictionary<int, List<byte[]>> History { get; }
    public BoardManager BoardManager { get; }
}