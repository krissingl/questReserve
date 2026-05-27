import { Link } from 'react-router-dom'
import { useMyLocations } from '@/hooks/useMyLocations'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useMyProviderBookings } from '@/hooks/useMyProviderBookings'
import type { BookingLocationWithSlotCount, Difficulty, ProviderBooking } from '@/types/domain'

const DIFFICULTY_COLOURS: Record<Difficulty, string> = {
  EASY: 'rgb(var(--success, 34 197 94))',
  MEDIUM: 'rgb(var(--warning, 234 179 8))',
  HARD: 'rgb(var(--destructive))',
  LEGENDARY: 'rgb(var(--primary))',
}

function formatDateTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return isoString
  }
}

const statCardStyle = {
  flex: '1 1 0',
  minWidth: '140px',
  padding: '1.25rem 1.5rem',
  borderRadius: 'var(--radius)',
  backgroundColor: 'rgb(var(--card))',
  boxShadow: 'var(--shadow-card)',
}

interface StatCardProps {
  label: string
  value: number | string
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div style={statCardStyle}>
      <div
        style={{
          fontSize: '2rem',
          fontFamily: 'var(--font-heading)',
          fontWeight: 'var(--weight-bold)',
          color: 'rgb(var(--accent))',
          lineHeight: 1,
          marginBottom: '0.4rem',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 'var(--text-sm)',
          color: 'rgb(var(--muted-foreground))',
          fontWeight: 'var(--weight-medium)',
        }}
      >
        {label}
      </div>
    </div>
  )
}

interface UpcomingBookingRowProps {
  booking: ProviderBooking
}

function UpcomingBookingRow({ booking }: UpcomingBookingRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius)',
        backgroundColor: 'rgb(var(--background))',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontWeight: 'var(--weight-semibold)',
            fontSize: 'var(--text-sm)',
            color: 'rgb(var(--foreground))',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {booking.location_name}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'rgb(var(--muted-foreground))', marginTop: '0.2rem' }}>
          {formatDateTime(booking.start_time)}
        </div>
      </div>
      <div
        style={{
          fontSize: '0.75rem',
          color: 'rgb(var(--muted-foreground))',
          flexShrink: 0,
        }}
      >
        Customer: {booking.end_user_id.slice(0, 8)}…
      </div>
    </div>
  )
}

interface AdventureCardProps {
  location: BookingLocationWithSlotCount
}

function AdventureCard({ location }: AdventureCardProps) {
  return (
    <div
      style={{
        padding: '1rem 1.25rem',
        borderRadius: 'var(--radius)',
        backgroundColor: 'rgb(var(--card))',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--weight-semibold)',
            color: 'rgb(var(--foreground))',
            fontSize: 'var(--text-base)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {location.name}
        </span>
        <span
          style={{
            display: 'inline-block',
            padding: '0.1rem 0.5rem',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.65rem',
            fontWeight: 'var(--weight-medium)',
            backgroundColor: DIFFICULTY_COLOURS[location.difficulty],
            color: 'rgb(var(--primary-foreground, 255 255 255))',
            flexShrink: 0,
          }}
        >
          {location.difficulty}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))' }}>
          {location.slot_count} slot{location.slot_count !== 1 ? 's' : ''}
        </span>
        <Link
          to={`/provider/locations/${location.id}`}
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius)',
            border: '1px solid rgb(var(--border))',
            color: 'rgb(var(--foreground))',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-medium)',
            textDecoration: 'none',
            backgroundColor: 'transparent',
          }}
        >
          View
        </Link>
        <Link
          to={`/provider/locations/${location.id}/edit`}
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius)',
            backgroundColor: 'rgb(var(--accent))',
            color: 'rgb(var(--accent-foreground))',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-semibold)',
            textDecoration: 'none',
          }}
        >
          Edit
        </Link>
      </div>
    </div>
  )
}

const sectionHeadingStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '1.15rem',
  fontWeight: 'var(--weight-bold)' as const,
  color: 'rgb(var(--foreground))',
  marginBottom: '0.75rem',
}

export function ProviderDashboard() {
  const { data: stats } = useDashboardStats()
  const { data: locations, isLoading: locationsLoading, error: locationsError } = useMyLocations()
  const { data: bookings } = useMyProviderBookings()

  const now = new Date()
  const upcomingBookings = bookings
    .filter((b) => b.status === 'BOOKED' && new Date(b.start_time) > now)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 5)

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto', width: '90%' }}>

      {/* Snapshot strip */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '2rem',
        }}
      >
        <StatCard label="Total Adventures" value={stats?.total_adventures ?? '—'} />
        <StatCard label="Open Slots" value={stats?.open_slots ?? '—'} />
        <StatCard label="Upcoming Bookings" value={stats?.upcoming_bookings ?? '—'} />
      </div>

      {/* Bookings snapshot */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h2 style={sectionHeadingStyle}>Upcoming Bookings</h2>
          <Link
            to="/provider/bookings"
            style={{
              fontSize: 'var(--text-sm)',
              color: 'rgb(var(--accent))',
              textDecoration: 'none',
              fontWeight: 'var(--weight-medium)',
            }}
          >
            View All Bookings →
          </Link>
        </div>

        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius)',
            backgroundColor: 'rgb(var(--card))',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {upcomingBookings.length === 0 ? (
            <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))' }}>
              No upcoming bookings.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {upcomingBookings.map((booking) => (
                <UpcomingBookingRow key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Adventures section */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
          }}
        >
          <h2 style={sectionHeadingStyle}>My Adventures</h2>
          <Link
            to="/provider/locations/new"
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius)',
              backgroundColor: 'rgb(var(--accent))',
              color: 'rgb(var(--accent-foreground))',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-semibold)',
              textDecoration: 'none',
            }}
          >
            + Add Adventure
          </Link>
        </div>

        {locationsLoading && (
          <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading adventures…</p>
        )}

        {!locationsLoading && locationsError && (
          <p style={{ color: 'rgb(var(--destructive))' }}>
            Failed to load adventures. Please try again.
          </p>
        )}

        {!locationsLoading && !locationsError && locations.length === 0 && (
          <div
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              borderRadius: 'var(--radius)',
              backgroundColor: 'rgb(var(--card))',
              color: 'rgb(var(--muted-foreground))',
            }}
          >
            <p>You haven&apos;t added any adventures yet.</p>
            <Link
              to="/provider/locations/new"
              style={{
                display: 'inline-block',
                marginTop: '1rem',
                padding: '0.5rem 1.25rem',
                borderRadius: 'var(--radius)',
                backgroundColor: 'rgb(var(--accent))',
                color: 'rgb(var(--accent-foreground))',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-semibold)',
                textDecoration: 'none',
              }}
            >
              Add Your First Adventure
            </Link>
          </div>
        )}

        {!locationsLoading && !locationsError && locations.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {locations.map((location) => (
              <AdventureCard key={location.id} location={location} />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
