/**
 * Shared application error classes used across router modules.
 */

export class UnauthenticatedError extends Error {
  constructor() {
    super('Missing or invalid Authorization header');
    this.name = 'UnauthenticatedError';
  }
}
