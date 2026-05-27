import { Link } from 'react-router-dom'
import { useMyLocations } from '@/hooks/useMyLocations'
import type { BookingLocation, Difficulty } from '@/types/domain'

const DIFFICULTY_COLOURS: Record<Difficulty, string> = {
  EASY: 'rgb(var(--success, 34 197 94))',
  MEDIUM: 'rgb(var(--warning, 234 179 8))',
  HARD: 'rgb(var(--destructive))',
  LEGENDARY: 'rgb(var(--primary))',
}

interface LocationRowProps {
  location: BookingLocation
}

function LocationRow({ location }: LocationRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.25rem',
        borderRadius: 'var(--radius)',
        backgroundColor: 'rgb(var(--card))',
        boxShadow: 'var(--shadow-card)',
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

      <Link
        to={`/provider/locations/${location.id}`}
        style={{
          flexShrink: 0,
          marginLeft: '1rem',
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius)',
          backgroundColor: 'rgb(var(--accent))',
          color: 'rgb(var(--accent-foreground))',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--weight-semibold)',
          textDecoration: 'none',
        }}
      >
        Manage
      </Link>
    </div>
  )
}

export function ProviderDashboard() {
  const { data: locations, isLoading, error } = useMyLocations()

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
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
          My Adventures
        </h1>
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

      {isLoading && (
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading adventures…</p>
      )}

      {!isLoading && error && (
        <p style={{ color: 'rgb(var(--destructive))' }}>
          Failed to load adventures. Please try again.
        </p>
      )}

      {!isLoading && !error && locations.length === 0 && (
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

      {!isLoading && !error && locations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {locations.map((location) => (
            <LocationRow key={location.id} location={location} />
          ))}
        </div>
      )}
    </div>
  )
}
