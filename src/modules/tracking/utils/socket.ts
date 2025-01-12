export type SocketCallback = (message: any) => void;
export type SocketErrorCallback = (error: Event) => void;

export class WebSocketClient {
  private socket: WebSocket | null = null;
  private url: string;
  private messageCallback: SocketCallback;
  private errorCallback: SocketErrorCallback;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(
    url: string,
    messageCallback: SocketCallback,
    errorCallback: SocketErrorCallback
  ) {
    this.url = url;
    this.messageCallback = messageCallback;
    this.errorCallback = errorCallback;
  }

  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    this.socket = new WebSocket(this.url);

    this.socket.onmessage = async (event: MessageEvent) => {
      try {
        let data: any;
        if (event.data instanceof Blob) {
          data = await this.readBlob(event.data);
        } else {
          data = event.data;
        }
        this.messageCallback(data);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    this.socket.onerror = (error: Event) => {
      this.errorCallback(error);
    };

    this.socket.onclose = () => {
      this.handleDisconnect();
    };
  }

  private async readBlob(blob: Blob): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result as string;
          const data = JSON.parse(text);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(blob);
    });
  }

  private handleDisconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  send(data: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
