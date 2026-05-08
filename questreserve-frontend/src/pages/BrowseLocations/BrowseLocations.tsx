import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useBookingLocations } from '@/hooks/useBookingLocations'
import { FilterDrawer } from '@/components/FilterDrawer/FilterDrawer'
import type { BookingLocation, Difficulty, LocationFilters } from '@/types/domain'
import { DIFFICULTY_OPTIONS } from '@/types/domain'

const DIFFICULTY_COLOURS: Record<Difficulty, string> = {
  EASY: 'rgb(var(--success, 34 197 94))',
  MEDIUM: 'rgb(var(--warning, 234 179 8))',
  HARD: 'rgb(var(--destructive))',
  LEGENDARY: 'rgb(var(--primary))',
}

const HEADER_HEIGHT = '64px'

interface LocationThumbnailProps {
  location: BookingLocation
  isFocused: boolean
  onClick: () => void
}

function LocationThumbnail({ location, isFocused, onClick }: LocationThumbnailProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        width: '100%',
        padding: '0.75rem',
        textAlign: 'left',
        background: isFocused ? 'rgb(var(--accent) / 0.15)' : 'transparent',
        border: `1px solid ${isFocused ? 'rgb(var(--accent))' : 'transparent'}`,
        borderRadius: 'var(--radius)',
        cursor: 'pointer',
        transition: 'background 0.1s ease, border-color 0.1s ease',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          backgroundColor: 'rgb(var(--background))',
          position: 'relative',
        }}
      >
        {location.image_url ? (
          <img
            src={location.image_url}
            alt={location.name}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgb(var(--card))',
            }}
          >
            <span style={{ fontSize: '1.25rem', opacity: 0.3, color: 'rgb(var(--foreground))' }}>
              &#9956;
            </span>
          </div>
        )}
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--weight-semibold)',
            color: isFocused ? 'rgb(var(--accent))' : 'rgb(var(--foreground))',
            fontSize: 'var(--text-sm)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginBottom: '0.25rem',
          }}
        >
          {location.name}
        </p>
        <span
          style={{
            display: 'inline-block',
            padding: '0.1rem 0.4rem',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.65rem',
            fontWeight: 'var(--weight-medium)',
            backgroundColor: DIFFICULTY_COLOURS[location.difficulty],
            color: 'rgb(var(--primary-foreground, 255 255 255))',
          }}
        >
          {location.difficulty}
        </span>
      </div>
    </button>
  )
}

interface PreviewPanelProps {
  location: BookingLocation
}

function PreviewPanel({ location }: PreviewPanelProps) {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%',
          backgroundColor: 'rgb(var(--background))',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {location.image_url ? (
          <img
            src={location.image_url}
            alt={location.name}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgb(var(--card))',
            }}
          >
            <span style={{ fontSize: '4rem', opacity: 0.2, color: 'rgb(var(--foreground))' }}>
              &#9956;
            </span>
          </div>
        )}
      </div>

      <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.5rem',
            fontWeight: 'var(--weight-bold)',
            color: 'rgb(var(--foreground))',
            marginBottom: '0.5rem',
          }}
        >
          {location.name}
        </h2>

        <span
          style={{
            display: 'inline-block',
            padding: '0.15rem 0.5rem',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.7rem',
            fontWeight: 'var(--weight-medium)',
            backgroundColor: DIFFICULTY_COLOURS[location.difficulty],
            color: 'rgb(var(--primary-foreground, 255 255 255))',
            marginBottom: '1rem',
          }}
        >
          {location.difficulty}
        </span>

        {location.description && (
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'rgb(var(--muted-foreground))',
              lineHeight: '1.6',
              marginBottom: '1.5rem',
            }}
          >
            {location.description}
          </p>
        )}

        <button
          type="button"
          onClick={() => navigate(`/locations/${location.id}`)}
          aria-label={`View and book ${location.name}`}
          style={{
            display: 'inline-block',
            padding: '0.6rem 1.5rem',
            borderRadius: 'var(--radius)',
            backgroundColor: 'rgb(var(--accent))',
            color: 'rgb(var(--accent-foreground))',
            fontWeight: 'var(--weight-semibold)',
            fontSize: 'var(--text-sm)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          View &amp; Book
        </button>
      </div>
    </div>
  )
}

export function BrowseLocations() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filtersHovered, setFiltersHovered] = useState(false)
  const [focusedId, setFocusedId] = useState<string | null>(null)

  const rawDifficulty = searchParams.get('difficulty')
  const appliedFilters: LocationFilters = {
    difficulty: DIFFICULTY_OPTIONS.find((d) => d === rawDifficulty),
  }

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length
  const hasActiveFilters = activeFilterCount > 0

  const { data: locations, isLoading, error } = useBookingLocations(appliedFilters)

  const focusedLocation =
    locations && locations.length > 0
      ? locations.find((l) => l.id === focusedId) ?? locations[0]
      : null

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
    setFocusedId(null)
  }

  function handleClearFilters() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('difficulty')
      return next
    })
    setFocusedId(null)
  }

  const isEmpty = !isLoading && !error && locations?.length === 0
  const filtersButtonActive = hasActiveFilters || filtersHovered

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: `calc(100vh - ${HEADER_HEIGHT})`,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '0.75rem 1.5rem',
          borderBottom: '1px solid rgb(var(--border))',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexShrink: 0,
          backgroundColor: 'rgb(var(--background))',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.1rem',
            fontWeight: 'var(--weight-bold)',
            color: 'rgb(var(--foreground))',
            margin: 0,
          }}
        >
          Browse Locations
        </h1>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          onMouseEnter={() => setFiltersHovered(true)}
          onMouseLeave={() => setFiltersHovered(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.9rem',
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
            transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
          }}
        >
          Filters
          {hasActiveFilters && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '1.1rem',
                height: '1.1rem',
                borderRadius: '9999px',
                backgroundColor: 'rgb(var(--primary))',
                color: 'rgb(var(--primary-foreground))',
                fontSize: '0.65rem',
                fontWeight: 'var(--weight-bold)',
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {isLoading && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading locations…</p>
        </div>
      )}

      {!isLoading && error && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'rgb(var(--destructive))' }}>Failed to load locations. Please try again.</p>
        </div>
      )}

      {isEmpty && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
          }}
        >
          <p style={{ color: 'rgb(var(--muted-foreground))' }}>
            {hasActiveFilters ? 'No locations match this filter.' : 'No locations found.'}
          </p>
          {hasActiveFilters && (
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
          )}
        </div>
      )}

      {!isLoading && !error && locations && locations.length > 0 && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div
            style={{
              width: '280px',
              flexShrink: 0,
              overflowY: 'auto',
              borderRight: '1px solid rgb(var(--border))',
              padding: '0.5rem',
              backgroundColor: 'rgb(var(--background))',
            }}
          >
            {locations.map((location) => (
              <LocationThumbnail
                key={location.id}
                location={location}
                isFocused={focusedLocation?.id === location.id}
                onClick={() => setFocusedId(location.id)}
              />
            ))}
          </div>

          <div
            style={{
              flex: 1,
              overflow: 'hidden',
              backgroundColor: 'rgb(var(--card))',
            }}
          >
            {focusedLocation && <PreviewPanel location={focusedLocation} />}
          </div>
        </div>
      )}

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        applied={appliedFilters}
        onApply={handleApply}
      />
    </div>
  )
}
