import { Outlet } from 'react-router-dom'
import { HeaderNav } from '@/components/HeaderNav/HeaderNav'

export function GuestLayout() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(var(--surface))' }}>
      <HeaderNav />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
