import { useEffect, useRef, useState } from 'react'
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
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (!dropdownOpen) return
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [dropdownOpen])

  const logoHref = !token
    ? '/locations'
    : role === 'customer'
      ? '/locations'
      : role === 'provider'
        ? '/provider'
        : '/admin'

  return (
    <header
      className="flex w-full items-center gap-6 px-6"
      style={{ backgroundColor: 'rgb(var(--background))', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgb(var(--border))', height: '52px' }}
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
            fontSize: '1.25rem',
            color: 'rgb(var(--accent))',
            letterSpacing: '0.03em',
          }}
        >
          QuestReserve
        </span>
      </Link>

      <nav className="flex flex-1 items-center justify-end gap-8 self-stretch">
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
          </>
        )}

        {token && (role === 'provider' || role === 'admin') && (
          <NavLink to={`/${role}`} style={navLinkStyle} className="text-sm font-medium transition-colors hover:opacity-80">
            Dashboard
          </NavLink>
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
        ) : role === 'customer' && customerProfile ? (
          <div ref={dropdownRef} style={{ position: 'relative', alignSelf: 'stretch', display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem 0',
              }}
            >
              <AvatarIcon firstName={customerProfile.firstName} lastName={customerProfile.lastName} size="sm" pictureUrl={customerProfile.pictureUrl} />
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                style={{
                  color: 'rgb(var(--muted-foreground))',
                  flexShrink: 0,
                  transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.18s ease',
                }}
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: '-1.5rem',
                minWidth: '220px',
                backgroundColor: 'rgb(var(--background))',
                border: '1px solid rgb(var(--border))',
                borderTop: 'none',
                boxShadow: '0 6px 16px rgba(0,0,0,0.10)',
                overflow: 'hidden',
                zIndex: 200,
                opacity: dropdownOpen ? 1 : 0,
                transform: dropdownOpen ? 'translateY(0)' : 'translateY(-6px)',
                pointerEvents: dropdownOpen ? 'auto' : 'none',
                transition: 'opacity 0.18s ease, transform 0.18s ease',
              }}
            >
              <div
                style={{
                  padding: '0.625rem 1rem',
                  fontSize: 'var(--text-sm)',
                  color: 'rgb(var(--muted-foreground))',
                  borderBottom: '1px solid rgb(var(--border))',
                }}
              >
                {customerProfile.firstName} {customerProfile.lastName}
              </div>
              <Link
                to="/customer/settings"
                onClick={() => setDropdownOpen(false)}
                style={{
                  display: 'block',
                  padding: '0.625rem 1rem',
                  fontSize: 'var(--text-sm)',
                  color: 'rgb(var(--foreground))',
                  textDecoration: 'none',
                }}
                className="transition-colors hover:opacity-80"
              >
                My Account
              </Link>
              <button
                type="button"
                onClick={() => { setDropdownOpen(false); logout() }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.625rem 1rem',
                  fontSize: 'var(--text-sm)',
                  color: 'rgb(var(--foreground))',
                  background: 'none',
                  border: 'none',
                  borderTop: '1px solid rgb(var(--border))',
                  cursor: 'pointer',
                }}
                className="transition-colors hover:opacity-80"
              >
                Log Out
              </button>
            </div>
          </div>
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
