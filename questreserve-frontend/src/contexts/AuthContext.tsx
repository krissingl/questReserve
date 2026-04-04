import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import {
  loginEndUser,
  loginProvider,
  loginAdmin,
  decodeToken,
  tokenTypeToRole,
} from '@/api/auth.api'
import { setAuthToken } from '@/api/client'

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
  loginWithToken: (token: string, user: AuthUser, role: UserRole) => void
  logout: () => void
}

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

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(parts[1].length / 4) * 4, '=')
    const payload = JSON.parse(atob(base64)) as Record<string, unknown>
    if (typeof payload.exp !== 'number') return false
    return Date.now() / 1000 > payload.exp
  } catch {
    return true
  }
}

function saveAuth(user: AuthUser, token: string, role: UserRole): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token, role }))
  } catch {
  }
}

function clearAuth(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
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

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initial = loadAuth()
  const [user, setUser] = useState<AuthUser | null>(initial?.user ?? null)
  const [token, setToken] = useState<string | null>(initial?.token ?? null)
  const [role, setRole] = useState<UserRole | null>(initial?.role ?? null)

  const [isLoading] = useState<boolean>(false)

  useEffect(() => {
    setAuthToken(token)
  }, [token])

  const loginWithToken = useCallback(
    (newToken: string, newUser: AuthUser, newRole: UserRole) => {
      setToken(newToken)
      setUser(newUser)
      setRole(newRole)
      saveAuth(newUser, newToken, newRole)
    },
    [],
  )

  const login = useCallback(
    async (email: string, password: string, loginRole: UserRole) => {
      let responseToken: string

      if (loginRole === 'customer') {
        const res = await loginEndUser(email, password)
        responseToken = res.token
      } else if (loginRole === 'provider') {
        const res = await loginProvider(email, password)
        responseToken = res.token
      } else {
        const res = await loginAdmin(email, password)
        responseToken = res.token
      }

      setAuthToken(responseToken)

      const payload = decodeToken(responseToken)
      if (!payload) throw new Error('Received an invalid token from the server')

      const resolvedRole = tokenTypeToRole(payload.type)
      const authUser: AuthUser = {
        id: payload.sub,
        email,
        displayName: email,
      }

      setToken(responseToken)
      setUser(authUser)
      setRole(resolvedRole)
      saveAuth(authUser, responseToken, resolvedRole)
    },
    [],
  )

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    setRole(null)
    clearAuth()
    window.location.href = '/login'
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, token, role, isLoading, login, loginWithToken, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
