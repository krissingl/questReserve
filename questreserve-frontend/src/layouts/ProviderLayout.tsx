import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { HeaderNav } from '@/components/HeaderNav/HeaderNav'

export function ProviderLayout() {
  const { token, role, isLoading } = useAuth()

  if (isLoading) return null

  if (!token || role === null) return <Navigate to="/login" replace />
  if (role !== 'provider') return <Navigate to={`/${role}`} replace />

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(var(--surface))' }}>
      <HeaderNav />
      <Outlet />
    </div>
  )
}
