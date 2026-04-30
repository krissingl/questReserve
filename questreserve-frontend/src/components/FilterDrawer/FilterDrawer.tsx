import { useState, useEffect } from 'react'
import type { LocationFilters } from '@/types/domain'
import { DIFFICULTY_OPTIONS } from '@/types/domain'

interface FilterDrawerProps {
  open: boolean
  onClose: () => void
  applied: LocationFilters
  onApply: (filters: LocationFilters) => void
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden={true}>
      <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function FilterDrawer({ open, onClose, applied, onApply }: FilterDrawerProps) {
  const [draft, setDraft] = useState<LocationFilters>(applied)
  const [hoveredChip, setHoveredChip] = useState<string | null>(null)
  const [closeHovered, setCloseHovered] = useState(false)
  const [clearHovered, setClearHovered] = useState(false)
  const [applyHovered, setApplyHovered] = useState(false)

  useEffect(() => {
    if (open) setDraft(applied)
  }, [open, applied])

  function handleApply() {
    onApply(draft)
    onClose()
  }

  function handleClearAll() {
    setDraft({})
  }

  return (
    <>
      <div
        aria-hidden={true}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 40,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      <aside
        aria-label="Filters"
        style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          height: 'calc(100% - 64px)',
          width: '320px',
          backgroundColor: 'rgb(var(--card))',
          zIndex: 50,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgb(var(--border))',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--weight-semibold)',
              color: 'rgb(var(--foreground))',
            }}
          >
            Filters
          </span>
          <button
            type="button"
            aria-label="Close filters"
            onClick={onClose}
            onMouseEnter={() => setCloseHovered(true)}
            onMouseLeave={() => setCloseHovered(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: closeHovered ? 'rgb(var(--foreground))' : 'rgb(var(--muted-foreground))',
              lineHeight: 1,
              padding: '0.25rem',
              transition: 'color 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CloseIcon />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <p
            style={{
              fontWeight: 'var(--weight-semibold)',
              color: 'rgb(var(--foreground))',
              marginBottom: '0.75rem',
              fontSize: 'var(--text-sm)',
            }}
          >
            Difficulty
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {DIFFICULTY_OPTIONS.map((d) => {
              const isActive = draft.difficulty === d
              const isHovered = hoveredChip === d
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      difficulty: isActive ? undefined : d,
                    }))
                  }
                  onMouseEnter={() => setHoveredChip(d)}
                  onMouseLeave={() => setHoveredChip(null)}
                  style={{
                    backgroundColor: isActive
                      ? 'rgb(var(--accent))'
                      : isHovered
                      ? 'rgb(var(--accent) / 0.08)'
                      : 'transparent',
                    color: isActive
                      ? 'rgb(var(--accent-foreground))'
                      : isHovered
                      ? 'rgb(var(--accent))'
                      : 'rgb(var(--foreground))',
                    border: `1px solid ${
                      isActive || isHovered ? 'rgb(var(--accent))' : 'rgb(var(--border))'
                    }`,
                    borderRadius: 'var(--radius-pill)',
                    padding: '0.25rem 0.75rem',
                    fontSize: 'var(--text-sm)',
                    fontWeight:
                      isActive ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                    cursor: 'pointer',
                    boxShadow: isActive && isHovered
                      ? '0 0 10px rgb(var(--accent) / 0.45)'
                      : 'none',
                    transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  {d}
                </button>
              )
            })}
          </div>
        </div>

        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid rgb(var(--border))',
            display: 'flex',
            gap: '0.75rem',
          }}
        >
          <button
            type="button"
            onClick={handleClearAll}
            onMouseEnter={() => setClearHovered(true)}
            onMouseLeave={() => setClearHovered(false)}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: `1px solid ${clearHovered ? 'rgb(var(--accent))' : 'rgb(var(--border))'}`,
              borderRadius: 'var(--radius)',
              background: clearHovered ? 'rgb(var(--accent) / 0.08)' : 'transparent',
              color: clearHovered ? 'rgb(var(--accent))' : 'rgb(var(--foreground))',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
            }}
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={handleApply}
            onMouseEnter={() => setApplyHovered(true)}
            onMouseLeave={() => setApplyHovered(false)}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: 'var(--radius)',
              background: 'rgb(var(--primary))',
              color: 'rgb(var(--primary-foreground))',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-semibold)',
              boxShadow: applyHovered ? '0 0 12px rgb(var(--primary) / 0.5)' : 'none',
              transition: 'box-shadow 0.15s ease',
            }}
          >
            Apply Filters
          </button>
        </div>
      </aside>
    </>
  )
}
