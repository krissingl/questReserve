import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useBookingLocations } from '@/hooks/useBookingLocations'
import { FilterDrawer } from '@/components/FilterDrawer/FilterDrawer'
import type { Difficulty, LocationFilters } from '@/types/domain'
import { DIFFICULTY_OPTIONS } from '@/types/domain'

const DIFFICULTY_COLOURS: Record<Difficulty, string> = {
  EASY: 'rgb(var(--success, 34 197 94))',
  MEDIUM: 'rgb(var(--warning, 234 179 8))',
  HARD: 'rgb(var(--destructive))',
  LEGENDARY: 'rgb(var(--primary))',
}

function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={`skeleton-${i}`}
          className="rounded-lg p-6"
          style={{
            backgroundColor: 'rgb(var(--card))',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            style={{
              height: '1.25rem',
              width: '60%',
              borderRadius: 'var(--radius)',
              backgroundColor: 'rgb(var(--muted))',
              marginBottom: '0.75rem',
            }}
          />
          <div
            style={{
              height: '1rem',
              width: '25%',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'rgb(var(--muted))',
              marginBottom: '0.75rem',
            }}
          />
          <div
            style={{
              height: '0.75rem',
              width: '90%',
              borderRadius: 'var(--radius)',
              backgroundColor: 'rgb(var(--muted))',
              marginBottom: '0.5rem',
            }}
          />
          <div
            style={{
              height: '0.75rem',
              width: '70%',
              borderRadius: 'var(--radius)',
              backgroundColor: 'rgb(var(--muted))',
            }}
          />
        </div>
      ))}
    </div>
  )
}

export function BrowseLocations() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filtersHovered, setFiltersHovered] = useState(false)

  const rawDifficulty = searchParams.get('difficulty')
  const appliedFilters: LocationFilters = {
    difficulty: DIFFICULTY_OPTIONS.find((d) => d === rawDifficulty),
  }

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length
  const hasActiveFilters = activeFilterCount > 0

  const { data: locations, isLoading, error } = useBookingLocations(appliedFilters)

  function handleApply(filters: LocationFilters) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (filters.difficulty) {
        next.set('difficulty', filters.difficulty)
      } else {
        next.delete('difficulty')
      }
      return next
    })
  }

  function handleClearFilters() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('difficulty')
      return next
    })
  }

  const isEmpty = !isLoading && !error && locations?.length === 0

  const filtersButtonActive = hasActiveFilters || filtersHovered

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

      <div className="mb-6">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          onMouseEnter={() => setFiltersHovered(true)}
          onMouseLeave={() => setFiltersHovered(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            border: `1px solid ${filtersButtonActive ? 'rgb(var(--accent))' : 'rgb(var(--border))'}`,
            borderRadius: 'var(--radius-pill)',
            background: hasActiveFilters
              ? 'rgb(var(--accent))'
              : filtersHovered
              ? 'rgb(var(--accent) / 0.08)'
              : 'transparent',
            color: hasActiveFilters
              ? 'rgb(var(--accent-foreground))'
              : filtersHovered
              ? 'rgb(var(--accent))'
              : 'rgb(var(--foreground))',
            cursor: 'pointer',
            fontSize: 'var(--text-sm)',
            fontWeight: hasActiveFilters ? 'var(--weight-semibold)' : 'var(--weight-regular)',
            boxShadow: hasActiveFilters && filtersHovered
              ? '0 0 10px rgb(var(--accent) / 0.45)'
              : 'none',
            transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
          }}
        >
          Filters
          {hasActiveFilters && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '1.25rem',
                height: '1.25rem',
                borderRadius: '9999px',
                backgroundColor: 'rgb(var(--primary))',
                color: 'rgb(var(--primary-foreground))',
                fontSize: '0.7rem',
                fontWeight: 'var(--weight-bold)',
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {isLoading && <SkeletonGrid />}

      {!isLoading && error && (
        <p style={{ color: 'rgb(var(--destructive))' }}>
          Failed to load locations. Please try again.
        </p>
      )}

      {isEmpty && hasActiveFilters && (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <p
            style={{
              color: 'rgb(var(--muted-foreground))',
              marginBottom: '1rem',
            }}
          >
            No locations match your filters.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            style={{
              padding: '0.4rem 1rem',
              border: '1px solid rgb(var(--border))',
              borderRadius: 'var(--radius-pill)',
              background: 'transparent',
              color: 'rgb(var(--foreground))',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      {isEmpty && !hasActiveFilters && (
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>No locations found.</p>
      )}

      {!isLoading && !error && locations && locations.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <Link
              key={location.id}
              to={`/locations/${location.id}`}
              className="block rounded-lg p-6 transition-opacity hover:opacity-80"
              style={{
                backgroundColor: 'rgb(var(--card))',
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
                  backgroundColor: DIFFICULTY_COLOURS[location.difficulty],
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
      )}

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        applied={appliedFilters}
        onApply={handleApply}
      />
    </main>
  )
}
