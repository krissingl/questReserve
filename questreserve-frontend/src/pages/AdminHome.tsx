import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, CalendarCheck, ShieldCheck, Users } from 'lucide-react'
import { getAdminMe, listAdminUsers, listProviders, getPlatformBookings } from '@/api/admin.api'

const sections = [
  {
    to: '/admin/providers',
    label: 'Providers',
    description: 'View and manage provider accounts, plans, and status.',
    icon: Building2,
  },
  {
    to: '/admin/bookings',
    label: 'Bookings',
    description: 'Browse all platform bookings across every provider.',
    icon: CalendarCheck,
  },
  {
    to: '/admin/users',
    label: 'Admin Users',
    description: 'Create, update, and deactivate admin accounts (Superuser only).',
    icon: Users,
  },
]

interface Stats {
  providerCount: number
  activeProviderCount: number
  bookingCount: number
  adminUserCount: number | null
}

export function AdminHome() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadStats() {
      const me = await getAdminMe().catch(() => null)
      const [providers, bookings, adminUsers] = await Promise.all([
        listProviders().catch(() => []),
        getPlatformBookings().catch(() => []),
        me?.role === 'SUPERUSER' ? listAdminUsers().catch(() => null) : Promise.resolve(null),
      ])

      if (cancelled) return
      setStats({
        providerCount: providers.length,
        activeProviderCount: providers.filter((p) => p.status === 'ACTIVE').length,
        bookingCount: bookings.length,
        adminUserCount: adminUsers ? adminUsers.length : null,
      })
    }

    loadStats()
    return () => { cancelled = true }
  }, [])

  const statCards = [
    { label: 'Total Providers', value: stats?.providerCount, icon: Building2 },
    { label: 'Active Providers', value: stats?.activeProviderCount, icon: ShieldCheck },
    { label: 'Total Bookings', value: stats?.bookingCount, icon: CalendarCheck },
    ...(stats?.adminUserCount !== null && stats?.adminUserCount !== undefined
      ? [{ label: 'Admin Users', value: stats.adminUserCount, icon: Users }]
      : []),
  ]

  return (
    <main className="p-8">
      <h1
        className="mb-2 text-2xl font-bold"
        style={{ fontFamily: 'var(--font-heading)', color: 'rgb(var(--foreground))' }}
      >
        Admin Dashboard
      </h1>
      <p
        className="mb-8 text-sm"
        style={{ color: 'rgb(var(--muted-foreground))' }}
      >
        Welcome to the QuestReserve administration panel.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        {statCards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            style={{
              backgroundColor: 'rgb(var(--card))',
              border: '1px solid rgb(var(--border))',
              borderRadius: '8px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgb(var(--accent) / 0.12)',
                color: 'rgb(var(--accent))',
                flexShrink: 0,
              }}
            >
              <Icon size={22} />
            </div>
            <div>
              <p
                className="text-2xl font-bold"
                style={{ fontFamily: 'var(--font-heading)', color: 'rgb(var(--foreground))' }}
              >
                {value ?? '—'}
              </p>
              <p className="text-sm" style={{ color: 'rgb(var(--muted-foreground))' }}>
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <h2
        className="mb-4 text-base font-semibold"
        style={{ color: 'rgb(var(--foreground))' }}
      >
        Manage
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
        {sections.map(({ to, label, description, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                backgroundColor: 'rgb(var(--card))',
                border: '1px solid rgb(var(--border))',
                borderRadius: '8px',
                padding: '1.75rem 1.5rem',
                transition: 'box-shadow 0.15s ease',
                height: '100%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'rgb(var(--accent) / 0.12)',
                  color: 'rgb(var(--accent))',
                  marginBottom: '1rem',
                }}
              >
                <Icon size={22} />
              </div>
              <h2
                className="mb-1 text-base font-semibold"
                style={{ color: 'rgb(var(--accent))' }}
              >
                {label}
              </h2>
              <p
                className="text-sm"
                style={{ color: 'rgb(var(--muted-foreground))' }}
              >
                {description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
