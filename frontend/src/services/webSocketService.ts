export class WebSocketService extends EventTarget {
  private socket: WebSocket;

  constructor() {
    super();
    const location: Location = window.location;
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Формирование URI: например, wss://example.com/путь/ws?query=...
    const newUri = `${protocol}//${location.host}${location.pathname}/ws${location.search}`;
    this.socket = new WebSocket(newUri);
    this.setSocketEvents();
  }

  private setSocketEvents(): void {
    this.socket.onmessage = this.onSocketMessage.bind(this);
    this.socket.onclose = this.onSocketClose.bind(this);
    this.socket.onopen = this.onSocketOpen.bind(this);
    // Можно добавить обработчики onopen, onerror и т.п. при необходимости
  }

  private onSocketOpen(): void {
    this.send('Hello, server');
  }

  private onSocketMessage(msg: MessageEvent): void {
    try {
      // Разбиваем полученное сообщение по разделителю ":::"
      const data: string[] = msg.data.split(':::');
      const command: string = data[0];

      // Генерируем событие с именем команды и передаём массив data как detail.
      this.dispatchEvent(new CustomEvent(command, { detail: data }));
    } catch (e) {
      console.error('Ошибка обработки сообщения WebSocket:', e);
    }
  }

  private onSocketClose(): void {
    // Генерируем событие закрытия, чтобы приложение могло отреагировать (например, показать уведомление)
    this.dispatchEvent(new CustomEvent('close'));
  }

  /**
   * Отправка данных на сервер.
   * @param data - объект с данными для отправки.
   */
  public send(data: any): void {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn(
        'Невозможно отправить данные. WebSocket не открыт. Текущее состояние:',
        this.socket.readyState,
      );
    }
  }
}
