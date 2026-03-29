/**
 * auth.api.ts — authentication API module.
 *
 * All calls go through the shared Axios instance in client.ts.
 * This file must never import axios directly.
 */

import { apiClient } from './client'

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
 * POST /auth/login
 * Returns a JWT token, user profile, and role on successful authentication.
 */
export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', {
    email,
    password,
  })
  return response.data
}
