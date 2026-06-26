import { useEffect, useState } from 'react'
import { getPlatformBookings, type AdminBookingView, type BookingStatus } from '@/api/admin.api'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const statusColors: Record<BookingStatus, { bg: string; text: string }> = {
  BOOKED:    { bg: 'rgb(var(--success) / 0.18)',     text: 'rgb(var(--success))' },
  CANCELLED: { bg: 'rgb(var(--muted-foreground) / 0.15)', text: 'rgb(var(--muted-foreground))' },
}

function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const colors = statusColors[status] ?? statusColors.CANCELLED
  return (
    <span
      className="rounded px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {status}
    </span>
  )
}

export function AdminBookings() {
  const [bookings, setBookings] = useState<AdminBookingView[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    getPlatformBookings()
      .then((data) => {
        if (!cancelled) {
          const sorted = [...data].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          setBookings(sorted)
          setIsLoading(false)
        }
      })
      .catch(() => { if (!cancelled) { setError('Failed to load bookings.'); setIsLoading(false) } })
    return () => { cancelled = true }
  }, [])

  return (
    <main className="p-8">
      <h1
        className="mb-6 text-2xl font-bold"
        style={{ fontFamily: 'var(--font-heading)', color: 'rgb(var(--foreground))' }}
      >
        Bookings
      </h1>

      {isLoading && (
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading bookings…</p>
      )}

      {error && (
        <p style={{ color: 'rgb(var(--destructive))' }}>{error}</p>
      )}

      {!isLoading && !error && bookings.length === 0 && (
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>No bookings found.</p>
      )}

      {!isLoading && !error && bookings.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgb(var(--border))' }}>
                {['Booking ID', 'Location', 'Provider', 'Start Time', 'End Time', 'Status', 'Created At'].map((h) => (
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
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  style={{ borderBottom: '1px solid rgb(var(--border) / 0.5)' }}
                >
                  <td
                    style={{
                      padding: '0.625rem 0.75rem',
                      color: 'rgb(var(--muted-foreground))',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                    }}
                    title={b.id}
                  >
                    {b.id.slice(0, 8)}…
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem', color: 'rgb(var(--foreground))' }}>
                    {b.location_name}
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem', color: 'rgb(var(--foreground))' }}>
                    {b.provider_name}
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem', color: 'rgb(var(--foreground))' }}>
                    {formatDateTime(b.start_time)}
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem', color: 'rgb(var(--foreground))' }}>
                    {formatDateTime(b.end_time)}
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem' }}>
                    <BookingStatusBadge status={b.status} />
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem', color: 'rgb(var(--muted-foreground))' }}>
                    {formatDateTime(b.created_at)}
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
