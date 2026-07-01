import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { listProviders, type AdminProvider, type ProviderStatus } from '@/api/admin.api'
import { SortableTh } from '@/components/SortableTh/SortableTh'

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

type SortKey = 'name' | 'organization_name' | 'email' | 'plan' | 'status'
type SortDirection = 'asc' | 'desc'

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'organization_name', label: 'Organization' },
  { key: 'email', label: 'Email' },
  { key: 'plan', label: 'Plan' },
  { key: 'status', label: 'Status' },
]

function sortValue(p: AdminProvider, key: SortKey): string {
  switch (key) {
    case 'name': return `${p.first_name} ${p.last_name}`.toLowerCase()
    case 'organization_name': return (p.organization_name ?? '').toLowerCase()
    case 'email': return p.email.toLowerCase()
    case 'plan': return p.plan
    case 'status': return p.status
  }
}

export function AdminProviders() {
  const [providers, setProviders] = useState<AdminProvider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    listProviders()
      .then((data) => { if (!cancelled) { setProviders(data); setIsLoading(false) } })
      .catch(() => { if (!cancelled) { setError('Failed to load providers.'); setIsLoading(false) } })
    return () => { cancelled = true }
  }, [])

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const visibleProviders = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = query
      ? providers.filter((p) =>
          `${p.first_name} ${p.last_name}`.toLowerCase().includes(query) ||
          (p.organization_name ?? '').toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query)
        )
      : providers

    const sorted = [...filtered].sort((a, b) => {
      const aVal = sortValue(a, sortKey)
      const bVal = sortValue(b, sortKey)
      const cmp = aVal.localeCompare(bVal)
      return sortDirection === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [providers, search, sortKey, sortDirection])

  return (
    <main className="p-8">
      <h1
        className="mb-6 text-2xl font-bold"
        style={{ fontFamily: 'var(--font-heading)', color: 'rgb(var(--foreground))' }}
      >
        Providers
      </h1>

      <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '1.5rem' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgb(var(--muted-foreground))',
          }}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search providers by name, organization, or email…"
          className="w-full rounded-md border py-2 pr-3 text-sm focus:outline-none focus:ring-2"
          style={{
            paddingLeft: '2.25rem',
            backgroundColor: 'rgb(var(--background))',
            color: 'rgb(var(--foreground))',
            borderColor: 'rgb(var(--border))',
          }}
        />
      </div>

      {isLoading && (
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading providers…</p>
      )}

      {error && (
        <p style={{ color: 'rgb(var(--destructive))' }}>{error}</p>
      )}

      {!isLoading && !error && providers.length === 0 && (
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>No providers found.</p>
      )}

      {!isLoading && !error && providers.length > 0 && visibleProviders.length === 0 && (
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>No providers match your search.</p>
      )}

      {!isLoading && !error && visibleProviders.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgb(var(--border))' }}>
                {COLUMNS.map((col) => (
                  <SortableTh
                    key={col.key}
                    label={col.label}
                    active={sortKey === col.key}
                    direction={sortDirection}
                    onClick={() => handleSort(col.key)}
                  />
                ))}
                <th style={{ padding: '0.5rem 0.75rem' }} />
              </tr>
            </thead>
            <tbody>
              {visibleProviders.map((p) => (
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
