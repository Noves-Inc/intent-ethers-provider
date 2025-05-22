import { JsonRpcRequest } from '../types/jsonrpc';

/**
 * Normalizes a JSON-RPC request payload to ensure it has the correct format
 * @param payload - The payload to normalize
 * @returns A normalized JSON-RPC request
 */
export function normalizePayload(payload: Partial<JsonRpcRequest>): JsonRpcRequest {
  return {
    jsonrpc: '2.0',
    id: payload.id ?? Math.floor(Math.random() * 1000000),
    method: payload.method ?? '',
    params: payload.params ?? [],
  };
} 