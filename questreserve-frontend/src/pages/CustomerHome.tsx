import { Link } from 'react-router-dom'
import { useMyBookings } from '@/hooks/useMyBookings'

export function CustomerHome() {
  const { data: bookings, isLoading } = useMyBookings()

  const recentBookings = bookings
    ? [...bookings].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ).slice(0, 2)
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
          Recent Bookings
        </h2>

        {isLoading && (
          <p className="text-sm" style={{ color: 'rgb(var(--muted-foreground))' }}>
            Loading bookings…
          </p>
        )}

        {!isLoading && recentBookings.length === 0 && (
          <p className="text-sm" style={{ color: 'rgb(var(--muted-foreground))' }}>
            You have no bookings yet.{' '}
            <Link
              to="/customer/locations"
              style={{ color: 'rgb(var(--accent))' }}
            >
              Browse locations
            </Link>{' '}
            to get started.
          </p>
        )}

        {!isLoading && recentBookings.length > 0 && (
          <ul className="space-y-3">
            {recentBookings.map((booking) => (
              <li
                key={booking.id}
                className="rounded-lg p-4 text-sm"
                style={{
                  backgroundColor: 'rgb(var(--card))',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <span
                  className="font-medium"
                  style={{ color: 'rgb(var(--foreground))' }}
                >
                  Booking #{booking.id.slice(0, 8)}
                </span>
                <span
                  className="ml-3"
                  style={{ color: 'rgb(var(--muted-foreground))' }}
                >
                  {booking.status}
                </span>
              </li>
            ))}
          </ul>
        )}

        {!isLoading && bookings && bookings.length > 0 && (
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
