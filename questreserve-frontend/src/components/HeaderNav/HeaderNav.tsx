import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import logoLockup from '@/assets/logo-primary-white-gold.svg'

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  color: isActive ? 'rgb(var(--accent))' : 'rgb(var(--foreground))',
})

export function HeaderNav() {
  const { token, role, logout } = useAuth()

  const logoHref = !token
    ? '/locations'
    : role === 'customer'
      ? '/customer'
      : role === 'provider'
        ? '/provider'
        : '/admin'

  return (
    <header
      className="flex w-full items-center gap-6 px-6 py-3"
      style={{ backgroundColor: 'rgb(var(--background))', position: 'sticky', top: 0, zIndex: 100 }}
    >
      <Link to={logoHref} className="flex-shrink-0">
        <img src={logoLockup} alt="QuestReserve" style={{ height: '40px' }} />
      </Link>

      <nav className="flex flex-1 items-center gap-4">
        {!token && (
          <>
            <NavLink to="/locations" style={navLinkStyle} className="text-sm font-medium transition-colors hover:opacity-80">
              Browse Adventures
            </NavLink>
            <NavLink to="/about" style={navLinkStyle} className="text-sm font-medium transition-colors hover:opacity-80">
              About
            </NavLink>
            <NavLink to="/login" style={navLinkStyle} className="text-sm font-medium transition-colors hover:opacity-80">
              Login
            </NavLink>
          </>
        )}

        {token && role === 'customer' && (
          <>
            <NavLink to="/locations" style={navLinkStyle} className="text-sm font-medium transition-colors hover:opacity-80">
              Browse Adventures
            </NavLink>
            <NavLink to="/about" style={navLinkStyle} className="text-sm font-medium transition-colors hover:opacity-80">
              About
            </NavLink>
            <NavLink to="/customer/bookings" style={navLinkStyle} className="text-sm font-medium transition-colors hover:opacity-80">
              My Bookings
            </NavLink>
            <NavLink to="/customer/settings" style={navLinkStyle} className="text-sm font-medium transition-colors hover:opacity-80">
              Settings
            </NavLink>
            <button
              type="button"
              onClick={logout}
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'rgb(var(--foreground))' }}
            >
              Log Out
            </button>
          </>
        )}

        {token && role === 'provider' && (
          <>
            <NavLink to="/about" style={navLinkStyle} className="text-sm font-medium transition-colors hover:opacity-80">
              About
            </NavLink>
            <NavLink to="/provider" style={navLinkStyle} className="text-sm font-medium transition-colors hover:opacity-80">
              Dashboard
            </NavLink>
            <button
              type="button"
              onClick={logout}
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'rgb(var(--foreground))' }}
            >
              Log Out
            </button>
          </>
        )}

        {token && role === 'admin' && (
          <>
            <NavLink to="/about" style={navLinkStyle} className="text-sm font-medium transition-colors hover:opacity-80">
              About
            </NavLink>
            <NavLink to="/admin" style={navLinkStyle} className="text-sm font-medium transition-colors hover:opacity-80">
              Dashboard
            </NavLink>
            <button
              type="button"
              onClick={logout}
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'rgb(var(--foreground))' }}
            >
              Log Out
            </button>
          </>
        )}
      </nav>
    </header>
  )
}
