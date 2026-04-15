import { useMyBookings } from '@/hooks/useMyBookings'

const STATUS_COLOURS: Record<string, string> = {
  BOOKED: 'rgb(34 197 94)',
  CANCELLED: 'rgb(var(--muted-foreground))',
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
                <div>
                  <p
                    className="mb-1 text-sm font-medium"
                    style={{ color: 'rgb(var(--muted-foreground))' }}
                  >
                    Booking ID
                  </p>
                  <p
                    className="font-mono text-xs"
                    style={{ color: 'rgb(var(--foreground))' }}
                  >
                    {booking.id}
                  </p>
                </div>

                <span
                  className="rounded px-2 py-0.5 text-xs font-semibold"
                  style={{
                    backgroundColor: booking.status === 'BOOKED'
                      ? 'rgb(34 197 94 / 0.15)'
                      : 'rgb(var(--muted) / 0.3)',
                    color: STATUS_COLOURS[booking.status] ?? 'inherit',
                  }}
                >
                  {booking.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p
                    className="mb-0.5 font-medium"
                    style={{ color: 'rgb(var(--muted-foreground))' }}
                  >
                    Time Slot
                  </p>
                  <p
                    className="font-mono text-xs"
                    style={{ color: 'rgb(var(--foreground))' }}
                  >
                    {booking.time_slot_id}
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
