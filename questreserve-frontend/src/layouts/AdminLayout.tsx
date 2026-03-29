import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

/**
 * AdminLayout — wraps all /admin/* routes.
 * Guard pattern from ui-strategy.md Section 4.6.
 */
export function AdminLayout() {
  const { token, role } = useAuth()

  if (!token) return <Navigate to="/login" replace />
  if (role === null) return <Navigate to="/login" replace />
  if (role !== 'admin') return <Navigate to={`/${role}`} replace />

  return <Outlet />
}
