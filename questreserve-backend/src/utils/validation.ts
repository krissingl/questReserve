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
