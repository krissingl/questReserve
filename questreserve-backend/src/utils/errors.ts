export class UnauthenticatedError extends Error {
  constructor() {
    super('Missing or invalid Authorization header');
    this.name = 'UnauthenticatedError';
  }
}
