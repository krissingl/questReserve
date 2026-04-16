import { Link, useLocation } from 'react-router-dom'

interface PaymentRouteState {
  locationName?: string
  slotStart?: string
  slotEnd?: string
}

function formatSlotTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function PaymentStub() {
  const { state } = useLocation()
  const routeState = (state as PaymentRouteState | null) ?? {}
  const { locationName, slotStart, slotEnd } = routeState

  return (
    <main className="p-8">
      <div
        className="mx-auto max-w-lg rounded-lg p-8 text-center"
        style={{
          backgroundColor: 'rgb(var(--card))',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgb(var(--success) / 0.15)' }}
        >
          <span style={{ color: 'rgb(var(--success))', fontSize: '1.5rem' }}>✓</span>
        </div>

        <h1
          className="mb-2 text-2xl font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: 'rgb(var(--foreground))' }}
        >
          Reservation Received
        </h1>

        <p className="mb-6 text-sm" style={{ color: 'rgb(var(--muted-foreground))' }}>
          Your reservation has been submitted successfully.
        </p>

        {locationName && (
          <div
            className="mb-4 rounded p-4 text-left text-sm"
            style={{ backgroundColor: 'rgb(var(--card))' }}
          >
            <p className="mb-1 font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
              {locationName}
            </p>
            {slotStart && slotEnd && (
              <p style={{ color: 'rgb(var(--muted-foreground))' }}>
                {formatSlotTime(slotStart)} &ndash; {formatSlotTime(slotEnd)}
              </p>
            )}
          </div>
        )}

        <div
          className="mb-6 rounded p-4 text-sm"
          style={{
            backgroundColor: 'rgb(var(--accent) / 0.08)',
            color: 'rgb(var(--muted-foreground))',
          }}
        >
          Payment processing is coming soon. No payment is required at this time.
        </div>

        <Link
          to="/customer/bookings"
          className="text-sm font-medium underline-offset-4 hover:underline"
          style={{ color: 'rgb(var(--accent))' }}
        >
          View My Bookings
        </Link>
      </div>
    </main>
  )
}
