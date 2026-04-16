import { Link } from 'react-router-dom'
import { useMyBookings } from '@/hooks/useMyBookings'
import type { EnrichedBooking } from '@/types/domain'

function isExpired(booking: EnrichedBooking): boolean {
  return booking.status === 'BOOKED' && new Date(booking.slot_start_time) < new Date()
}

function formatSlotTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function StatusBadge({ booking }: { booking: EnrichedBooking }) {
  if (isExpired(booking)) {
    return (
      <span
        className="rounded px-2 py-0.5 text-xs font-semibold"
        style={{
          backgroundColor: 'rgb(var(--muted) / 0.3)',
          color: 'rgb(var(--muted-foreground))',
        }}
      >
        EXPIRED
      </span>
    )
  }

  const colorMap = {
    BOOKED: { bg: 'rgb(34 197 94 / 0.15)', text: 'rgb(34 197 94)' },
    CANCELLED: { bg: 'rgb(var(--muted) / 0.3)', text: 'rgb(var(--muted-foreground))' },
  }
  const colors = colorMap[booking.status]

  return (
    <span
      className="rounded px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {booking.status}
    </span>
  )
}

export function MyBookings() {
  const { data: bookings, isLoading, error } = useMyBookings()

  if (isLoading) {
    return (
      <main className="p-8">
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading bookings…</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="p-8">
        <h1
          className="mb-4 text-2xl font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: 'rgb(var(--foreground))' }}
        >
          My Bookings
        </h1>
        <p style={{ color: 'rgb(var(--destructive))' }}>
          Failed to load bookings. Please try again.
        </p>
      </main>
    )
  }

  const isEmpty = !bookings || bookings.length === 0

  return (
    <main className="p-8">
      <h1
        className="mb-6 text-2xl font-bold"
        style={{ fontFamily: 'var(--font-heading)', color: 'rgb(var(--foreground))' }}
      >
        My Bookings
      </h1>

      {isEmpty ? (
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>
          You have no bookings yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-lg p-6"
              style={{
                backgroundColor: 'rgb(var(--surface))',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <Link
                  to={`/customer/locations/${booking.booking_location_id}`}
                  className="text-lg font-semibold hover:underline"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    color: 'rgb(var(--foreground))',
                  }}
                >
                  {booking.location_name}
                </Link>

                <StatusBadge booking={booking} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p
                    className="mb-0.5 font-medium"
                    style={{ color: 'rgb(var(--muted-foreground))' }}
                  >
                    Starts
                  </p>
                  <p style={{ color: 'rgb(var(--foreground))' }}>
                    {formatSlotTime(booking.slot_start_time)}
                  </p>
                </div>

                <div>
                  <p
                    className="mb-0.5 font-medium"
                    style={{ color: 'rgb(var(--muted-foreground))' }}
                  >
                    Ends
                  </p>
                  <p style={{ color: 'rgb(var(--foreground))' }}>
                    {formatSlotTime(booking.slot_end_time)}
                  </p>
                </div>

                <div>
                  <p
                    className="mb-0.5 font-medium"
                    style={{ color: 'rgb(var(--muted-foreground))' }}
                  >
                    Booked On
                  </p>
                  <p style={{ color: 'rgb(var(--foreground))' }}>
                    {new Date(booking.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
