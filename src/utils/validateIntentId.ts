/**
 * Validates an intent ID to ensure it matches the expected format
 * @param intentId - The intent ID to validate
 * @returns true if the intent ID is valid, false otherwise
 */
export function validateIntentId(intentId: string): boolean {
  // Intent IDs should be non-empty strings
  if (!intentId || typeof intentId !== 'string') {
    return false;
  }

  // Intent IDs should not contain whitespace
  if (/\s/.test(intentId)) {
    return false;
  }

  // Intent IDs should be at least 1 character long
  if (intentId.length < 1) {
    return false;
  }

  return true;
} 