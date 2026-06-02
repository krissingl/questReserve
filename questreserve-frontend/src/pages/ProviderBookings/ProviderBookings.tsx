import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMyProviderBookings } from '@/hooks/useMyProviderBookings'
import { AvatarIcon } from '@/components/AvatarIcon/AvatarIcon'
import type { ProviderBooking } from '@/types/domain'
import { formatDateTime } from '@/utils/format'

type SortKey = 'slot_date' | 'created_date'

function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString(undefined, { dateStyle: 'medium' })
  } catch {
    return isoString
  }
}

const statusColours: Record<string, { bg: string; text: string }> = {
  BOOKED: { bg: 'rgb(var(--success, 34 197 94) / 0.12)', text: 'rgb(var(--success, 34 197 94))' },
  CANCELLED: { bg: 'rgb(var(--muted))', text: 'rgb(var(--muted-foreground))' },
}

interface BookingCardProps {
  booking: ProviderBooking
}

function BookingCard({ booking }: BookingCardProps) {
  const colours = statusColours[booking.status] ?? statusColours.CANCELLED
  const hasName = booking.end_user_first_name && booking.end_user_last_name
  const customerFullName = hasName
    ? `${booking.end_user_first_name} ${booking.end_user_last_name}`
    : booking.end_user_id

  return (
    <div
      style={{
        padding: '1rem 1.25rem',
        borderRadius: 'var(--radius)',
        backgroundColor: 'rgb(var(--card))',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '0.5rem',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--weight-semibold)',
            color: 'rgb(var(--foreground))',
            fontSize: 'var(--text-base)',
          }}
        >
          {booking.location_name}
        </span>
        <span
          style={{
            flexShrink: 0,
            display: 'inline-block',
            padding: '0.15rem 0.6rem',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.7rem',
            fontWeight: 'var(--weight-medium)',
            backgroundColor: colours.bg,
            color: colours.text,
          }}
        >
          {booking.status}
        </span>
      </div>

      <div
        style={{
          fontSize: 'var(--text-sm)',
          color: 'rgb(var(--muted-foreground))',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem 1.5rem',
        }}
      >
        <span>
          <strong style={{ color: 'rgb(var(--foreground))' }}>Slot:</strong>{' '}
          {formatDateTime(booking.start_time)}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <strong style={{ color: 'rgb(var(--foreground))' }}>Customer:</strong>{' '}
          <Link
            to={`/provider/customers/${booking.end_user_id}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'rgb(var(--accent))', textDecoration: 'none', fontWeight: 'var(--weight-medium)' }}
          >
            {hasName && (
              <AvatarIcon
                firstName={booking.end_user_first_name!}
                lastName={booking.end_user_last_name!}
                size="sm"
                pictureUrl={booking.end_user_profile_picture_url}
              />
            )}
            {customerFullName}
          </Link>
        </span>
        <span>
          <strong style={{ color: 'rgb(var(--foreground))' }}>Booked on:</strong>{' '}
          {formatDate(booking.created_at)}
        </span>
      </div>
    </div>
  )
}

interface CountBadgeProps {
  count: number
}

function CountBadge({ count }: CountBadgeProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.1rem 0.5rem',
        borderRadius: 'var(--radius-pill)',
        fontSize: '0.72rem',
        fontWeight: 'var(--weight-medium)',
        backgroundColor: 'rgb(var(--muted))',
        color: 'rgb(var(--muted-foreground))',
        marginLeft: '0.4rem',
      }}
    >
      {count}
    </span>
  )
}

interface BookingSectionProps {
  title: string
  bookings: ProviderBooking[]
  emptyMessage: string
}

function BookingSection({ title, bookings, emptyMessage }: BookingSectionProps) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.15rem',
          fontWeight: 'var(--weight-bold)',
          color: 'rgb(var(--foreground))',
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {title}
        <CountBadge count={bookings.length} />
      </h2>

      {bookings.length === 0 ? (
        <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))' }}>
          {emptyMessage}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {bookings.map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </div>
      )}
    </div>
  )
}

export function ProviderBookings() {
  const { data: bookings, isLoading, error } = useMyProviderBookings()
  const [sortKey, setSortKey] = useState<SortKey>('slot_date')

  const nowRef = useRef(new Date())
  const now = nowRef.current

  const upcoming = bookings
    .filter((b) => b.status === 'BOOKED' && new Date(b.start_time) > now)
    .sort((a, b) =>
      sortKey === 'slot_date'
        ? new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

  const cancelled = bookings
    .filter((b) => b.status === 'CANCELLED')
    .sort((a, b) =>
      sortKey === 'slot_date'
        ? new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

  const past = bookings
    .filter((b) => b.status === 'BOOKED' && new Date(b.start_time) <= now)
    .sort((a, b) =>
      sortKey === 'slot_date'
        ? new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

  const selectStyle = {
    padding: '0.35rem 0.75rem',
    borderRadius: 'var(--radius)',
    border: '1px solid rgb(var(--border))',
    backgroundColor: 'rgb(var(--background))',
    color: 'rgb(var(--foreground))',
    fontSize: 'var(--text-sm)',
    lineHeight: '1.5',
    verticalAlign: 'middle',
    cursor: 'pointer',
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', width: '85%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.75rem',
            fontWeight: 'var(--weight-bold)',
            color: 'rgb(var(--foreground))',
            margin: 0,
          }}
        >
          My Bookings
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label
            htmlFor="sort-select"
            style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))' }}
          >
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            style={selectStyle}
          >
            <option value="slot_date">Adventure Date</option>
            <option value="created_date">Date Booked</option>
          </select>
        </div>
      </div>

      {isLoading && (
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading bookings…</p>
      )}

      {!isLoading && error && (
        <p style={{ color: 'rgb(var(--destructive))' }}>
          Failed to load bookings. Please try again.
        </p>
      )}

      {!isLoading && !error && (
        <>
          <BookingSection
            title="Upcoming"
            bookings={upcoming}
            emptyMessage="No upcoming bookings."
          />
          <BookingSection
            title="Cancelled"
            bookings={cancelled}
            emptyMessage="No cancelled bookings."
          />
          <BookingSection
            title="Past"
            bookings={past}
            emptyMessage="No past bookings."
          />
        </>
      )}
    </div>
  )
}
