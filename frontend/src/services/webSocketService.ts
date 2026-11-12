const SEPARATOR = ":::";
const FIRST_RETRY_MS = 1000;
const MAX_RETRY_MS = 10000;

function formatDataToWS(data: string[]): string {
  const formattedData = data.join(SEPARATOR) + SEPARATOR;

  return formattedData;
}

// События: команды сервера по имени ("drawObj", "cur", ...), а ещё
// "status" — сменился online, "reconnect" — связь вернулась и сервер сейчас пришлёт доску заново
export class WebSocketService extends EventTarget {
  private socket!: WebSocket;
  private readonly uri: string;
  private retryMs = FIRST_RETRY_MS;
  private wasOpen = false;
  public online = false;

  constructor() {
    super();
    const location: Location = window.location;
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    // Формирование URI: например, wss://example.com/путь/ws?query=...
    this.uri = `${protocol}//${location.host}${location.pathname}/ws${location.search}`;
    this.connect();
  }

  private connect(): void {
    this.socket = new WebSocket(this.uri);
    this.socket.onmessage = this.onSocketMessage.bind(this);
    this.socket.onclose = this.onSocketClose.bind(this);
    this.socket.onopen = this.onSocketOpen.bind(this);
  }

  private setOnline(online: boolean): void {
    if (this.online === online) return;

    this.online = online;
    this.dispatchEvent(new CustomEvent("status"));
  }

  private onSocketOpen(): void {
    this.retryMs = FIRST_RETRY_MS;

    // до onmessage: подписчик успевает очистить доску перед тем, как придёт история
    if (this.wasOpen) {
      this.dispatchEvent(new CustomEvent("reconnect"));
    }

    this.wasOpen = true;
    this.setOnline(true);
  }

  private onSocketMessage(msg: MessageEvent): void {
    try {
      // Разбиваем полученное сообщение по разделителю ":::"
      const data: string[] = msg.data.split(":::");
      const command: string = data[0];

      // Генерируем событие с именем команды и передаём массив data как detail.
      this.dispatchEvent(new CustomEvent(command, { detail: data }));
    } catch (e) {
      console.error("Ошибка обработки сообщения WebSocket:", e);
    }
  }

  // ponytail: пробуем бесконечно — вкладку с доской держат открытой, а сервер рано или поздно поднимется
  private onSocketClose(): void {
    this.setOnline(false);
    setTimeout(() => this.connect(), this.retryMs);
    this.retryMs = Math.min(this.retryMs * 2, MAX_RETRY_MS);
  }

  /**
   * Отправка данных на сервер.
   * @param data - объект с данными для отправки.
   */
  public send(data: string[]): void {
    if (this.socket.readyState !== WebSocket.OPEN) {
      console.error(
        "Невозможно отправить данные. WebSocket не открыт. Текущее состояние:",
        this.socket.readyState,
      );

      return;
    }

    // одно сообщение WebSocket = одна команда; границы сообщений держит сам протокол
    this.socket.send(formatDataToWS(data));
  }
}
