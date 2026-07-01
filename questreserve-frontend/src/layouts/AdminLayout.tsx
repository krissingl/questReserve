import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AdminSidebar } from '@/components/AdminSidebar/AdminSidebar'

export function AdminLayout() {
  const { token, role, isLoading } = useAuth()

  if (isLoading) return null

  if (!token || role === null) return <Navigate to="/admin/login" replace />
  if (role !== 'admin') return <Navigate to={`/${role}`} replace />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'rgb(var(--surface))' }}>
      <AdminSidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Outlet />
      </main>
    </div>
  )
}
