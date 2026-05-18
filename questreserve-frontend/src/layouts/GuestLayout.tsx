import { Outlet } from 'react-router-dom'
import { HeaderNav } from '@/components/HeaderNav/HeaderNav'
import { SiteFooter } from '@/components/SiteFooter/SiteFooter'

export function GuestLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'rgb(var(--surface))' }}>
      <HeaderNav />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
