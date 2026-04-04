/**
 * Extracts a human-readable error string from an unknown Axios error.
 * Returns the backend's `error` field if present, otherwise the fallback.
 */
export function extractApiError(err: unknown, fallback: string): string {
  if (
    err !== null &&
    typeof err === 'object' &&
    'response' in err &&
    err.response !== null &&
    typeof err.response === 'object' &&
    'data' in err.response &&
    err.response.data !== null &&
    typeof err.response.data === 'object' &&
    'error' in err.response.data &&
    typeof (err.response.data as Record<string, unknown>).error === 'string'
  ) {
    return (err.response.data as Record<string, string>).error
  }
  return fallback
}

/**
 * Extracts a human-readable error string from a login attempt.
 * Returns a 401-specific message for credential errors and a generic
 * network/server message for everything else (network failures, 5xx, etc.).
 */
export function extractLoginError(err: unknown): string {
  if (
    err !== null &&
    typeof err === 'object' &&
    'response' in err &&
    err.response !== null &&
    typeof err.response === 'object' &&
    'status' in err.response &&
    (err.response as { status: unknown }).status === 401
  ) {
    return 'Invalid email or password.'
  }
  return 'Something went wrong. Please try again later.'
}
