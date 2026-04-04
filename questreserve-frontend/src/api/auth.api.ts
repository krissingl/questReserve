/**
 * auth.api.ts — authentication API module.
 *
 * All calls go through the shared Axios instance in client.ts.
 * This file must never import axios directly.
 */

import { apiClient } from './client'
import type { UserRole } from '@/contexts/AuthContext'

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

/**
 * The backend auth endpoints return only a token.
 * Role and user identity are encoded in the JWT payload.
 */
export interface AuthTokenResponse {
  token: string
}

// ---------------------------------------------------------------------------
// EndUser
// ---------------------------------------------------------------------------

export interface RegisterEndUserInput {
  first_name: string
  last_name: string
  email: string
  password: string
}

export async function registerEndUser(
  input: RegisterEndUserInput,
): Promise<AuthTokenResponse> {
  const response = await apiClient.post<AuthTokenResponse>(
    '/auth/end-user/register',
    input,
  )
  return response.data
}

export async function loginEndUser(
  email: string,
  password: string,
): Promise<AuthTokenResponse> {
  const response = await apiClient.post<AuthTokenResponse>(
    '/auth/end-user/login',
    { email, password },
  )
  return response.data
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface RegisterProviderInput {
  first_name: string
  last_name: string
  email: string
  password: string
  organization_name?: string
}

export async function registerProvider(
  input: RegisterProviderInput,
): Promise<AuthTokenResponse> {
  const response = await apiClient.post<AuthTokenResponse>(
    '/auth/provider/register',
    input,
  )
  return response.data
}

export async function loginProvider(
  email: string,
  password: string,
): Promise<AuthTokenResponse> {
  const response = await apiClient.post<AuthTokenResponse>(
    '/auth/provider/login',
    { email, password },
  )
  return response.data
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export async function loginAdmin(
  email: string,
  password: string,
): Promise<AuthTokenResponse> {
  const response = await apiClient.post<AuthTokenResponse>(
    '/auth/admin/login',
    { email, password },
  )
  return response.data
}

// ---------------------------------------------------------------------------
// JWT decode helper — extracts sub and type from the token payload.
// Does not verify the signature (server-side verification is authoritative).
// ---------------------------------------------------------------------------

interface JwtPayload {
  sub: string
  type: 'end_user' | 'provider' | 'admin'
  exp?: number
}

function isJwtPayload(value: unknown): value is JwtPayload {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.sub === 'string' &&
    (v.type === 'end_user' || v.type === 'provider' || v.type === 'admin')
  )
}

/**
 * Decodes (without verifying) a JWT and returns its payload.
 * Returns null if the token is malformed.
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(parts[1].length / 4) * 4, '=')
    const payload: unknown = JSON.parse(atob(base64))
    return isJwtPayload(payload) ? payload : null
  } catch {
    return null
  }
}

/**
 * Maps the JWT token type to the frontend UserRole.
 */
export function tokenTypeToRole(type: JwtPayload['type']): UserRole {
  if (type === 'end_user') return 'customer'
  if (type === 'provider') return 'provider'
  return 'admin'
}
