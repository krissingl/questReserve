import { apiClient } from './client'
import type { UserRole } from '@/contexts/AuthContext'

export interface AuthTokenResponse {
  token: string
}

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

export function tokenTypeToRole(type: JwtPayload['type']): UserRole {
  if (type === 'end_user') return 'customer'
  if (type === 'provider') return 'provider'
  return 'admin'
}
