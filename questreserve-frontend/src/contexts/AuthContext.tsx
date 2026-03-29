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
  login: (email: string, password: string) => Promise<void>
  logout: () => void
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
  // Token is stored in React state (in-memory). localStorage is not used
  // as the permanent storage mechanism — see ui-strategy.md Section 4.3.
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)

  // Keep the Axios client's module-level token in sync with React state.
  // This is required so request interceptors in client.ts can inject the
  // Authorization header without importing AuthContext directly.
  useEffect(() => {
    setAuthToken(token)
  }, [token])

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiLogin(email, password)
    setToken(response.token)
    setUser(response.user)
    setRole(response.role)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    setRole(null)
    // setAuthToken(null) is called automatically via the useEffect above.
    // AuthContext is above the router so useNavigate is not available here.
    // window.location.href causes a full navigation to /login and clears any
    // in-memory state that survived the component unmount.
    window.location.href = '/login'
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, role, login, logout }}>
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
