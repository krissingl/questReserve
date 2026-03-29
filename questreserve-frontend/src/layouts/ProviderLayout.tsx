import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

/**
 * ProviderLayout — wraps all /provider/* routes.
 * Guard pattern from ui-strategy.md Section 4.6.
 */
export function ProviderLayout() {
  const { token, role } = useAuth()

  if (!token) return <Navigate to="/login" replace />
  if (role === null) return <Navigate to="/login" replace />
  if (role !== 'provider') return <Navigate to={`/${role}`} replace />

  return <Outlet />
}
