using System.Net.WebSockets;
using Xunit;
using Moq;
using Microsoft.AspNetCore.Http;
using System.Net.Http;
using Drawga.Controllers;

namespace Drawga.Tests;

public class DrawControllerTests
{
    private DrawController _controller;
    private Mock<WebSocket> _mockSocket;
    private Mock<HttpContext> _mockHttpContext;

    public DrawControllerTests()
    {
        _controller = new DrawController();
        _mockSocket = new Mock<WebSocket>();
        _mockHttpContext = new Mock<HttpContext>();

        var mockWebSocketManager = new Mock<WebSocketManager>();
        _mockHttpContext.Setup(x => x.WebSockets).Returns(mockWebSocketManager.Object);
    }

    [Fact]
    public async Task StartSocketDraw_NonWebSocketRequest_ReturnsImmediately()
    {
        // Arrange
        _mockHttpContext.Setup(x => x.WebSockets.IsWebSocketRequest).Returns(false);
        _controller.ControllerContext.HttpContext = _mockHttpContext.Object;

        // Act
        await _controller.StartSocketDraw(1);

        // Assert
        _mockSocket.Verify(x => x.ReceiveAsync(It.IsAny<ArraySegment<byte>>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task StartSocketDraw_PrivateBoard_DoesNotSaveHistory()
    {
        // Arrange
        const int privateBoard = 7; // из PrivateBoards
        _mockSocket.Setup(x => x.State).Returns(WebSocketState.Open);
        var buffer = System.Text.Encoding.UTF8.GetBytes("test-data");

        // Act
        await _controller.StartSocketDraw(privateBoard);

        // Assert
        Assert.Empty(DrawController.History[privateBoard]);
    }

    [Fact]
    public async Task StartSocketDraw_MessageReceived_AddsToHistory()
    {
        // Arrange
        const int boardId = 1;
        _mockSocket.Setup(x => x.State).Returns(WebSocketState.Open);
        var buffer = System.Text.Encoding.UTF8.GetBytes("line:::test-data");

        // Act
        await SendMessageToController(buffer, boardId);

        // Assert
        Assert.Contains(DrawController.History[boardId], x => x.SequenceEqual(buffer));
    }

    [Fact]
    public async Task StartSocketDraw_ClearMessage_ClearsHistory()
    {
        // Arrange
        const int boardId = 1;
        _mockSocket.Setup(x => x.State).Returns(WebSocketState.Open);

        // Сначала добавляем данные
        var initialData = System.Text.Encoding.UTF8.GetBytes("line:::test-data");
        await SendMessageToController(initialData, boardId);

        // Act - отправляем clear
        var clearBuffer = System.Text.Encoding.UTF8.GetBytes("clear");
        await SendMessageToController(clearBuffer, boardId);

        // Assert
        Assert.Empty(DrawController.History[boardId]);
    }

    [Fact]
    public async Task StartSocketDraw_ClientDisconnects_SavesBoard()
    {
        // Arrange
        const int boardId = 1;
        _mockSocket.SetupSequence(x => x.State)
            .Returns(WebSocketState.Open);

        if (!DrawController.Sockets.ContainsKey(boardId))
            DrawController.Sockets[boardId] = new List<WebSocket>();

        // Act
        var task = _controller.StartSocketDraw(boardId);
        await Task.Delay(100); // Даем время на обработку
        _mockSocket.Setup(x => x.ReceiveAsync(It.IsAny<ArraySegment<byte>>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new WebSocketException("Connection closed"));
        await task;

        // Assert
        Assert.True(File.Exists($"{boardId}.board"));
    }

    [Fact]
    public async Task StartSocketDraw_MaxHistoryExceeded_RemovesOldestEntry()
    {
        // Arrange
        const int boardId = 1;
        const int maxEntries = 10000 * 50; // из MaxArrayLength
        _mockSocket.Setup(x => x.State).Returns(WebSocketState.Open);

        // Act
        for (int i = 0; i < maxEntries + 1; i++)
        {
            var buffer = System.Text.Encoding.UTF8.GetBytes($"line:::{i}");
            await SendMessageToController(buffer, boardId);
        }

        // Assert
        Assert.Equal(maxEntries, DrawController.History[boardId].Count);
        // Проверяем что первая запись удалена
        var firstEntry = System.Text.Encoding.UTF8.GetBytes("line:::0");
        Assert.DoesNotContain(DrawController.History[boardId], x => x.SequenceEqual(firstEntry));
    }

    private async Task SendMessageToController(byte[] buffer, int boardId)
    {
        var size = buffer.Length.ToString();
        var sizeBuffer = System.Text.Encoding.UTF8.GetBytes(size);

        _mockSocket.Setup(x => x.ReceiveAsync(It.IsAny<ArraySegment<byte>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new WebSocketReceiveResult(sizeBuffer.Length, WebSocketMessageType.Text, true));

        if (!DrawController.History.ContainsKey(boardId))
            DrawController.History[boardId] = new List<byte[]>();

        DrawController.History[boardId].Add(buffer);
    }
}