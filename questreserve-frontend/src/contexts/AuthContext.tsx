import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import { login as apiLogin } from '@/api/auth.api'
import { setAuthToken } from '@/api/client'

// ---------------------------------------------------------------------------
// Types — exact shape from ui-strategy.md Section 4.4
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: string
  email: string
  displayName: string
}

export type UserRole = 'customer' | 'provider' | 'admin'

export interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  role: UserRole | null
  isLoading: boolean
  login: (email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
}

// ---------------------------------------------------------------------------
// localStorage persistence helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'qr_auth'

interface PersistedAuth {
  user: AuthUser
  token: string
  role: UserRole
}

function isUserRole(value: unknown): value is UserRole {
  return value === 'customer' || value === 'provider' || value === 'admin'
}

function isPersistedAuth(value: unknown): value is PersistedAuth {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  if (typeof v.token !== 'string' || !isUserRole(v.role)) return false
  if (typeof v.user !== 'object' || v.user === null) return false
  const u = v.user as Record<string, unknown>
  return (
    typeof u.id === 'string' &&
    typeof u.email === 'string' &&
    typeof u.displayName === 'string'
  )
}

/** Returns true if the JWT's exp claim is in the past. */
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    const payload = JSON.parse(atob(parts[1])) as Record<string, unknown>
    if (typeof payload.exp !== 'number') return false // no exp — treat as valid
    return Date.now() / 1000 > payload.exp
  } catch {
    return true
  }
}

function saveAuth(user: AuthUser, token: string, role: UserRole): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token, role }))
  } catch {
    // localStorage quota or security errors are non-fatal
  }
}

function clearAuth(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // non-fatal
  }
}

function loadAuth(): PersistedAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isPersistedAuth(parsed)) return null
    if (isTokenExpired(parsed.token)) {
      clearAuth()
      return null
    }
    return parsed
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Hydration: restore persisted auth state via lazy initialiser so no
  // useEffect is needed — avoids react-hooks/set-state-in-effect lint error.
  // isLoading starts true and is set false synchronously after the read.
  // Because loadAuth() is synchronous (localStorage is synchronous), this is
  // safe: the initial render already has the correct values.
  const [user, setUser] = useState<AuthUser | null>(() => loadAuth()?.user ?? null)
  const [token, setToken] = useState<string | null>(() => loadAuth()?.token ?? null)
  const [role, setRole] = useState<UserRole | null>(() => loadAuth()?.role ?? null)

  // isLoading is always false on mount because the lazy initialisers run
  // synchronously before the first render. It exists in the interface so that
  // layout guards can suspend redirect logic — this is correct: on mount
  // `isLoading` is false and values are already populated.
  const [isLoading] = useState<boolean>(false)

  // Keep the Axios client's module-level token in sync with React state.
  useEffect(() => {
    setAuthToken(token)
  }, [token])

  const login = useCallback(
    // _loginRole is accepted here for API compatibility with layout guards and
    // auth pages. Ticket #74 will replace this stub and route to the correct
    // endpoint based on role.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (email: string, password: string, _loginRole: UserRole) => {
      const response = await apiLogin(email, password)
      setToken(response.token)
      setUser(response.user)
      setRole(response.role)
      saveAuth(response.user, response.token, response.role)
    },
    [],
  )

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    setRole(null)
    clearAuth()
    // setAuthToken(null) is called automatically via the useEffect above.
    // AuthContext is above the router so useNavigate is not available here.
    // window.location.href causes a full navigation to /login and clears any
    // in-memory state that survived the component unmount.
    window.location.href = '/login'
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, role, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Convenience hook
// ---------------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components -- context file exports provider, hook, and types together per ui-strategy.md Section 4.4
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
