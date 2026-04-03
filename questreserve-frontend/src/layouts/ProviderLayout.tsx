import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

/**
 * ProviderLayout — wraps all /provider/* routes.
 * Guard pattern from ui-strategy.md Section 4.6.
 * Renders null during hydration to prevent premature /login redirect
 * on page reload while token restoration is in progress.
 */
export function ProviderLayout() {
  const { token, role, isLoading } = useAuth()

  if (isLoading) return null

  if (!token) return <Navigate to="/login" replace />
  if (role === null) return <Navigate to="/login" replace />
  if (role !== 'provider') return <Navigate to={`/${role}`} replace />

  return <Outlet />
}
