import { useParams, Link } from 'react-router-dom'
import { MessageThread } from '@/components/MessageThread/MessageThread'

export function CustomerMessageThread() {
  const { bookingId } = useParams<{ bookingId: string }>()

  if (!bookingId) {
    return (
      <main style={{ padding: '2rem' }}>
        <p style={{ color: 'rgb(var(--destructive))' }}>Invalid message thread.</p>
      </main>
    )
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <Link
        to="/customer/messages"
        style={{
          display: 'inline-block',
          marginBottom: '1.25rem',
          fontSize: 'var(--text-sm)',
          color: 'rgb(var(--muted-foreground))',
          textDecoration: 'none',
        }}
      >
        &larr; Back to Messages
      </Link>
      <MessageThread bookingId={bookingId} perspective="customer" />
    </main>
  )
}
