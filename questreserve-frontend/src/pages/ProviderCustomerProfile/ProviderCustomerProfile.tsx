import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProviderCustomer } from '@/api/provider.api'
import type { ProviderCustomerProfile as ProviderCustomerProfileData } from '@/api/provider.api'

const statusColours: Record<string, { bg: string; text: string }> = {
  BOOKED: { bg: 'rgb(var(--success, 34 197 94) / 0.12)', text: 'rgb(var(--success, 34 197 94))' },
  CANCELLED: { bg: 'rgb(var(--muted))', text: 'rgb(var(--muted-foreground))' },
}

function formatDateRange(start: string, end: string): string {
  const fmt = (s: string) =>
    new Date(s).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  return `${fmt(start)} — ${fmt(end)}`
}

export function ProviderCustomerProfile() {
  const { customerId } = useParams<{ customerId: string }>()
  const [profile, setProfile] = useState<ProviderCustomerProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!customerId) return
    setLoading(true)
    getProviderCustomer(customerId)
      .then((data) => {
        setProfile(data)
        setLoading(false)
      })
      .catch((err: unknown) => {
        const status =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { status?: number } }).response?.status
            : undefined
        setError(status === 404 ? 'Customer not found.' : 'Failed to load customer profile.')
        setLoading(false)
      })
  }, [customerId])

  return (
    <div style={{ padding: '2rem', width: '85%', minWidth: 'min(700px, 100%)', margin: '0 auto' }}>
      <Link
        to="/provider/bookings"
        style={{
          display: 'inline-block',
          marginBottom: '1.25rem',
          fontSize: 'var(--text-sm)',
          color: 'rgb(var(--muted-foreground))',
          textDecoration: 'none',
        }}
      >
        &larr; Back to Bookings
      </Link>

      {loading && (
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading customer profile…</p>
      )}

      {!loading && error && (
        <p style={{ color: 'rgb(var(--destructive))' }}>{error}</p>
      )}

      {!loading && !error && profile && (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.75rem',
                fontWeight: 'var(--weight-bold)',
                color: 'rgb(var(--foreground))',
                marginBottom: '0.25rem',
              }}
            >
              {profile.first_name} {profile.last_name}
            </h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))' }}>
              {profile.email}
            </p>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.1rem',
              fontWeight: 'var(--weight-semibold)',
              color: 'rgb(var(--foreground))',
              marginBottom: '1rem',
            }}
          >
            Booking History
          </h2>

          {profile.bookings.length === 0 ? (
            <p style={{ color: 'rgb(var(--muted-foreground))', fontSize: 'var(--text-sm)' }}>
              No bookings with your adventures yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {profile.bookings.map((b) => {
                const colours = statusColours[b.status] ?? statusColours.CANCELLED
                return (
                  <div
                    key={b.id}
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius)',
                      backgroundColor: 'rgb(var(--card))',
                      boxShadow: 'var(--shadow-card)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.4rem' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 'var(--weight-semibold)',
                          color: 'rgb(var(--foreground))',
                          fontSize: 'var(--text-base)',
                        }}
                      >
                        {b.location_name}
                      </span>
                      <span
                        style={{
                          flexShrink: 0,
                          display: 'inline-block',
                          padding: '0.15rem 0.6rem',
                          borderRadius: 'var(--radius-pill)',
                          fontSize: '0.7rem',
                          fontWeight: 'var(--weight-medium)',
                          backgroundColor: colours.bg,
                          color: colours.text,
                        }}
                      >
                        {b.status}
                      </span>
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))' }}>
                      {formatDateRange(b.start_time, b.end_time)}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
