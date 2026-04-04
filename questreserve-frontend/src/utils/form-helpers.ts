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
