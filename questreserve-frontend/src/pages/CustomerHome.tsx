import { Link } from 'react-router-dom'
import { useMyBookings } from '@/hooks/useMyBookings'
import type { EnrichedBooking } from '@/types/domain'

function formatSlotTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function StatusBadge({ booking }: { booking: EnrichedBooking }) {
  const isExpired = booking.status === 'BOOKED' && new Date(booking.slot_start_time) < new Date()

  if (isExpired) {
    return (
      <span
        className="rounded px-2 py-0.5 text-xs font-semibold"
        style={{
          backgroundColor: 'rgb(var(--warning) / 0.18)',
          color: 'rgb(var(--warning))',
        }}
      >
        EXPIRED
      </span>
    )
  }

  const colorMap: Record<string, { bg: string; text: string }> = {
    BOOKED:    { bg: 'rgb(var(--success) / 0.18)', text: 'rgb(var(--success))' },
    CANCELLED: { bg: 'rgb(var(--muted-foreground) / 0.15)', text: 'rgb(var(--muted-foreground))' },
  }
  const colors = colorMap[booking.status] ?? colorMap['CANCELLED']

  return (
    <span
      className="rounded px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {booking.status}
    </span>
  )
}

export function CustomerHome() {
  const { data: bookings, isLoading } = useMyBookings()

  const now = new Date()

  const upcomingBookings = bookings
    ? [...bookings]
        .filter((b) => b.status !== 'CANCELLED' && new Date(b.slot_start_time) > now)
        .sort((a, b) => new Date(a.slot_start_time).getTime() - new Date(b.slot_start_time).getTime())
        .slice(0, 2)
    : []

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
        Customer Dashboard
      </h1>

      <section className="mt-6">
        <h2
          className="mb-3 text-lg font-semibold"
          style={{ fontFamily: 'var(--font-heading)', color: 'rgb(var(--foreground))' }}
        >
          Upcoming Reservations
        </h2>

        {isLoading && (
          <p className="text-sm" style={{ color: 'rgb(var(--muted-foreground))' }}>
            Loading bookings…
          </p>
        )}

        {!isLoading && upcomingBookings.length === 0 && (
          <p className="text-sm" style={{ color: 'rgb(var(--muted-foreground))' }}>
            You don't have any upcoming reservations.{' '}
            <Link to="/customer/bookings" style={{ color: 'rgb(var(--accent))' }}>
              My Bookings
            </Link>
          </p>
        )}

        {!isLoading && upcomingBookings.length > 0 && (
          <ul className="space-y-3">
            {upcomingBookings.map((booking) => (
              <li
                key={booking.id}
                className="rounded-lg p-4 text-sm"
                style={{
                  backgroundColor: 'rgb(var(--card))',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="font-semibold"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      color: 'rgb(var(--foreground))',
                    }}
                  >
                    {booking.location_name}
                  </span>
                  <StatusBadge booking={booking} />
                </div>
                <div className="mt-2 text-xs" style={{ color: 'rgb(var(--muted-foreground))' }}>
                  <span>{formatSlotTime(booking.slot_start_time)}</span>
                  <span className="mx-1">&ndash;</span>
                  <span>{formatSlotTime(booking.slot_end_time)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!isLoading && (
          <p className="mt-3 text-sm">
            <Link to="/customer/bookings" style={{ color: 'rgb(var(--accent))' }}>
              View all bookings
            </Link>
          </p>
        )}
      </section>
    </main>
  )
}
