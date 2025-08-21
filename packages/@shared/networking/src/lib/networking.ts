/**
 * @shared/networking shared library
 * 
 * This library provides shared functionality for the SRCDS WebSocket application.
 */

import { BehaviorSubject, Observable } from "rxjs";
import * as net from "net";

export interface NetworkingConfig {
  // Add configuration options here
  host?: string;
  port?: number;
}

export interface TCPSocketResponse {
  client?: net.Socket;
  event?: 'connect' | 'data' | 'error' | 'close';
  data?: Buffer;
  error?: Error;
}

export class TCPSocket {
  private readonly observable: BehaviorSubject<TCPSocketResponse>;
  private config: NetworkingConfig;
  private socket!: net.Socket;

  private static instance: TCPSocket;


  private constructor(config: NetworkingConfig = {}) {
    this.config = config;
    this.observable = new BehaviorSubject<TCPSocketResponse>({});
  }

  public static get Instance(): TCPSocket {
    if (!TCPSocket.instance) {
      TCPSocket.instance = new TCPSocket();
    }
    return TCPSocket.instance;
  }

  public send(data: ArrayBuffer): void
  public send(data: Uint8Array): void
  public send(data: Buffer | ArrayBuffer | Uint8Array): void {

    if (!this.socket || !this.socket.writable) {
      console.error('Socket is not connected or writable');
      return;
    }

    let arr: Uint8Array;
    if (Buffer.isBuffer(data)) {
      arr = new Uint8Array(data);
      return;
    } else if (data instanceof ArrayBuffer) {
      arr = new Uint8Array(data);
    } else {
      arr = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    }

    this.socket.write(arr, (err) => {
      if (err) {
        console.error('Error sending data:', err);
        this.observable.next({ client: this.socket, error: err, event: 'error' });
      } else {
        console.log('Data sent successfully');
      }
    });
  }

  /**
   * Sets the configuration for the networking instance.
   * @param config - The configuration object.
   */
  public setConfig(config: NetworkingConfig): void {
    this.config = config;
    this.setupSocket();
  }

  public asObservable(): Observable<TCPSocketResponse> {
    return this.observable.asObservable();
  }

  private setupSocket(): TCPSocket {

    if (this.socket) {
      this.socket.destroy();
    }

    this.socket = new net.Socket();

    if (!this.config.host || !this.config.port) {
      console.warn('No host or port specified, using defaults: localhost:27015');
      return this;
    }

    this.socket.connect(
      {
        host: this.config.host,
        port: this.config.port
      },
      () => {
        this.observable.next({ client: this.socket, event: 'connect' });
      }
    )

    this.socket.on('data', (data: Buffer) => {
      console.log('Data received:', data);
      this.observable.next({ client: this.socket, data: data, event: 'data' });
    });

    this.socket.on('error', (err: Error) => {
      console.error('Socket error:', err);
      this.observable.next({ client: this.socket, error: err, event: 'error' });
    });

    this.socket.on('close', () => {
      console.log('Socket closed');
      this.observable.next({ client: this.socket, data: undefined, event: 'close' });
    });

    return this;

  }

}

// Export the main class and any utilities
export default TCPSocket; 
