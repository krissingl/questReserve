import { Link, useParams } from 'react-router-dom'
import { useBookingLocation } from '@/hooks/useBookingLocation'

export function LocationDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: location, isLoading, error } = useBookingLocation(id ?? '')

  if (isLoading) {
    return (
      <main className="p-8">
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading location…</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="p-8">
        <Link
          to="/customer/locations"
          className="mb-4 inline-block text-sm underline-offset-4 hover:underline"
          style={{ color: 'rgb(var(--accent))' }}
        >
          &larr; Back to Locations
        </Link>
        <p className="mt-4" style={{ color: 'rgb(var(--destructive))' }}>
          Location not found or an error occurred.
        </p>
      </main>
    )
  }

  if (!location) return null

  return (
    <main className="p-8">
      <Link
        to="/customer/locations"
        className="mb-4 inline-block text-sm underline-offset-4 hover:underline"
        style={{ color: 'rgb(var(--accent))' }}
      >
        &larr; Back to Locations
      </Link>

      <div
        className="mt-4 rounded-lg p-8"
        style={{
          backgroundColor: 'rgb(var(--surface))',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <h1
          className="mb-2 text-3xl font-bold"
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'rgb(var(--foreground))',
          }}
        >
          {location.name}
        </h1>

        <span
          className="inline-block rounded px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: 'rgb(var(--primary))',
            color: 'rgb(var(--primary-foreground, 255 255 255))',
          }}
        >
          {location.difficulty}
        </span>

        {location.description && (
          <p
            className="mt-6 text-sm leading-relaxed"
            style={{ color: 'rgb(var(--foreground))' }}
          >
            {location.description}
          </p>
        )}

        <div className="mt-6">
          <h2
            className="mb-1 text-sm font-semibold uppercase tracking-wide"
            style={{ color: 'rgb(var(--muted-foreground))' }}
          >
            Cancellation Policy
          </h2>
          <p
            className="text-sm"
            style={{ color: 'rgb(var(--foreground))' }}
          >
            {location.cancellation_policy}
          </p>
        </div>
      </div>
    </main>
  )
}
