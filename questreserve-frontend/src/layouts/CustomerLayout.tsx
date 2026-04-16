import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import logoLockup from '@/assets/logo-primary-white-gold.svg'

export function CustomerLayout() {
  const { token, role, isLoading, logout } = useAuth()

  if (isLoading) return null

  if (!token || role === null) return <Navigate to="/login" replace />
  if (role !== 'customer') return <Navigate to={`/${role}`} replace />

  return (
    <div className="flex min-h-screen">
      <nav
        className="flex w-56 flex-shrink-0 flex-col px-4 py-6"
        style={{ backgroundColor: 'rgb(var(--background))' }}
      >
        <img
          src={logoLockup}
          alt="QuestReserve"
          className="mb-8"
          style={{ height: '40px' }}
        />

        <div className="flex flex-col gap-1">
          <NavLink
            to="/customer"
            end
            className="rounded px-3 py-2 text-sm font-medium transition-colors"
            style={({ isActive }) => ({
              color: isActive ? 'rgb(var(--accent))' : 'rgb(var(--foreground))',
              backgroundColor: isActive ? 'rgb(var(--accent) / 0.1)' : 'transparent',
            })}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/customer/locations"
            className="rounded px-3 py-2 text-sm font-medium transition-colors"
            style={({ isActive }) => ({
              color: isActive ? 'rgb(var(--accent))' : 'rgb(var(--foreground))',
              backgroundColor: isActive ? 'rgb(var(--accent) / 0.1)' : 'transparent',
            })}
          >
            Locations
          </NavLink>

          <NavLink
            to="/customer/bookings"
            className="rounded px-3 py-2 text-sm font-medium transition-colors"
            style={({ isActive }) => ({
              color: isActive ? 'rgb(var(--accent))' : 'rgb(var(--foreground))',
              backgroundColor: isActive ? 'rgb(var(--accent) / 0.1)' : 'transparent',
            })}
          >
            My Bookings
          </NavLink>
        </div>

        <div className="mt-auto flex flex-col gap-1">
          <NavLink
            to="/customer/settings"
            className="rounded px-3 py-2 text-sm font-medium transition-colors"
            style={({ isActive }) => ({
              color: isActive ? 'rgb(var(--accent))' : 'rgb(var(--foreground))',
              backgroundColor: isActive ? 'rgb(var(--accent) / 0.1)' : 'transparent',
            })}
          >
            Settings
          </NavLink>

          <button
            type="button"
            onClick={logout}
            className="w-full rounded px-3 py-2 text-left text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'rgb(var(--muted-foreground))' }}
          >
            Log Out
          </button>
        </div>
      </nav>

      <div className="flex-1" style={{ backgroundColor: 'rgb(var(--surface))' }}>
        <Outlet />
      </div>
    </div>
  )
}
