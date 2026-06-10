import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMyLocation } from '@/hooks/useMyLocation'
import { TimeSlotManager } from '@/components/TimeSlotManager/TimeSlotManager'
import { ReviewList } from '@/components/ReviewList/ReviewList'
import { getReviews } from '@/api/guest.api'
import { DIFFICULTY_COLOURS } from '@/constants/difficulty'

export function ProviderLocationDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: location, isLoading, error: fetchError } = useMyLocation(id ?? '')
  const [reviewsOpen, setReviewsOpen] = useState(false)
  const [reviewSummary, setReviewSummary] = useState<{ averageRating: number; count: number } | null>(null)

  useEffect(() => {
    if (!id) return
    getReviews(id, 'location')
      .then((data) => setReviewSummary({ averageRating: data.averageRating, count: data.count }))
      .catch(() => {})
  }, [id])

  if (!id) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'rgb(var(--destructive))' }}>Invalid adventure ID.</p>
      </div>
    )
  }

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

      <TimeSlotManager locationId={id} />

      <div
        style={{
          marginTop: '1.5rem',
          borderRadius: 'var(--radius)',
          backgroundColor: 'rgb(var(--card))',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
        }}
      >
        <button
          type="button"
          onClick={() => setReviewsOpen((o) => !o)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '1rem 1.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1rem',
                fontWeight: 'var(--weight-semibold)',
                color: 'rgb(var(--foreground))',
              }}
            >
              Guest Reviews
            </span>
            {reviewSummary !== null && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill={star <= Math.round(reviewSummary.averageRating) ? 'rgb(var(--accent))' : 'rgb(var(--muted-foreground) / 0.3)'}
                    stroke={star <= Math.round(reviewSummary.averageRating) ? 'rgb(var(--accent))' : 'rgb(var(--muted-foreground) / 0.5)'}
                    strokeWidth="1"
                  >
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                ))}
                <span style={{ fontSize: 'var(--text-xs)', color: 'rgb(var(--muted-foreground))' }}>
                  {reviewSummary.count === 0
                    ? 'No reviews yet'
                    : `${reviewSummary.averageRating.toFixed(1)} (${reviewSummary.count})`}
                </span>
              </span>
            )}
          </span>
          <span
            style={{
              fontSize: 'var(--text-sm)',
              color: 'rgb(var(--muted-foreground))',
              transform: reviewsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease',
              display: 'inline-block',
            }}
          >
            &#9660;
          </span>
        </button>

        {reviewsOpen && (
          <div style={{ padding: '0 1.5rem 1.5rem' }}>
            <ReviewList targetId={id} targetType="location" />
          </div>
        )}
      </div>
    </div>
  )
}
