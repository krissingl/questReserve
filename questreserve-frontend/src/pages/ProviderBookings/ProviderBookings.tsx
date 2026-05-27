import { useMyProviderBookings } from '@/hooks/useMyProviderBookings'
import type { ProviderBooking } from '@/types/domain'

function formatDateTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return isoString
  }
}

interface BookingRowProps {
  booking: ProviderBooking
}

function BookingRow({ booking }: BookingRowProps) {
  const isCancelled = booking.status === 'CANCELLED'

  return (
    <div
      style={{
        padding: '1rem 1.25rem',
        borderRadius: 'var(--radius)',
        backgroundColor: 'rgb(var(--card))',
        boxShadow: 'var(--shadow-card)',
        opacity: isCancelled ? 0.6 : 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '0.5rem',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--weight-semibold)',
            color: 'rgb(var(--foreground))',
            fontSize: 'var(--text-base)',
          }}
        >
          {booking.location_name}
        </span>
        <span
          style={{
            flexShrink: 0,
            display: 'inline-block',
            padding: '0.15rem 0.6rem',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.7rem',
            fontWeight: 'var(--weight-medium)',
            backgroundColor: isCancelled
              ? 'rgb(var(--muted))'
              : 'rgb(var(--success, 34 197 94) / 0.15)',
            color: isCancelled
              ? 'rgb(var(--muted-foreground))'
              : 'rgb(var(--success, 34 197 94))',
          }}
        >
          {booking.status}
        </span>
      </div>

      <div
        style={{
          fontSize: 'var(--text-sm)',
          color: 'rgb(var(--muted-foreground))',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem 1.5rem',
        }}
      >
        <span>
          <strong style={{ color: 'rgb(var(--foreground))' }}>Start:</strong>{' '}
          {formatDateTime(booking.start_time)}
        </span>
        <span>
          <strong style={{ color: 'rgb(var(--foreground))' }}>End:</strong>{' '}
          {formatDateTime(booking.end_time)}
        </span>
        <span>
          <strong style={{ color: 'rgb(var(--foreground))' }}>Customer ID:</strong>{' '}
          {booking.end_user_id}
        </span>
      </div>
    </div>
  )
}

export function ProviderBookings() {
  const { data: bookings, isLoading, error } = useMyProviderBookings()

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.75rem',
          fontWeight: 'var(--weight-bold)',
          color: 'rgb(var(--foreground))',
          marginBottom: '1.5rem',
        }}
      >
        My Bookings
      </h1>

      {isLoading && (
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading bookings…</p>
      )}

      {!isLoading && error && (
        <p style={{ color: 'rgb(var(--destructive))' }}>
          Failed to load bookings. Please try again.
        </p>
      )}

      {!isLoading && !error && bookings.length === 0 && (
        <div
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            borderRadius: 'var(--radius)',
            backgroundColor: 'rgb(var(--card))',
            color: 'rgb(var(--muted-foreground))',
          }}
        >
          <p>No bookings yet.</p>
        </div>
      )}

      {!isLoading && !error && bookings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {bookings.map((booking) => (
            <BookingRow key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  )
}
