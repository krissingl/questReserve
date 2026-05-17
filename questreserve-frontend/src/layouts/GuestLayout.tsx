import { Outlet } from 'react-router-dom'
import { HeaderNav } from '@/components/HeaderNav/HeaderNav'
import { SiteFooter } from '@/components/SiteFooter/SiteFooter'

export function GuestLayout() {
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
