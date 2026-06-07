import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useMyProfile } from '@/hooks/useMyProfile'
import { SiteFooter } from '@/components/SiteFooter/SiteFooter'
import { AvatarIcon } from '@/components/AvatarIcon/AvatarIcon'
import type { ProviderProfile } from '@/types/domain'

interface ProviderNavProps {
  profile: ProviderProfile | null
}

function ProviderNav({ profile }: ProviderNavProps) {
  const { logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    color: isActive ? 'rgb(var(--accent))' : 'rgb(var(--foreground))',
    fontWeight: isActive ? 'var(--weight-semibold)' : 'var(--weight-regular)',
    textDecoration: 'none',
    fontSize: 'var(--text-sm)',
    transition: 'color 0.15s ease',
  })

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

  return (
    <nav
      style={{
        backgroundColor: 'rgb(var(--background))',
        borderBottom: '1px solid rgb(var(--border))',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
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
      </div>

      {profile && (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
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
            <AvatarIcon firstName={profile.first_name} lastName={profile.last_name} size="sm" pictureUrl={profile.profile_picture_url} />
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              style={{ color: 'rgb(var(--muted-foreground))', flexShrink: 0 }}
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                minWidth: '180px',
                backgroundColor: 'rgb(var(--background))',
                border: '1px solid rgb(var(--border))',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                overflow: 'hidden',
                zIndex: 200,
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
                {profile.first_name} {profile.last_name}
              </div>
              <Link
                to="/provider/account"
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
          )}
        </div>
      )}
    </nav>
  )
}

export interface ProviderLayoutContext {
  profile: ProviderProfile | null
  profileLoading: boolean
  profileError: string | null
  refetchProfile: () => void
}

export function ProviderLayout() {
  const { token, role, isLoading } = useAuth()
  const { data: profile, isLoading: profileLoading, error: profileError, refetch: refetchProfile } = useMyProfile()

  if (isLoading) return null

  if (!token || role === null) return <Navigate to="/provider/login" replace />
  if (role !== 'provider') return <Navigate to={`/${role}`} replace />

  const outletContext: ProviderLayoutContext = { profile, profileLoading, profileError, refetchProfile }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'rgb(var(--surface))' }}>
      <ProviderNav profile={profile} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Outlet context={outletContext} />
      </main>
      <SiteFooter />
    </div>
  )
}
