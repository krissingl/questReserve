/**
 * auth.api.ts — stub
 *
 * Full implementation is in ticket #67. This stub exists so AuthContext
 * can import login() before the API client layer is complete.
 *
 * All backend calls must go through src/api/client.ts (Axios instance).
 * This file must never import axios directly.
 */

export interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    displayName: string
  }
  role: 'customer' | 'provider' | 'admin'
}

/**
 * Stub login function. Replaced in ticket #67 with a real implementation
 * that calls POST /auth/login via the Axios client.
 */
export async function login(
  _email: string,
  _password: string,
): Promise<LoginResponse> {
  // Stub: always rejects to prevent accidental auth bypass during development
  return Promise.reject(new Error('auth.api.ts: login not yet implemented'))
}
