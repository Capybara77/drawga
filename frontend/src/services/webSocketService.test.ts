import { describe, it, expect, beforeEach, afterEach, vi } from "vite-plus/test";
import { WebSocketService } from "./webSocketService";

// подменяем браузерный WebSocket: нужен только send и readyState
class FakeSocket {
  static OPEN = 1;
  static last: FakeSocket;
  static created = 0;
  readyState = 1;
  sent: string[] = [];
  onmessage: ((msg: MessageEvent) => void) | null = null;
  onclose: (() => void) | null = null;
  onopen: (() => void) | null = null;
  constructor() {
    FakeSocket.last = this;
    FakeSocket.created++;
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

describe("WebSocketService: переподключение", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("WebSocket", FakeSocket);
    FakeSocket.created = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const drop = () => {
    FakeSocket.last.readyState = 3;
    FakeSocket.last.onclose?.();
  };

  it("после обрыва через секунду открывает новый сокет", () => {
    new WebSocketService();
    drop();

    vi.advanceTimersByTime(999);
    expect(FakeSocket.created).toBe(1);

    vi.advanceTimersByTime(1);
    expect(FakeSocket.created).toBe(2);
  });

  it("пауза между попытками растёт до 10 секунд и сбрасывается после успеха", () => {
    new WebSocketService();
    const waits: number[] = [];

    for (let i = 0; i < 6; i++) {
      const before = FakeSocket.created;
      drop();
      let waited = 0;
      while (FakeSocket.created === before && waited < 20000) {
        vi.advanceTimersByTime(500);
        waited += 500;
      }
      waits.push(waited);
    }

    expect(waits).toEqual([1000, 2000, 4000, 8000, 10000, 10000]);

    FakeSocket.last.onopen?.();
    drop();
    vi.advanceTimersByTime(1000);
    expect(FakeSocket.created).toBe(8);
  });

  it("online меняется по обрыву и открытию, о смене говорит событие status", () => {
    const service = new WebSocketService();
    const statuses: boolean[] = [];
    service.addEventListener("status", () => statuses.push(service.online));

    FakeSocket.last.onopen?.();
    expect(service.online).toBe(true);

    drop();
    expect(service.online).toBe(false);

    vi.advanceTimersByTime(1000);
    FakeSocket.last.onopen?.();
    expect(statuses).toEqual([true, false, true]);
  });

  it("reconnect приходит только при повторном открытии, не при первом", () => {
    const service = new WebSocketService();
    const reconnect = vi.fn();
    service.addEventListener("reconnect", reconnect);

    FakeSocket.last.onopen?.();
    expect(reconnect).not.toHaveBeenCalled();

    drop();
    vi.advanceTimersByTime(1000);
    FakeSocket.last.onopen?.();
    expect(reconnect).toHaveBeenCalledOnce();
  });

  it("сообщения нового сокета доходят до подписчиков", () => {
    const service = new WebSocketService();
    const draw = vi.fn();
    service.addEventListener("drawObj", draw);

    drop();
    vi.advanceTimersByTime(1000);
    FakeSocket.last.onmessage?.(new MessageEvent("message", { data: "drawObj:::{}:::" }));

    expect(draw).toHaveBeenCalledOnce();
  });
});
