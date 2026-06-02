import { useEffect, useRef, useState } from 'react'
import { getMessages, sendMessage, markMessageRead } from '@/api/provider.api'
import type { Message } from '@/api/provider.api'

interface MessageThreadProps {
  bookingId: string
  perspective?: 'provider' | 'customer'
  otherName?: string
}

function formatTimestamp(isoString: string): string {
  return new Date(isoString).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
}

export function MessageThread({ bookingId, perspective = 'provider', otherName }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const markedRef = useRef(false)

  const mySenderType = perspective
  const otherSenderType = perspective === 'provider' ? 'customer' : 'provider'

  useEffect(() => {
    markedRef.current = false
    setLoading(true)
    getMessages(bookingId)
      .then((data) => {
        setMessages(data)
        setLoading(false)
        if (!markedRef.current) {
          markedRef.current = true
          const unread = data.filter((m) => m.sender_type === otherSenderType && m.read_at === null)
          unread.forEach((m) => {
            markMessageRead(m.id).catch(() => {})
          })
        }
      })
      .catch(() => {
        setLoading(false)
      })
  }, [bookingId, otherSenderType])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setSending(true)
    setSendError(null)
    try {
      const newMessage = await sendMessage(bookingId, body.trim())
      setMessages((prev) => [...prev, newMessage])
      setBody('')
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : 'Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <h3
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1rem',
          fontWeight: 'var(--weight-semibold)',
          color: 'rgb(var(--foreground))',
          marginBottom: '0.75rem',
        }}
      >
        Messages
      </h3>

      {loading ? (
        <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))' }}>
          Loading messages…
        </p>
      ) : messages.length === 0 ? (
        <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))', marginBottom: '1rem' }}>
          No messages yet — start the conversation
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          {messages.map((m) => {
            const isMe = m.sender_type === mySenderType
            return (
              <div
                key={m.id}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius)',
                  backgroundColor: isMe ? 'rgb(var(--accent) / 0.15)' : 'rgb(var(--card))',
                  border: isMe ? '1px solid rgb(var(--accent) / 0.3)' : '1px solid rgb(var(--border))',
                }}
              >
                <p style={{ fontSize: '0.7rem', fontWeight: 'var(--weight-medium)', color: 'rgb(var(--muted-foreground))', marginBottom: '0.2rem' }}>
                  {isMe ? 'You' : (otherName ?? (perspective === 'customer' ? 'Provider' : 'Customer'))}
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--foreground))', margin: 0 }}>
                  {m.body}
                </p>
                <p style={{ fontSize: '0.65rem', color: 'rgb(var(--muted-foreground))', marginTop: '0.25rem', textAlign: isMe ? 'right' : 'left' }}>
                  {formatTimestamp(m.created_at)}
                </p>
              </div>
            )
          })}
        </div>
      )}

      <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a message…"
          rows={3}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius)',
            border: '1px solid rgb(var(--border))',
            fontSize: 'var(--text-sm)',
            backgroundColor: 'rgb(var(--background))',
            color: 'rgb(var(--foreground))',
            resize: 'vertical',
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />
        {sendError && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--destructive))' }}>{sendError}</p>
        )}
        <div>
          <button
            type="submit"
            disabled={sending || !body.trim()}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius)',
              backgroundColor: 'rgb(var(--accent))',
              color: 'rgb(var(--accent-foreground))',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-semibold)',
              border: 'none',
              cursor: sending || !body.trim() ? 'not-allowed' : 'pointer',
              opacity: sending || !body.trim() ? 0.6 : 1,
            }}
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}
