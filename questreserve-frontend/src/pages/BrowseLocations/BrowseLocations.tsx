import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useBookingLocations } from '@/hooks/useBookingLocations'
import { useLocationImages } from '@/hooks/useLocationImages'
import { FilterDrawer } from '@/components/FilterDrawer/FilterDrawer'
import { LocationGallery } from '@/components/LocationGallery/LocationGallery'
import type { BookingLocation, Difficulty, LocationFilters } from '@/types/domain'
import { DIFFICULTY_OPTIONS } from '@/types/domain'

const DIFFICULTY_COLOURS: Record<Difficulty, string> = {  EASY: 'rgb(var(--success, 34 197 94))',
  MEDIUM: 'rgb(var(--warning, 234 179 8))',
  HARD: 'rgb(var(--destructive))',
  LEGENDARY: 'rgb(var(--primary))',
}

interface LocationListItemProps {
  location: BookingLocation
  isFocused: boolean
  onClick: () => void
}

function LocationListItem({ location, isFocused, onClick }: LocationListItemProps) {
  return (
    <div
      style={{
        padding: '0.75rem',
        background: isFocused ? 'rgb(var(--accent) / 0.15)' : 'transparent',
        border: `1px solid ${isFocused ? 'rgb(var(--accent))' : 'transparent'}`,
        borderRadius: 'var(--radius)',
        transition: 'background 0.1s ease, border-color 0.1s ease',
      }}
    >
      <button
        type="button"
        onClick={onClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          width: '100%',
          background: 'transparent',
          border: 'none',
          padding: 0,
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            flexShrink: 0,
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            backgroundColor: 'rgb(var(--card))',
            position: 'relative',
          }}
        >
          {location.image_url ? (
            <img
              src={location.image_url}
              alt={location.name}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
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
              <span style={{ fontSize: '1.1rem', opacity: 0.3, color: 'rgb(var(--foreground))' }}>&#9956;</span>
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
              marginBottom: '0.2rem',
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

    </div>
  )
}

interface GalleryPanelProps {
  location: BookingLocation
  onNavigate: () => void
}

function GalleryPanel({ location, onNavigate }: GalleryPanelProps) {
  const { data: images, isLoading: imagesLoading, error: imagesError } = useLocationImages(location.id)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div
        style={{
          padding: '1rem 1.5rem 0.75rem',
          flexShrink: 0,
          borderBottom: '1px solid rgb(var(--border))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.1rem',
              fontWeight: 'var(--weight-bold)',
              color: 'rgb(var(--foreground))',
              marginBottom: '0.3rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {location.name}
          </h2>
          <span
            style={{
              display: 'inline-block',
              padding: '0.1rem 0.5rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.65rem',
              fontWeight: 'var(--weight-medium)',
              backgroundColor: DIFFICULTY_COLOURS[location.difficulty],
              color: 'rgb(var(--primary-foreground, 255 255 255))',
            }}
          >
            {location.difficulty}
          </span>
          {location.description && (
            <p
              style={{
                marginTop: '0.6rem',
                fontSize: 'var(--text-sm)',
                color: 'rgb(var(--muted-foreground))',
                lineHeight: '1.6',
              }}
            >
              {location.description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onNavigate}
          style={{
            flexShrink: 0,
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius)',
            backgroundColor: 'rgb(var(--accent))',
            color: 'rgb(var(--accent-foreground))',
            border: 'none',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-semibold)',
            cursor: 'pointer',
          }}
        >
          View &amp; Book →
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: '1rem 1.5rem' }}>
        {imagesLoading ? (
          <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading images…</p>
        ) : imagesError ? (
          <p style={{ color: 'rgb(var(--destructive))' }}>Failed to load images.</p>
        ) : (
          <LocationGallery
            images={images ?? []}
            locationName={location.name}
          />
        )}
      </div>
    </div>
  )
}

export function BrowseLocations() {
  const navigate = useNavigate()
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
        flex: 1,
        overflow: 'hidden',
      }}
    >
      {/* Toolbar */}
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
          Browse Adventures
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

      {/* Loading / error / empty states */}
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

      {/* Main split panel */}
      {!isLoading && !error && locations && locations.length > 0 && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left panel — 30% */}
          <div
            style={{
              width: '30%',
              flexShrink: 0,
              overflowY: 'auto',
              borderRight: '1px solid rgb(var(--border))',
              padding: '0.5rem',
              backgroundColor: 'rgb(var(--background))',
            }}
          >
            {locations.map((location) => (
              <LocationListItem
                key={location.id}
                location={location}
                isFocused={focusedLocation?.id === location.id}
                onClick={() => setFocusedId(location.id)}
              />
            ))}
          </div>

          {/* Right panel — 70% gallery */}
          <div
            style={{
              flex: 1,
              overflow: 'hidden',
              backgroundColor: 'rgb(var(--card))',
            }}
          >
            {focusedLocation && (
              <GalleryPanel
                location={focusedLocation}
                onNavigate={() => navigate(`/locations/${focusedLocation.id}`)}
              />
            )}
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
