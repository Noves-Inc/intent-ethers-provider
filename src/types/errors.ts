/**
 * Base error class for all Intent Provider errors
 * Extends the standard Error class with additional properties for error categorization
 * and data payload
 */
export class IntentProviderError extends Error {
  constructor(
    message: string,
    /** Error code for categorizing the type of error */
    public readonly code: string,
    /** Optional additional error data */
    public readonly data?: unknown
  ) {
    super(message);
    this.name = 'IntentProviderError';
  }
}

/**
 * Error codes for different types of errors that can occur during provider operations
 * These codes are used to categorize and handle different error scenarios
 */
export const ErrorCodes = {
  /** The request was malformed or invalid */
  INVALID_REQUEST: 'INVALID_REQUEST',
  /** A network-related error occurred (connection, timeout, etc.) */
  NETWORK_ERROR: 'NETWORK_ERROR',
  /** The request timed out */
  TIMEOUT: 'TIMEOUT',
  /** The response was malformed or invalid */
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  /** Authentication failed or missing credentials */
  UNAUTHORIZED: 'UNAUTHORIZED',
  /** Too many requests, rate limit exceeded */
  RATE_LIMITED: 'RATE_LIMITED',
} as const;

/**
 * Creates a network error
 * Used for errors related to network connectivity, timeouts, or other network issues
 */
export function createNetworkError(message: string, data?: unknown): IntentProviderError {
  return new IntentProviderError(message, ErrorCodes.NETWORK_ERROR, data);
}

/**
 * Creates a timeout error
 * Used when a request exceeds its maximum allowed time
 */
export function createTimeoutError(message: string): IntentProviderError {
  return new IntentProviderError(message, ErrorCodes.TIMEOUT);
}

/**
 * Creates an invalid response error
 * Used when the response from the server is malformed or doesn't match expected format
 */
export function createInvalidResponseError(message: string, data?: unknown): IntentProviderError {
  return new IntentProviderError(message, ErrorCodes.INVALID_RESPONSE, data);
}

/**
 * Creates an unauthorized error
 * Used when authentication fails or credentials are missing
 */
export function createUnauthorizedError(message: string): IntentProviderError {
  return new IntentProviderError(message, ErrorCodes.UNAUTHORIZED);
}

/**
 * Creates a rate limit error
 * Used when too many requests are made in a given time period
 */
export function createRateLimitError(message: string): IntentProviderError {
  return new IntentProviderError(message, ErrorCodes.RATE_LIMITED);
} 