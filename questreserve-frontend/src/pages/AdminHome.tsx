import { Link } from 'react-router-dom'

const sections = [
  {
    to: '/admin/providers',
    label: 'Providers',
    description: 'View and manage provider accounts and their status.',
  },
  {
    to: '/admin/bookings',
    label: 'Bookings',
    description: 'Browse all platform bookings across every provider.',
  },
  {
    to: '/admin/users',
    label: 'Admin Users',
    description: 'Create additional admin accounts (Superuser only).',
  },
]

export function AdminHome() {
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {sections.map(({ to, label, description }) => (
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
                padding: '1.25rem',
                transition: 'box-shadow 0.15s ease',
              }}
            >
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
