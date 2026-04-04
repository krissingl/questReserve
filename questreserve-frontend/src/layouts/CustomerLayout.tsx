import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

/**
 * CustomerLayout — wraps all /customer/* routes.
 * Guard pattern from ui-strategy.md Section 4.6.
 * Renders null during hydration to prevent premature /login redirect
 * on page reload while token restoration is in progress.
 */
export function CustomerLayout() {
  const { token, role, isLoading } = useAuth()

  if (isLoading) return null

  if (!token || !role) return <Navigate to="/login" replace />
  if (role !== 'customer') return <Navigate to={`/${role}`} replace />

  return <Outlet />
}
