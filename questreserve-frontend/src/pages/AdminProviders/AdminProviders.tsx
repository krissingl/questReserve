import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listProviders, type AdminProvider, type ProviderStatus } from '@/api/admin.api'

const statusColors: Record<ProviderStatus, { bg: string; text: string }> = {
  PENDING:   { bg: 'rgb(var(--warning) / 0.18)',     text: 'rgb(var(--warning))' },
  ACTIVE:    { bg: 'rgb(var(--success) / 0.18)',     text: 'rgb(var(--success))' },
  SUSPENDED: { bg: 'rgb(var(--destructive) / 0.18)', text: 'rgb(var(--destructive))' },
}

function StatusBadge({ status }: { status: ProviderStatus }) {
  const colors = statusColors[status] ?? statusColors.SUSPENDED
  return (
    <span
      className="rounded px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {status}
    </span>
  )
}

function PlanBadge({ plan }: { plan: AdminProvider['plan'] }) {
  return (
    <span
      className="rounded px-2 py-0.5 text-xs font-semibold"
      style={{
        backgroundColor: 'rgb(var(--accent) / 0.12)',
        color: 'rgb(var(--accent))',
      }}
    >
      {plan}
    </span>
  )
}

export function AdminProviders() {
  const [providers, setProviders] = useState<AdminProvider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    listProviders()
      .then((data) => { if (!cancelled) { setProviders(data); setIsLoading(false) } })
      .catch(() => { if (!cancelled) { setError('Failed to load providers.'); setIsLoading(false) } })
    return () => { cancelled = true }
  }, [])

  return (
    <main className="p-8">
      <h1
        className="mb-6 text-2xl font-bold"
        style={{ fontFamily: 'var(--font-heading)', color: 'rgb(var(--foreground))' }}
      >
        Providers
      </h1>

      {isLoading && (
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading providers…</p>
      )}

      {error && (
        <p style={{ color: 'rgb(var(--destructive))' }}>{error}</p>
      )}

      {!isLoading && !error && providers.length === 0 && (
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>No providers found.</p>
      )}

      {!isLoading && !error && providers.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgb(var(--border))' }}>
                {['Name', 'Organization', 'Email', 'Plan', 'Status', ''].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '0.5rem 0.75rem',
                      textAlign: 'left',
                      fontWeight: 'var(--weight-semibold)',
                      color: 'rgb(var(--muted-foreground))',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <tr
                  key={p.id}
                  style={{ borderBottom: '1px solid rgb(var(--border) / 0.5)' }}
                >
                  <td style={{ padding: '0.625rem 0.75rem', color: 'rgb(var(--foreground))' }}>
                    {p.first_name} {p.last_name}
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem', color: 'rgb(var(--muted-foreground))' }}>
                    {p.organization_name ?? '—'}
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem', color: 'rgb(var(--foreground))' }}>
                    {p.email}
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem' }}>
                    <PlanBadge plan={p.plan} />
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem' }}>
                    <StatusBadge status={p.status} />
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem' }}>
                    <Link
                      to={`/admin/providers/${p.id}`}
                      style={{ color: 'rgb(var(--accent))', textDecoration: 'none', fontSize: 'var(--text-sm)' }}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
