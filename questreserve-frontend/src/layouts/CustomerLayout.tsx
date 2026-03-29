import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

/**
 * CustomerLayout — wraps all /customer/* routes.
 * Guard pattern from ui-strategy.md Section 4.6.
 */
export function CustomerLayout() {
  const { token, role } = useAuth()

  if (!token) return <Navigate to="/login" replace />
  if (role === null) return <Navigate to="/login" replace />
  if (role !== 'customer') return <Navigate to={`/${role}`} replace />

  return <Outlet />
}
