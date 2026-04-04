import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function CustomerLayout() {
  const { token, role, isLoading } = useAuth()

  if (isLoading) return null

  if (!token || role === null) return <Navigate to="/login" replace />
  if (role !== 'customer') return <Navigate to={`/${role}`} replace />

  return <Outlet />
}
