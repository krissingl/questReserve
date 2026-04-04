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
 * Splits a display name string into first_name and last_name for the backend.
 * If only one word is provided, it is used as both first and last name.
 */
export function splitDisplayName(displayName: string): {
  first_name: string
  last_name: string
} {
  const nameParts = displayName.trim().split(/\s+/)
  const first_name = nameParts[0]
  const last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0]
  return { first_name, last_name }
}
