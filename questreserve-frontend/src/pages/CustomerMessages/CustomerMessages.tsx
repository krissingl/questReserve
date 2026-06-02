import { useEffect, useState } from 'react'
import { getInbox } from '@/api/provider.api'
import { MessageThread } from '@/components/MessageThread/MessageThread'
import type { InboxEntry } from '@/api/provider.api'

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function CustomerMessages() {
  const [inbox, setInbox] = useState<InboxEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openBookingId, setOpenBookingId] = useState<string | null>(null)

  useEffect(() => {
    getInbox()
      .then((data) => {
        setInbox(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load messages.')
        setLoading(false)
      })
  }, [])

  function handleOpen(bookingId: string) {
    setOpenBookingId((prev) => (prev === bookingId ? null : bookingId))
    setInbox((prev) =>
      prev.map((e) => (e.booking_id === bookingId ? { ...e, unread_count: 0 } : e))
    )
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.75rem',
          fontWeight: 'var(--weight-bold)',
          color: 'rgb(var(--foreground))',
          marginBottom: '1.5rem',
        }}
      >
        Messages
      </h1>

      {loading && (
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading messages…</p>
      )}

      {!loading && error && (
        <p style={{ color: 'rgb(var(--destructive))' }}>{error}</p>
      )}

      {!loading && !error && inbox.length === 0 && (
        <p style={{ color: 'rgb(var(--muted-foreground))', fontSize: 'var(--text-sm)' }}>
          No messages yet. Book an adventure and start a conversation with your provider.
        </p>
      )}

      {!loading && !error && inbox.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {inbox.map((entry) => (
            <div
              key={entry.booking_id}
              style={{
                borderRadius: 'var(--radius)',
                backgroundColor: 'rgb(var(--card))',
                boxShadow: 'var(--shadow-card)',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => handleOpen(entry.booking_id)}
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 'var(--weight-semibold)',
                        fontSize: 'var(--text-base)',
                        color: 'rgb(var(--foreground))',
                      }}
                    >
                      {entry.location_name}
                    </span>
                    {entry.unread_count > 0 && (
                      <span
                        style={{
                          display: 'inline-block',
                          minWidth: '18px',
                          height: '18px',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: 'rgb(var(--accent))',
                          color: 'rgb(var(--accent-foreground))',
                          fontSize: '0.65rem',
                          fontWeight: 'var(--weight-bold)',
                          textAlign: 'center',
                          lineHeight: '18px',
                          padding: '0 5px',
                        }}
                      >
                        {entry.unread_count}
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'rgb(var(--muted-foreground))',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      margin: 0,
                    }}
                  >
                    {entry.last_message_body}
                  </p>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'rgb(var(--muted-foreground))', flexShrink: 0 }}>
                  {formatRelativeTime(entry.last_message_at)}
                </span>
              </button>

              {openBookingId === entry.booking_id && (
                <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid rgb(var(--border))' }}>
                  <div style={{ paddingTop: '0.75rem' }}>
                    <MessageThread bookingId={entry.booking_id} perspective="customer" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
