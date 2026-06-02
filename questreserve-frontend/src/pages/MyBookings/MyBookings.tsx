import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMyBookings } from '@/hooks/useMyBookings'
import { useCancelBooking } from '@/hooks/useCancelBooking'
import { StatusBadge } from '@/components/StatusBadge'
import { MessageThread } from '@/components/MessageThread/MessageThread'
import { isExpired, isCancellable } from '@/utils/bookingUtils'
import { formatSlotTime } from '@/utils/formatSlotTime'
import type { Booking } from '@/types/domain'

function sortGroup(booking: Booking): number {
  if (booking.status === 'BOOKED' && !isExpired(booking)) return 0
  if (isExpired(booking)) return 1
  return 2
}

interface BookingCardProps {
  booking: Booking
  onCancelled: () => void
}

function BookingCard({ booking, onCancelled }: BookingCardProps) {
  const { cancelBooking, isLoading: cancelling } = useCancelBooking()
  const [confirming, setConfirming] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [showMessages, setShowMessages] = useState(false)

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
        backgroundColor: 'rgb(var(--card))',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <Link
          to={`/locations/${booking.booking_location_id}`}
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

      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgb(var(--border))' }}>
        <button
          type="button"
          onClick={() => setShowMessages((v) => !v)}
          style={{
            padding: '0.375rem 0.875rem',
            borderRadius: 'var(--radius)',
            border: '1px solid rgb(var(--accent) / 0.5)',
            backgroundColor: showMessages ? 'rgb(var(--accent) / 0.12)' : 'transparent',
            cursor: 'pointer',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-medium)',
            color: 'rgb(var(--accent))',
          }}
        >
          {showMessages ? 'Hide Messages' : 'Message Provider'}
        </button>
        {showMessages && (
          <div style={{ marginTop: '0.75rem' }}>
            <MessageThread bookingId={booking.id} perspective="customer" />
          </div>
        )}
      </div>
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

  const sortedBookings = bookings
    ? [...bookings].sort((a, b) => {
        const groupDiff = sortGroup(a) - sortGroup(b)
        if (groupDiff !== 0) return groupDiff
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
