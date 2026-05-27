import { useParams, Link } from 'react-router-dom'
import { useMyLocation } from '@/hooks/useMyLocation'
import { TimeSlotManager } from '@/components/TimeSlotManager/TimeSlotManager'
import type { Difficulty } from '@/types/domain'

const DIFFICULTY_COLOURS: Record<Difficulty, string> = {
  EASY: 'rgb(var(--success, 34 197 94))',
  MEDIUM: 'rgb(var(--warning, 234 179 8))',
  HARD: 'rgb(var(--destructive))',
  LEGENDARY: 'rgb(var(--primary))',
}

export function ProviderLocationDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: location, isLoading, error: fetchError } = useMyLocation(id ?? '')

  if (isLoading) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading adventure…</p>
      </div>
    )
  }

  if (fetchError || !location) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'rgb(var(--destructive))' }}>
          Failed to load adventure.
        </p>
        <Link
          to="/provider/dashboard"
          style={{
            display: 'inline-block',
            marginTop: '1rem',
            color: 'rgb(var(--accent))',
            textDecoration: 'none',
            fontSize: 'var(--text-sm)',
          }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '85%' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link
          to="/provider/dashboard"
          style={{
            fontSize: 'var(--text-sm)',
            color: 'rgb(var(--muted-foreground))',
            textDecoration: 'none',
          }}
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div
        style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius)',
          backgroundColor: 'rgb(var(--card))',
          boxShadow: 'var(--shadow-card)',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.75rem',
                fontWeight: 'var(--weight-bold)',
                color: 'rgb(var(--foreground))',
                margin: '0 0 0.5rem 0',
              }}
            >
              {location.name}
            </h1>
            <span
              style={{
                display: 'inline-block',
                padding: '0.15rem 0.6rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.7rem',
                fontWeight: 'var(--weight-medium)',
                backgroundColor: DIFFICULTY_COLOURS[location.difficulty],
                color: 'rgb(var(--primary-foreground, 255 255 255))',
              }}
            >
              {location.difficulty}
            </span>
          </div>
          <Link
            to={`/provider/locations/${id}/edit`}
            style={{
              flexShrink: 0,
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius)',
              border: '1px solid rgb(var(--border))',
              color: 'rgb(var(--foreground))',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
              textDecoration: 'none',
              backgroundColor: 'transparent',
            }}
          >
            Edit Adventure
          </Link>
        </div>

        {location.image_url && (
          <div
            style={{
              width: '100%',
              aspectRatio: '16 / 9',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              marginBottom: '1.25rem',
              backgroundColor: 'rgb(var(--background))',
            }}
          >
            <img
              src={location.image_url}
              alt={location.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        {location.description && (
          <div style={{ marginBottom: '1.25rem' }}>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1rem',
                fontWeight: 'var(--weight-semibold)',
                color: 'rgb(var(--foreground))',
                marginBottom: '0.5rem',
              }}
            >
              Description
            </h2>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'rgb(var(--muted-foreground))',
                lineHeight: '1.6',
              }}
            >
              {location.description}
            </p>
          </div>
        )}

        <div>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1rem',
              fontWeight: 'var(--weight-semibold)',
              color: 'rgb(var(--foreground))',
              marginBottom: '0.5rem',
            }}
          >
            Cancellation Policy
          </h2>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'rgb(var(--muted-foreground))',
              lineHeight: '1.6',
            }}
          >
            {location.cancellation_policy}
          </p>
        </div>
      </div>

      <TimeSlotManager locationId={id ?? ''} />
    </div>
  )
}
