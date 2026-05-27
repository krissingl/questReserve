import { NavLink, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useMyProfile } from '@/hooks/useMyProfile'
import { SiteFooter } from '@/components/SiteFooter/SiteFooter'

function ProviderNav() {
  const { logout } = useAuth()
  const { data: profile } = useMyProfile()

  const activeLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    color: isActive ? 'rgb(var(--accent))' : 'rgb(var(--foreground))',
    fontWeight: isActive ? 'var(--weight-semibold)' : 'var(--weight-regular)',
    textDecoration: 'none',
    fontSize: 'var(--text-sm)',
    transition: 'color 0.15s ease',
  })

  return (
    <nav
      style={{
        backgroundColor: 'rgb(var(--background))',
        borderBottom: '1px solid rgb(var(--border))',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        height: '52px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 'var(--weight-bold)',
          fontSize: '1rem',
          color: 'rgb(var(--accent))',
          marginRight: '2rem',
          letterSpacing: '0.03em',
        }}
      >
        QuestReserve
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
        <NavLink to="/provider/dashboard" style={activeLinkStyle}>
          Dashboard
        </NavLink>
        <NavLink to="/provider/adventures" style={activeLinkStyle}>
          My Adventures
        </NavLink>
        <NavLink to="/provider/bookings" style={activeLinkStyle}>
          My Bookings
        </NavLink>
        <NavLink to="/provider/account" style={activeLinkStyle}>
          My Account
        </NavLink>
      </div>

      {profile && (
        <span
          style={{
            fontSize: 'var(--text-sm)',
            color: 'rgb(var(--muted-foreground))',
            marginRight: '1.25rem',
          }}
        >
          {profile.first_name} {profile.last_name}
        </span>
      )}

      <button
        type="button"
        onClick={logout}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 'var(--text-sm)',
          color: 'rgb(var(--muted-foreground))',
          padding: '0.25rem 0',
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.color = 'rgb(var(--accent))'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.color = 'rgb(var(--muted-foreground))'
        }}
      >
        Log Out
      </button>
    </nav>
  )
}

export function ProviderLayout() {
  const { token, role, isLoading } = useAuth()

  if (isLoading) return null

  if (!token || role === null) return <Navigate to="/provider/login" replace />
  if (role !== 'provider') return <Navigate to={`/${role}`} replace />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'rgb(var(--surface))' }}>
      <ProviderNav />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
