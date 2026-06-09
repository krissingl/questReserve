import { useEffect, useState } from 'react'
import { getReviews, type ReviewItem } from '@/api/guest.api'

interface ReviewListProps {
  targetId: string
  targetType: 'provider' | 'customer' | 'location'
  refreshKey?: number
}

function StarDisplay({ rating, size = 18 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: '0.1rem' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill={star <= Math.round(rating) ? 'rgb(var(--accent))' : 'rgb(var(--muted-foreground) / 0.3)'}
          stroke={star <= Math.round(rating) ? 'rgb(var(--accent))' : 'rgb(var(--muted-foreground) / 0.5)'}
          strokeWidth="1"
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </span>
  )
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function ReviewList({ targetId, targetType, refreshKey = 0 }: ReviewListProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getReviews(targetId, targetType)
      .then((data) => {
        setReviews(data.reviews)
        setAverageRating(data.averageRating)
        setCount(data.count)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [targetId, targetType, refreshKey])

  if (loading) {
    return (
      <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))' }}>
        Loading reviews…
      </p>
    )
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <StarDisplay rating={averageRating} size={22} />
        <span style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))' }}>
          {count === 0
            ? 'No reviews yet'
            : `${averageRating.toFixed(1)} out of 5 (${count} review${count !== 1 ? 's' : ''})`}
        </span>
      </div>

      {reviews.length === 0 ? (
        <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))' }}>
          No reviews yet
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {reviews.map((review) => (
            <div
              key={review.id}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius)',
                backgroundColor: 'rgb(var(--card))',
                border: '1px solid rgb(var(--border))',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <StarDisplay rating={review.rating} size={16} />
                <span style={{ fontSize: 'var(--text-xs)', color: 'rgb(var(--muted-foreground))' }}>
                  {formatDate(review.created_at)}
                </span>
              </div>
              {review.body && (
                <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--foreground))', margin: 0 }}>
                  {review.body}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
