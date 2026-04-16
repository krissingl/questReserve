import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMyBookings } from '@/hooks/useMyBookings'
import { useCancelBooking } from '@/hooks/useCancelBooking'
import type { EnrichedBooking } from '@/types/domain'

function isExpired(booking: EnrichedBooking): boolean {
  return booking.status === 'BOOKED' && new Date(booking.slot_start_time) < new Date()
}

function isCancellable(booking: EnrichedBooking): boolean {
  return booking.status === 'BOOKED' && !isExpired(booking)
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

interface BookingCardProps {
  booking: EnrichedBooking
  onCancelled: () => void
}

function BookingCard({ booking, onCancelled }: BookingCardProps) {
  const { cancelBooking, isLoading: cancelling } = useCancelBooking()
  const [confirming, setConfirming] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  const handleConfirmCancel = async () => {
    try {
      await cancelBooking(booking.id)
      onCancelled()
    } catch {
      setCancelError('Failed to cancel booking. Please try again.')
      setConfirming(false)
    }
  }

  return (
    <div
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

      {cancelError && (
        <p className="mt-3 text-sm" style={{ color: 'rgb(var(--destructive))' }}>
          {cancelError}
        </p>
      )}

      {isCancellable(booking) && !confirming && (
        <button
          type="button"
          onClick={() => { setConfirming(true); setCancelError(null) }}
          className="mt-4 rounded px-3 py-1.5 text-sm font-medium"
          style={{
            backgroundColor: 'rgb(var(--destructive) / 0.1)',
            color: 'rgb(var(--destructive))',
          }}
        >
          Cancel Booking
        </button>
      )}

      {isCancellable(booking) && confirming && (
        <div
          className="mt-4 rounded p-3 text-sm"
          style={{ backgroundColor: 'rgb(var(--destructive) / 0.06)' }}
        >
          <p className="mb-2" style={{ color: 'rgb(var(--foreground))' }}>
            Are you sure you want to cancel this reservation?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleConfirmCancel}
              disabled={cancelling}
              className="rounded px-4 py-1.5 text-sm font-medium"
              style={{
                backgroundColor: 'rgb(var(--destructive))',
                color: 'rgb(var(--destructive-foreground))',
                opacity: cancelling ? 0.6 : 1,
              }}
            >
              {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={cancelling}
              className="rounded px-4 py-1.5 text-sm font-medium"
              style={{ color: 'rgb(var(--muted-foreground))' }}
            >
              Keep
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function MyBookings() {
  const { data: bookings, isLoading, error, refetch } = useMyBookings()

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

  function sortGroup(booking: EnrichedBooking): number {
    if (booking.status === 'BOOKED' && !isExpired(booking)) return 0 // upcoming
    if (isExpired(booking)) return 1                                   // expired
    return 2                                                           // cancelled
  }

  const sortedBookings = bookings
    ? [...bookings].sort((a, b) => {
        const groupDiff = sortGroup(a) - sortGroup(b)
        if (groupDiff !== 0) return groupDiff
        // within upcoming: soonest first; within expired/cancelled: most recent first
        const dir = sortGroup(a) === 0 ? 1 : -1
        return dir * (new Date(a.slot_start_time).getTime() - new Date(b.slot_start_time).getTime())
      })
    : []

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
          {sortedBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} onCancelled={refetch} />
          ))}
        </div>
      )}
    </main>
  )
}
