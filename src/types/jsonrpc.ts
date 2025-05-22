/**
 * JSON-RPC request interface following the JSON-RPC 2.0 specification
 * @see https://www.jsonrpc.org/specification
 */
export interface JsonRpcRequest {
  /** JSON-RPC version, must be "2.0" */
  jsonrpc: '2.0';
  /** Request identifier, used to match responses with requests */
  id: number;
  /** Method to be invoked */
  method: string;
  /** Array of parameters for the method */
  params: unknown[];
}

/**
 * JSON-RPC response interface following the JSON-RPC 2.0 specification
 * @see https://www.jsonrpc.org/specification
 */
export interface JsonRpcResponse<T = unknown> {
  /** JSON-RPC version, must be "2.0" */
  jsonrpc: '2.0';
  /** Request identifier, matches the request id */
  id: number;
  /** Result of the method call, if successful */
  result?: T;
  /** Error object, if the method call failed */
  error?: {
    /** Error code */
    code: number;
    /** Error message */
    message: string;
    /** Additional error data */
    data?: unknown;
  };
}

/**
 * WebSocket message type that can be either a request or response
 * Used for bidirectional communication over WebSocket connections
 */
export type WebSocketMessage = JsonRpcRequest | JsonRpcResponse; 