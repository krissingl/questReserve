import { useParams, Link } from 'react-router-dom'
import { MessageThread } from '@/components/MessageThread/MessageThread'
import { useMyProviderBookings } from '@/hooks/useMyProviderBookings'

export function ProviderMessageThread() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const { data: bookings } = useMyProviderBookings()

  if (!bookingId) {
    return (
      <main style={{ padding: '2rem' }}>
        <p style={{ color: 'rgb(var(--destructive))' }}>Invalid message thread.</p>
      </main>
    )
  }

  const booking = bookings.find((b) => b.id === bookingId)
  const customerName =
    booking?.end_user_first_name && booking?.end_user_last_name
      ? `${booking.end_user_first_name} ${booking.end_user_last_name}`
      : undefined

  return (
    <main style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <Link
        to="/provider/bookings"
        style={{
          display: 'inline-block',
          marginBottom: '1.25rem',
          fontSize: 'var(--text-sm)',
          color: 'rgb(var(--muted-foreground))',
          textDecoration: 'none',
        }}
      >
        &larr; Back to Bookings
      </Link>
      <MessageThread bookingId={bookingId} perspective="provider" otherName={customerName} />
    </main>
  )
}
