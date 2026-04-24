import { Link } from 'react-router-dom'
import { useMyBookings } from '@/hooks/useMyBookings'
import { StatusBadge } from '@/components/StatusBadge'
import { formatSlotTime } from '@/utils/formatSlotTime'

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
              <li key={booking.id}>
                <Link
                  to={`/locations/${booking.booking_location_id}`}
                  className="block rounded-lg p-4 text-sm transition-opacity hover:opacity-80"
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
                </Link>
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
