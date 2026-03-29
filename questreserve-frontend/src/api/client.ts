/**
 * client.ts — single Axios instance for all API calls.
 *
 * This is the only file in the project that imports axios directly.
 * All other files must use the exported `apiClient` instance or call
 * functions from the domain-specific API modules (auth.api.ts, etc.).
 *
 * Token injection pattern:
 * AuthContext holds the token in React state. To avoid a circular
 * dependency (client.ts -> AuthContext -> client.ts), we expose a
 * module-level setter (setAuthToken) that AuthContext calls whenever
 * the token changes. The request interceptor reads from this module-level
 * reference. This keeps the Axios instance stateless.
 */

import axios from 'axios'

// ---------------------------------------------------------------------------
// Module-level token store
// ---------------------------------------------------------------------------

let _token: string | null = null

/**
 * Called by AuthContext whenever the token changes (on login and logout).
 * This is the only mechanism for injecting auth state into the API layer.
 */
export function setAuthToken(token: string | null): void {
  _token = token
}

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ---------------------------------------------------------------------------
// Request interceptor — inject Authorization header
// ---------------------------------------------------------------------------

apiClient.interceptors.request.use((config) => {
  if (_token) {
    config.headers.Authorization = `Bearer ${_token}`
  }
  return config
})

// ---------------------------------------------------------------------------
// Response interceptor — handle 401 (unauthenticated)
// ---------------------------------------------------------------------------

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      // Clear the module-level token and redirect to /login.
      // Full state cleanup happens in AuthContext.logout(), but a 401
      // interceptor must also handle the case where the token expires
      // mid-session without an explicit logout.
      setAuthToken(null)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)
