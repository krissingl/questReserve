import { Link } from 'react-router-dom'
import { useBookingLocations } from '@/hooks/useBookingLocations'

const DIFFICULTY_COLOURS: Record<string, string> = {
  EASY: 'rgb(var(--success, 34 197 94))',
  MEDIUM: 'rgb(var(--warning, 234 179 8))',
  HARD: 'rgb(var(--destructive))',
  LEGENDARY: 'rgb(var(--primary))',
}

export function BrowseLocations() {
  const { data: locations, isLoading, error } = useBookingLocations()

  if (isLoading) {
    return (
      <main className="p-8">
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading locations…</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="p-8">
        <p style={{ color: 'rgb(var(--destructive))' }}>
          Failed to load locations. Please try again.
        </p>
      </main>
    )
  }

  return (
    <main className="p-8">
      <h1
        className="mb-6 text-2xl font-bold"
        style={{
          fontFamily: 'var(--font-heading)',
          color: 'rgb(var(--foreground))',
        }}
      >
        Browse Locations
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {locations?.map((location) => (
          <Link
            key={location.id}
            to={`/customer/locations/${location.id}`}
            className="block rounded-lg p-6 transition-opacity hover:opacity-80"
            style={{
              backgroundColor: 'rgb(var(--surface))',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h2
              className="mb-2 text-lg font-semibold"
              style={{
                fontFamily: 'var(--font-heading)',
                color: 'rgb(var(--foreground))',
              }}
            >
              {location.name}
            </h2>

            <span
              className="mb-3 inline-block rounded px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: DIFFICULTY_COLOURS[location.difficulty] ?? 'rgb(var(--primary))',
                color: 'rgb(var(--primary-foreground, 255 255 255))',
              }}
            >
              {location.difficulty}
            </span>

            {location.description && (
              <p
                className="mt-2 line-clamp-3 text-sm"
                style={{ color: 'rgb(var(--muted-foreground))' }}
              >
                {location.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </main>
  )
}
