import { describe, it, expect, beforeEach, afterEach, vi } from "vite-plus/test";
import { WebSocketService } from "./webSocketService";

// подменяем браузерный WebSocket: нужен только send и readyState
class FakeSocket {
  static OPEN = 1;
  static last: FakeSocket;
  readyState = 1;
  sent: string[] = [];
  onmessage = null;
  onclose = null;
  onopen = null;
  constructor() {
    FakeSocket.last = this;
  }
  send(data: string) {
    this.sent.push(data);
  }
}

describe("WebSocketService.send", () => {
  beforeEach(() => {
    vi.stubGlobal("WebSocket", FakeSocket);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("одна команда — одно сообщение, без отдельного кадра с длиной", () => {
    const service = new WebSocketService();

    service.send(["drawObj", '{"objId":"A"}']);

    expect(FakeSocket.last.sent).toEqual(['drawObj:::{"objId":"A"}:::']);
  });

  it("пока сокет не открыт — ничего не отправляет и не падает", () => {
    const service = new WebSocketService();
    FakeSocket.last.readyState = 0;

    expect(() => service.send(["cur", "1", "2"])).not.toThrow();
    expect(FakeSocket.last.sent).toEqual([]);
  });
});
