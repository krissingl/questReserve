import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProvider, setProviderStatus, setProviderPlan, type AdminProvider, type ProviderPlan } from '@/api/admin.api'
import { AvatarIcon } from '@/components/AvatarIcon/AvatarIcon'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const STATUS_OPTIONS = ['ACTIVE', 'SUSPENDED'] as const
type ChangeableStatus = typeof STATUS_OPTIONS[number]

const PLAN_OPTIONS: ProviderPlan[] = ['FREE', 'STANDARD', 'PREMIUM']

export function AdminProviderDetail() {
  const { id } = useParams<{ id: string }>()
  const [provider, setProvider] = useState<AdminProvider | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusPending, setStatusPending] = useState(false)
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [planPending, setPlanPending] = useState(false)
  const [planSuccess, setPlanSuccess] = useState<string | null>(null)
  const [planError, setPlanError] = useState<string | null>(null)

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

  const handlePlanChange = async (newPlan: ProviderPlan) => {
    if (!id || !provider) return
    if (newPlan === provider.plan) return
    const confirmed = window.confirm(`Change plan to ${newPlan}?`)
    if (!confirmed) return

    setPlanPending(true)
    setPlanSuccess(null)
    setPlanError(null)
    try {
      const updated = await setProviderPlan(id, newPlan)
      setProvider(updated)
      setPlanSuccess(`Plan updated to ${newPlan}.`)
    } catch {
      setPlanError('Failed to update plan. Please try again.')
    } finally {
      setPlanPending(false)
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '1rem', marginBottom: '2rem' }}>
        <AvatarIcon
          firstName={provider.first_name}
          lastName={provider.last_name}
          pictureUrl={provider.profile_picture_url}
          size="lg"
        />
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'rgb(var(--foreground))' }}
          >
            {provider.first_name} {provider.last_name}
          </h1>
          {provider.organization_name && (
            <p style={{ color: 'rgb(var(--muted-foreground))', fontSize: 'var(--text-sm)' }}>
              {provider.organization_name}
            </p>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 1fr) minmax(280px, 1.4fr)',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgb(var(--card))',
            border: '1px solid rgb(var(--border))',
            borderRadius: '8px',
            padding: '1.5rem',
          }}
        >
          <h2
            className="mb-3 text-base font-semibold"
            style={{ color: 'rgb(var(--foreground))' }}
          >
            Profile
          </h2>
          <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.65rem 1.5rem', fontSize: 'var(--text-sm)' }}>
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

          {provider.bio && (
            <>
              <h2
                className="mb-2 mt-5 text-base font-semibold"
                style={{ color: 'rgb(var(--foreground))' }}
              >
                Bio
              </h2>
              <p style={{ color: 'rgb(var(--muted-foreground))', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
                {provider.bio}
              </p>
            </>
          )}
        </div>

        <div
          style={{
            backgroundColor: 'rgb(var(--card))',
            border: '1px solid rgb(var(--border))',
            borderRadius: '8px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
          }}
        >
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
                    backgroundColor: provider.status === status ? 'rgb(var(--muted) / 0.3)' : 'rgb(var(--background))',
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

          <section>
            <h2
              className="mb-3 text-base font-semibold"
              style={{ color: 'rgb(var(--foreground))' }}
            >
              Change Plan
            </h2>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {PLAN_OPTIONS.map((plan) => (
                <button
                  key={plan}
                  type="button"
                  disabled={planPending || provider.plan === plan}
                  onClick={() => handlePlanChange(plan)}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '6px',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-semibold)',
                    border: '1px solid rgb(var(--border))',
                    cursor: planPending || provider.plan === plan ? 'not-allowed' : 'pointer',
                    opacity: provider.plan === plan ? 0.5 : 1,
                    backgroundColor: provider.plan === plan ? 'rgb(var(--muted) / 0.3)' : 'rgb(var(--background))',
                    color: 'rgb(var(--foreground))',
                  }}
                >
                  {plan}
                </button>
              ))}
            </div>

            {planPending && (
              <p className="mt-2 text-sm" style={{ color: 'rgb(var(--muted-foreground))' }}>
                Updating…
              </p>
            )}

            {planSuccess && (
              <p className="mt-2 text-sm" style={{ color: 'rgb(var(--success))' }}>
                {planSuccess}
              </p>
            )}

            {planError && (
              <p className="mt-2 text-sm" style={{ color: 'rgb(var(--destructive))' }}>
                {planError}
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
