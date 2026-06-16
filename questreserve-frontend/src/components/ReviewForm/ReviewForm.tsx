import { useState } from 'react'
import { z } from 'zod'
import { submitReview } from '@/api/reviews.api'
import axios from 'axios'

interface ReviewFormProps {
  bookingId: string
  targetId: string
  targetType: 'provider' | 'customer' | 'location'
  onSuccess?: () => void
}

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().max(1000).optional(),
})

type ReviewFormErrors = {
  rating?: string
  body?: string
}

export function ReviewForm({ bookingId, targetId, targetType, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<ReviewFormErrors>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFieldErrors({})
    setErrorMsg(null)
    setSuccessMsg(null)

    const parsed = reviewSchema.safeParse({ rating, body: body.trim() || undefined })
    if (!parsed.success) {
      const errs: ReviewFormErrors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof ReviewFormErrors
        if (!errs[field]) errs[field] = issue.message
      }
      setFieldErrors(errs)
      return
    }

    setSubmitting(true)
    try {
      await submitReview({
        targetId,
        targetType,
        bookingId,
        rating,
        body: body.trim() || null,
      })
      setSuccessMsg('Review submitted — thank you!')
      setRating(0)
      setBody('')
      onSuccess?.()
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setErrorMsg('You have already reviewed this')
      } else if (axios.isAxiosError(err) && err.response?.data?.error) {
        setErrorMsg(err.response.data.error as string)
      } else {
        setErrorMsg('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const displayRating = hovered || rating

  return (
    <div>
      <h4
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1rem',
          fontWeight: 'var(--weight-semibold)',
          color: 'rgb(var(--foreground))',
          marginBottom: '0.75rem',
        }}
      >
        Leave a Review
      </h4>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <div
            role="group"
            aria-label="Star rating"
            style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem' }}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0 0.1rem',
                  lineHeight: 1,
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="28"
                  height="28"
                  fill={star <= displayRating ? 'rgb(var(--accent))' : 'rgb(var(--muted-foreground) / 0.3)'}
                  stroke={star <= displayRating ? 'rgb(var(--accent))' : 'rgb(var(--muted-foreground) / 0.5)'}
                  strokeWidth="1"
                >
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
              </button>
            ))}
          </div>
          {fieldErrors.rating && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'rgb(var(--destructive))', margin: 0 }}>
              {fieldErrors.rating === 'Too small' ? 'Please select a star rating' : fieldErrors.rating}
            </p>
          )}
        </div>

        <div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your experience…"
            rows={4}
            maxLength={1000}
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
          {fieldErrors.body && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'rgb(var(--destructive))', margin: '0.25rem 0 0' }}>
              {fieldErrors.body}
            </p>
          )}
        </div>

        {successMsg && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--success))' }}>{successMsg}</p>
        )}
        {errorMsg && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--destructive))' }}>{errorMsg}</p>
        )}

        <div>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius)',
              backgroundColor: 'rgb(var(--accent))',
              color: 'rgb(var(--accent-foreground))',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-semibold)',
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  )
}
