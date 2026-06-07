import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getInbox } from '@/api/provider.api'
import { getMyCustomerProfile } from '@/api/customer.api'
import { AvatarIcon } from '@/components/AvatarIcon/AvatarIcon'

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  color: isActive ? 'rgb(var(--accent))' : 'rgb(var(--foreground))',
})

interface CustomerNavProfile {
  firstName: string
  lastName: string
  pictureUrl: string | null
}

export function HeaderNav() {
  const { token, role, logout } = useAuth()
  const { pathname } = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)
  const [customerProfile, setCustomerProfile] = useState<CustomerNavProfile | null>(null)

  useEffect(() => {
    if (!token || role !== 'customer') return
    getInbox()
      .then((entries) => {
        setUnreadCount(entries.reduce((sum, e) => sum + e.unread_count, 0))
      })
      .catch(() => {})
  }, [token, role, pathname])

  useEffect(() => {
    if (!token || role !== 'customer') return
    getMyCustomerProfile()
      .then((p) => setCustomerProfile({ firstName: p.first_name, lastName: p.last_name, pictureUrl: p.profile_picture_url }))
      .catch(() => {})
  }, [token, role])

  const logoHref = !token
    ? '/locations'
    : role === 'customer'
      ? '/locations'
      : role === 'provider'
        ? '/provider'
        : '/admin'

  return (
    <header
      className="flex w-full items-center gap-6 px-6 py-3"
      style={{ backgroundColor: 'rgb(var(--background))', position: 'sticky', top: 0, zIndex: 100 }}
    >
      <Link
        to={logoHref}
        className="flex-shrink-0"
        style={{ textDecoration: 'none' }}
      >
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--weight-bold)',
            fontSize: '1rem',
            color: 'rgb(var(--accent))',
            letterSpacing: '0.03em',
          }}
        >
          QuestReserve
        </span>
      </Link>

      <nav className="flex flex-1 items-center justify-end gap-8">
        {(!token || role === 'customer') && (
          <NavLink to="/locations" style={navLinkStyle} className="text-sm font-medium transition-colors hover:opacity-80">
            Browse Adventures
          </NavLink>
        )}

        {token && role === 'customer' && (
          <>
            <NavLink to="/customer/bookings" style={navLinkStyle} className="text-sm font-medium transition-colors hover:opacity-80">
              My Bookings
            </NavLink>
            <NavLink
              to="/customer/messages"
              style={navLinkStyle}
              className="text-sm font-medium transition-colors hover:opacity-80"
            >
              <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', paddingRight: unreadCount > 0 ? '12px' : undefined }}>
                Messages
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-14px',
                      minWidth: '16px',
                      height: '16px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'rgb(var(--accent))',
                      color: 'rgb(var(--accent-foreground))',
                      fontSize: '0.6rem',
                      fontWeight: 'var(--weight-bold)',
                      textAlign: 'center',
                      lineHeight: '16px',
                      padding: '0 4px',
                      pointerEvents: 'none',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </span>
            </NavLink>
            <NavLink to="/customer/settings" style={navLinkStyle} className="text-sm font-medium transition-colors hover:opacity-80">
              Settings
            </NavLink>
          </>
        )}

        {token && (role === 'provider' || role === 'admin') && (
          <NavLink to={`/${role}`} style={navLinkStyle} className="text-sm font-medium transition-colors hover:opacity-80">
            Dashboard
          </NavLink>
        )}

        {token && role === 'customer' && customerProfile && (
          <Link
            to="/customer/settings"
            className="transition-colors hover:opacity-80"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: 'var(--text-sm)',
              color: 'rgb(var(--muted-foreground))',
              textDecoration: 'none',
            }}
          >
            <AvatarIcon firstName={customerProfile.firstName} lastName={customerProfile.lastName} size="sm" pictureUrl={customerProfile.pictureUrl} />
            <span>{customerProfile.firstName} {customerProfile.lastName}</span>
          </Link>
        )}

        {!token && (
          <NavLink to="/about" style={navLinkStyle} className="text-sm font-medium transition-colors hover:opacity-80">
            About
          </NavLink>
        )}

        {!token ? (
          <NavLink to="/login" style={navLinkStyle} className="text-sm font-medium transition-colors hover:opacity-80">
            Login
          </NavLink>
        ) : (
          <button
            type="button"
            onClick={logout}
            className="text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'rgb(var(--foreground))' }}
          >
            Log Out
          </button>
        )}
      </nav>
    </header>
  )
}
