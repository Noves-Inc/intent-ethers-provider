/**
 * Internal HTTP subprovider for handling JSON-RPC requests over HTTP
 * @internal
 * 
 * @remarks
 * This class handles all HTTP-based communication with the Intent Server.
 * It provides methods for sending JSON-RPC requests and handling responses,
 * including proper error handling and response parsing.
 */
import { JsonRpcRequest, JsonRpcResponse } from '../../types/jsonrpc';
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

export class HttpSubprovider {
  /** Default HTTP endpoint for the Intent Server */
  public static readonly DEFAULT_URL = "https://intent-server.noves.fi";

  /**
   * Creates a new instance of HttpSubprovider
   * @param url - Optional custom URL for the Intent Server
   */
  constructor(
    private readonly url: string = HttpSubprovider.DEFAULT_URL
  ) {}

  /**
   * Sends a JSON-RPC request to the Intent Server
   * @param request - The JSON-RPC request to send
   * @returns Promise resolving to the JSON-RPC response
   * @throws {Error} If the request fails or response is invalid
   * 
   * @internal
   */
  async sendRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      const response = await fetch(this.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to send request: ${error.message}`);
      }
      throw new Error('Failed to send request');
    }
  }

  /**
   * Makes a POST request to the specified endpoint
   * @param endpoint - The endpoint to send the request to (e.g., '/intents')
   * @param data - The intent request data to send
   * @returns Promise resolving to the response data
   * @throws {IntentProviderError} If the request fails or response is invalid
   * 
   * @remarks
   * This method handles all POST requests to the Intent Server, including:
   * - Setting appropriate headers
   * - Handling different HTTP status codes
   * - Parsing error responses
   * - Converting network errors to IntentProviderError
   */
  async post<T>(endpoint: string, data: IntentRequest): Promise<T> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      };

      const response = await fetch(`${this.url}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw createInvalidResponseError(`Endpoint not found. Please check the API documentation.`);
        }
        if (response.status === 401) {
          throw createInvalidResponseError(`Unauthorized. Please check your API key.`);
        }
        if (response.status === 400) {
          const errorData = await response.json().catch(() => null);
          throw createInvalidResponseError(
            `Invalid request: ${errorData?.message || response.statusText}`
          );
        }
        throw createNetworkError(`Failed to make POST request: ${response.status} ${response.statusText}`);
      }

      return await response.json() as T;
    } catch (error) {
      if (error instanceof Error) {
        throw createNetworkError(`Error making POST request: ${error.message}`);
      }
      throw createInvalidResponseError('Failed to make POST request');
    }
  }
} 