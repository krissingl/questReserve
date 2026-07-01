import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/providers', label: 'Providers', end: false },
  { to: '/admin/bookings', label: 'Bookings', end: false },
  { to: '/admin/users', label: 'Admin Users', end: false },
]

export function AdminSidebar() {
  const { logout } = useAuth()

  return (
    <aside
      style={{
        width: '220px',
        flexShrink: 0,
        backgroundColor: 'rgb(var(--background))',
        borderRight: '1px solid rgb(var(--border))',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 0',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 'var(--weight-bold)',
          fontSize: '1rem',
          color: 'rgb(var(--accent))',
          padding: '0 1.25rem',
          marginBottom: '1.5rem',
          letterSpacing: '0.03em',
        }}
      >
        Admin Panel
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 0.5rem' }}>
        {navItems.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              display: 'block',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              fontSize: 'var(--text-sm)',
              fontWeight: isActive ? 'var(--weight-semibold)' : 'var(--weight-regular)',
              color: isActive ? 'rgb(var(--accent))' : 'rgb(var(--foreground))',
              backgroundColor: isActive ? 'rgb(var(--accent) / 0.1)' : 'transparent',
              textDecoration: 'none',
              transition: 'color 0.15s ease, background-color 0.15s ease',
            })}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '0.5rem 0.5rem 0' }}>
        <button
          type="button"
          onClick={logout}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'left',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            fontSize: 'var(--text-sm)',
            color: 'rgb(var(--muted-foreground))',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Log Out
        </button>
      </div>
    </aside>
  )
}
