import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { HeaderNav } from '@/components/HeaderNav/HeaderNav'
import { SiteFooter } from '@/components/SiteFooter/SiteFooter'

export function AdminLayout() {
  const { token, role, isLoading } = useAuth()

  if (isLoading) return null

  if (!token || role === null) return <Navigate to="/login" replace />
  if (role !== 'admin') return <Navigate to={`/${role}`} replace />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'rgb(var(--surface))' }}>
      <HeaderNav />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
