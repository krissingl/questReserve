import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProvider, setProviderStatus, type AdminProvider } from '@/api/admin.api'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const STATUS_OPTIONS = ['ACTIVE', 'SUSPENDED'] as const
type ChangeableStatus = typeof STATUS_OPTIONS[number]

export function AdminProviderDetail() {
  const { id } = useParams<{ id: string }>()
  const [provider, setProvider] = useState<AdminProvider | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusPending, setStatusPending] = useState(false)
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setIsLoading(true)
    getProvider(id)
      .then((data) => { if (!cancelled) { setProvider(data); setIsLoading(false) } })
      .catch(() => { if (!cancelled) { setError('Failed to load provider.'); setIsLoading(false) } })
    return () => { cancelled = true }
  }, [id])

  const handleStatusChange = async (newStatus: ChangeableStatus) => {
    if (!id || !provider) return
    if (newStatus === provider.status) return
    const confirmed = window.confirm(`Change status to ${newStatus}?`)
    if (!confirmed) return

    setStatusPending(true)
    setStatusSuccess(null)
    setStatusError(null)
    try {
      const updated = await setProviderStatus(id, newStatus)
      setProvider(updated)
      setStatusSuccess(`Status updated to ${newStatus}.`)
    } catch {
      setStatusError('Failed to update status. Please try again.')
    } finally {
      setStatusPending(false)
    }
  }

  if (isLoading) {
    return (
      <main className="p-8">
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading…</p>
      </main>
    )
  }

  if (error || !provider) {
    return (
      <main className="p-8">
        <p style={{ color: 'rgb(var(--destructive))' }}>{error ?? 'Provider not found.'}</p>
        <Link to="/admin/providers" style={{ color: 'rgb(var(--accent))', fontSize: 'var(--text-sm)' }}>
          Back to Providers
        </Link>
      </main>
    )
  }

  return (
    <main className="p-8">
      <Link
        to="/admin/providers"
        style={{ color: 'rgb(var(--accent))', fontSize: 'var(--text-sm)', textDecoration: 'none' }}
      >
        &larr; Back to Providers
      </Link>

      <h1
        className="mb-6 mt-4 text-2xl font-bold"
        style={{ fontFamily: 'var(--font-heading)', color: 'rgb(var(--foreground))' }}
      >
        {provider.first_name} {provider.last_name}
      </h1>

      <div
        style={{
          backgroundColor: 'rgb(var(--card))',
          border: '1px solid rgb(var(--border))',
          borderRadius: '8px',
          padding: '1.5rem',
          maxWidth: '540px',
          marginBottom: '2rem',
        }}
      >
        <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 1.5rem', fontSize: 'var(--text-sm)' }}>
          <dt style={{ color: 'rgb(var(--muted-foreground))' }}>Email</dt>
          <dd style={{ color: 'rgb(var(--foreground))' }}>{provider.email}</dd>

          <dt style={{ color: 'rgb(var(--muted-foreground))' }}>Organization</dt>
          <dd style={{ color: 'rgb(var(--foreground))' }}>{provider.organization_name ?? '—'}</dd>

          <dt style={{ color: 'rgb(var(--muted-foreground))' }}>Plan</dt>
          <dd style={{ color: 'rgb(var(--foreground))' }}>{provider.plan}</dd>

          <dt style={{ color: 'rgb(var(--muted-foreground))' }}>Status</dt>
          <dd style={{ color: 'rgb(var(--foreground))' }}>{provider.status}</dd>

          <dt style={{ color: 'rgb(var(--muted-foreground))' }}>Member since</dt>
          <dd style={{ color: 'rgb(var(--foreground))' }}>{formatDate(provider.created_at)}</dd>
        </dl>
      </div>

      <section>
        <h2
          className="mb-3 text-base font-semibold"
          style={{ color: 'rgb(var(--foreground))' }}
        >
          Change Status
        </h2>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              type="button"
              disabled={statusPending || provider.status === status}
              onClick={() => handleStatusChange(status)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '6px',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-semibold)',
                border: '1px solid rgb(var(--border))',
                cursor: statusPending || provider.status === status ? 'not-allowed' : 'pointer',
                opacity: provider.status === status ? 0.5 : 1,
                backgroundColor: provider.status === status ? 'rgb(var(--muted) / 0.3)' : 'rgb(var(--card))',
                color: 'rgb(var(--foreground))',
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {statusPending && (
          <p className="mt-2 text-sm" style={{ color: 'rgb(var(--muted-foreground))' }}>
            Updating…
          </p>
        )}

        {statusSuccess && (
          <p className="mt-2 text-sm" style={{ color: 'rgb(var(--success))' }}>
            {statusSuccess}
          </p>
        )}

        {statusError && (
          <p className="mt-2 text-sm" style={{ color: 'rgb(var(--destructive))' }}>
            {statusError}
          </p>
        )}
      </section>
    </main>
  )
}
