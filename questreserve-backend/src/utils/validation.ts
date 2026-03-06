/**
 * Validates that all specified fields are present as non-empty strings on the request body.
 * Returns an error message string if validation fails, or null if all fields pass.
 *
 * Note: validateBody in src/api/auth/index.ts is a superset of this function —
 * it adds a 72-character password length check required by bcrypt. It is kept
 * separate intentionally rather than unified here.
 */
export function validateRequiredStrings(body: unknown, fields: string[]): string | null {
  if (typeof body !== 'object' || body === null) return 'Request body must be a JSON object';
  const b = body as Record<string, unknown>;
  for (const field of fields) {
    if (typeof b[field] !== 'string' || (b[field] as string).trim() === '') {
      return `${field} is required`;
    }
  }
  return null;
}
