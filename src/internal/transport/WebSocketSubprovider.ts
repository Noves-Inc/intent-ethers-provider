/**
 * Internal WebSocket subprovider for handling real-time subscriptions
 * @internal
 * 
 * @remarks
 * This class manages WebSocket connections to the Intent Server for real-time data streaming.
 * It handles connection lifecycle, automatic reconnection, message queuing, and stream management.
 */
import { WebSocketMessage, JsonRpcRequest, JsonRpcResponse } from '../../types/jsonrpc';
import { createNetworkError, createInvalidResponseError } from '../../types/errors';

/**
 * Represents the structure of an intent request
 * Used for all requests to the Intent Server
 */
interface IntentRequest {
  /** Unique identifier for the intent type */
  id: string;
  /** Parameters specific to the intent type */
  params: Record<string, unknown>;
  /** Custom rate limit value (-1 for no limit) */
  cusRateLimit: number;
}

export class WebSocketSubprovider {
  /** Default WebSocket endpoint for the Intent Server */
  public static readonly DEFAULT_URL = "wss://intent-server.noves.fi";

  /** Current WebSocket connection */
  private ws: WebSocket | null = null;
  /** Queue of messages to be sent when connection is established */
  private messageQueue: WebSocketMessage[] = [];
  /** Flag indicating if a connection attempt is in progress */
  private isConnecting = false;
  /** Number of reconnection attempts made */
  private reconnectAttempts = 0;
  /** Maximum number of reconnection attempts */
  private readonly maxReconnectAttempts = 5;
  /** Base delay between reconnection attempts in milliseconds */
  private readonly reconnectDelay = 1000;

  /**
   * Creates a new instance of WebSocketSubprovider
   * @param url - Optional custom URL for the Intent Server
   * @param onMessage - Optional callback for handling incoming messages
   */
  constructor(
    private readonly url: string = WebSocketSubprovider.DEFAULT_URL,
    private readonly onMessage?: (message: WebSocketMessage) => void
  ) {}

  /**
   * Establishes a WebSocket connection to the Intent Server
   * Handles connection events and automatic reconnection
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.flushMessageQueue();
      };

      this.ws.onmessage = (event) => {
        if (this.onMessage) {
          try {
            const message = JSON.parse(event.data) as WebSocketMessage;
            this.onMessage(message);
          } catch (error) {
            throw createInvalidResponseError('Failed to parse WebSocket message');
          }
        }
      };

      this.ws.onclose = () => {
        this.handleDisconnect();
      };

      this.ws.onerror = () => {
        this.handleDisconnect();
      };
    } catch (error) {
      this.isConnecting = false;
      this.handleDisconnect();
    }
  }

  /**
   * Handles WebSocket disconnection and attempts reconnection
   * Implements exponential backoff for reconnection attempts
   */
  private handleDisconnect(): void {
    this.isConnecting = false;
    this.ws = null;

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    } else {
      throw createNetworkError(`WebSocket connection failed after ${this.maxReconnectAttempts} attempts`);
    }
  }

  /**
   * Sends any queued messages when the connection is established
   */
  private flushMessageQueue(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        try {
          this.ws.send(JSON.stringify(message));
        } catch (error) {
          throw createNetworkError('Failed to send queued message');
        }
      }
    }
  }

  /**
   * Sends a message through the WebSocket connection
   * Queues the message if the connection is not ready
   * @param message - The message to send
   */
  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        throw createNetworkError('Failed to send WebSocket message');
      }
    } else {
      this.messageQueue.push(message);
      this.connect();
    }
  }

  /**
   * Closes the WebSocket connection and clears the message queue
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageQueue = [];
    this.reconnectAttempts = 0;
  }

  /**
   * Makes a WebSocket request to the specified endpoint
   * @param endpoint - The endpoint to send the request to (e.g., '/intents')
   * @param data - The intent request data to send
   * @returns Promise resolving to the response data
   * @throws {IntentProviderError} If the request fails or response is invalid
   * 
   * @remarks
   * This method implements a request-response pattern over WebSocket,
   * matching responses to requests using message IDs.
   */
  async post<T>(endpoint: string, data: IntentRequest): Promise<T> {
    return new Promise((resolve, reject) => {
      const messageId = Date.now();
      const message: JsonRpcRequest = {
        jsonrpc: '2.0',
        id: messageId,
        method: 'POST',
        params: [{
          endpoint,
          data
        }]
      };

      const messageHandler = (event: MessageEvent) => {
        try {
          const response = JSON.parse(event.data) as JsonRpcResponse<T>;
          if (response.id === messageId) {
            this.ws?.removeEventListener('message', messageHandler);
            if (response.error) {
              reject(createInvalidResponseError(response.error.message));
            } else if (response.result) {
              resolve(response.result);
            } else {
              reject(createInvalidResponseError('Invalid response format'));
            }
          }
        } catch (error) {
          reject(createInvalidResponseError('Failed to parse WebSocket message'));
        }
      };

      this.ws?.addEventListener('message', messageHandler);
      this.send(message);
    });
  }

  /**
   * Makes a WebSocket request to the specified endpoint and returns an AsyncIterable
   * @param endpoint - The endpoint to send the request to (e.g., '/intents')
   * @param data - The intent request data to send
   * @returns AsyncIterable that yields responses as they arrive
   * @throws {IntentProviderError} If the request fails or response is invalid
   * 
   * @remarks
   * This method establishes a dedicated WebSocket connection for streaming data.
   * It implements a message queue to handle backpressure and ensures proper
   * cleanup of resources when the stream is closed.
   */
  async *stream<T>(endpoint: string, data: IntentRequest): AsyncIterable<T> {
    // Construct the WebSocket URL with query parameters
    const queryParams = new URLSearchParams({
      id: data.id,
      ...Object.fromEntries(
        Object.entries(data.params).map(([key, value]) => [key, String(value)])
      ),
      cusRateLimit: data.cusRateLimit.toString()
    });
    
    const wsUrl = `${this.url}${endpoint}?${queryParams.toString()}`;
    
    // Create a new WebSocket connection for this stream
    const ws = new WebSocket(wsUrl);
    
    // Set up message handling
    const messageQueue: T[] = [];
    let resolveNext: ((value: T) => void) | null = null;

    const messageHandler = (event: MessageEvent) => {
      try {
        const response = JSON.parse(event.data) as T;
        if (resolveNext) {
          resolveNext(response);
          resolveNext = null;
        } else {
          messageQueue.push(response);
        }
      } catch (error) {
        throw createInvalidResponseError('Failed to parse WebSocket message');
      }
    };

    ws.addEventListener('message', messageHandler);

    try {
      // Wait for connection to open
      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => resolve();
        ws.onerror = (error) => reject(createNetworkError(`WebSocket connection failed: ${error}`));
      });

      // Yield responses as they arrive
      while (true) {
        if (messageQueue.length > 0) {
          yield messageQueue.shift()!;
        } else {
          yield await new Promise<T>(resolve => {
            resolveNext = resolve;
          });
        }
      }
    } finally {
      // Clean up
      ws.removeEventListener('message', messageHandler);
      ws.close();
    }
  }
} 