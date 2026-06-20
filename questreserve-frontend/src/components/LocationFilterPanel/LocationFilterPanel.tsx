import { useState, useEffect, useRef } from 'react'
import type { LocationFilters, Difficulty, LandscapeType, LocationSetting, ToneTag } from '@/types/domain'
import {
  DIFFICULTY_OPTIONS,
  LANDSCAPE_TYPE_OPTIONS,
  SETTING_OPTIONS,
  TONE_TAG_OPTIONS,
} from '@/types/domain'
import { DIFFICULTY_COLOURS } from '@/constants/difficulty'

interface LocationFilterPanelProps {
  draft: LocationFilters
  onDraftChange: (filters: LocationFilters) => void
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden={true}>
      <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

const sectionLabelStyle: React.CSSProperties = {
  fontWeight: 'var(--weight-semibold)',
  color: 'rgb(var(--foreground))',
  marginBottom: '0.5rem',
  fontSize: 'var(--text-sm)',
  display: 'block',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.4rem 0.6rem',
  borderRadius: 'var(--radius)',
  border: '1px solid rgb(var(--border))',
  fontSize: 'var(--text-sm)',
  backgroundColor: 'rgb(var(--background))',
  color: 'rgb(var(--foreground))',
  outline: 'none',
  boxSizing: 'border-box',
}

const sectionStyle: React.CSSProperties = {
  marginBottom: '1.25rem',
  paddingBottom: '1.25rem',
  borderBottom: '1px solid rgb(var(--border))',
}

function ChipButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: active
          ? 'rgb(var(--accent))'
          : hovered
          ? 'rgb(var(--accent) / 0.08)'
          : 'transparent',
        color: active
          ? 'rgb(var(--accent-foreground))'
          : hovered
          ? 'rgb(var(--accent))'
          : 'rgb(var(--foreground))',
        border: `1px solid ${active || hovered ? 'rgb(var(--accent))' : 'rgb(var(--border))'}`,
        borderRadius: 'var(--radius-pill)',
        padding: '0.2rem 0.65rem',
        fontSize: 'var(--text-sm)',
        fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
        lineHeight: 1.5,
      }}
    >
      {label}
    </button>
  )
}

function DifficultyRow({
  difficulties,
  onChange,
}: {
  difficulties: Difficulty[]
  onChange: (v: Difficulty[]) => void
}) {
  function toggle(d: Difficulty) {
    if (difficulties.includes(d)) {
      onChange(difficulties.filter((x) => x !== d))
    } else {
      onChange([...difficulties, d])
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      {DIFFICULTY_OPTIONS.map((d) => {
        const active = difficulties.includes(d)
        return (
          <button
            key={d}
            type="button"
            onClick={() => toggle(d)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.35rem 0.6rem',
              borderRadius: 'var(--radius)',
              border: `1px solid ${active ? 'rgb(var(--accent))' : 'rgb(var(--border))'}`,
              backgroundColor: active ? 'rgb(var(--accent) / 0.07)' : 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: 'var(--text-sm)',
              color: 'rgb(var(--foreground))',
              transition: 'background-color 0.12s ease, border-color 0.12s ease',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                flexShrink: 0,
                backgroundColor: DIFFICULTY_COLOURS[d],
              }}
            />
            <span style={{ flex: 1, fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-regular)' }}>
              {d.charAt(0) + d.slice(1).toLowerCase()}
            </span>
            {active && (
              <span style={{ fontSize: '0.65rem', color: 'rgb(var(--accent))', fontWeight: 'var(--weight-bold)' }}>
                &#10003;
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function LocationFilterPanel({ draft, onDraftChange }: LocationFilterPanelProps) {
  return (
    <div style={{ overflowY: 'auto', padding: '1rem 1.25rem', flex: 1 }}>

      {/* Level Range */}
      <div style={sectionStyle}>
        <span style={sectionLabelStyle}>Level Range</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div>
            <label style={{ fontSize: '0.7rem', color: 'rgb(var(--muted-foreground))', display: 'block', marginBottom: '0.2rem' }}>Min</label>
            <input
              type="number"
              min={1}
              placeholder="1"
              style={inputStyle}
              value={draft.levelRangeMin ?? ''}
              onChange={(e) =>
                onDraftChange({ ...draft, levelRangeMin: e.target.value ? parseInt(e.target.value, 10) : undefined })
              }
            />
          </div>
          <div>
            <label style={{ fontSize: '0.7rem', color: 'rgb(var(--muted-foreground))', display: 'block', marginBottom: '0.2rem' }}>Max</label>
            <input
              type="number"
              min={1}
              placeholder="20"
              style={inputStyle}
              value={draft.levelRangeMax ?? ''}
              onChange={(e) =>
                onDraftChange({ ...draft, levelRangeMax: e.target.value ? parseInt(e.target.value, 10) : undefined })
              }
            />
          </div>
        </div>
      </div>

      {/* Party Size */}
      <div style={sectionStyle}>
        <span style={sectionLabelStyle}>Party Size</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div>
            <label style={{ fontSize: '0.7rem', color: 'rgb(var(--muted-foreground))', display: 'block', marginBottom: '0.2rem' }}>Min</label>
            <input
              type="number"
              min={1}
              placeholder="1"
              style={inputStyle}
              value={draft.partySizeMin ?? ''}
              onChange={(e) =>
                onDraftChange({ ...draft, partySizeMin: e.target.value ? parseInt(e.target.value, 10) : undefined })
              }
            />
          </div>
          <div>
            <label style={{ fontSize: '0.7rem', color: 'rgb(var(--muted-foreground))', display: 'block', marginBottom: '0.2rem' }}>Max</label>
            <input
              type="number"
              min={1}
              placeholder="8"
              style={inputStyle}
              value={draft.partySizeMax ?? ''}
              onChange={(e) =>
                onDraftChange({ ...draft, partySizeMax: e.target.value ? parseInt(e.target.value, 10) : undefined })
              }
            />
          </div>
        </div>
      </div>

      {/* Run Time Max */}
      <div style={sectionStyle}>
        <span style={sectionLabelStyle}>Max Run Time (minutes)</span>
        <input
          type="number"
          min={1}
          placeholder="e.g. 120"
          style={inputStyle}
          value={draft.runTimeMax ?? ''}
          onChange={(e) =>
            onDraftChange({ ...draft, runTimeMax: e.target.value ? parseInt(e.target.value, 10) : undefined })
          }
        />
      </div>

      {/* Setting — "Both" removed, Any deselects */}
      <div style={sectionStyle}>
        <span style={sectionLabelStyle}>Setting</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          <ChipButton
            label="Any"
            active={!draft.setting}
            onClick={() => onDraftChange({ ...draft, setting: undefined })}
          />
          {SETTING_OPTIONS.map((s) => (
            <ChipButton
              key={s}
              label={s.charAt(0).toUpperCase() + s.slice(1)}
              active={draft.setting === s}
              onClick={() =>
                onDraftChange({ ...draft, setting: draft.setting === s ? undefined : (s as LocationSetting) })
              }
            />
          ))}
        </div>
      </div>

      {/* Landscape Type */}
      <div style={sectionStyle}>
        <span style={sectionLabelStyle}>Landscape</span>
        <select
          style={inputStyle}
          value={draft.landscapeType ?? ''}
          onChange={(e) =>
            onDraftChange({ ...draft, landscapeType: (e.target.value || undefined) as LandscapeType | undefined })
          }
        >
          <option value="">Any landscape</option>
          {LANDSCAPE_TYPE_OPTIONS.map((lt) => (
            <option key={lt} value={lt}>{lt.charAt(0).toUpperCase() + lt.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Tone — multi-select */}
      <div style={sectionStyle}>
        <span style={sectionLabelStyle}>Tone</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {TONE_TAG_OPTIONS.map((t) => {
            const active = (draft.toneTags ?? []).includes(t)
            return (
              <ChipButton
                key={t}
                label={t.charAt(0).toUpperCase() + t.slice(1)}
                active={active}
                onClick={() => {
                  const current = draft.toneTags ?? []
                  const next = active ? current.filter((x) => x !== t) : [...current, t as ToneTag]
                  onDraftChange({ ...draft, toneTags: next.length > 0 ? next : undefined })
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Difficulty — colored dot row, multi-select */}
      <div style={{ marginBottom: '1.25rem' }}>
        <span style={sectionLabelStyle}>Difficulty</span>
        <DifficultyRow
          difficulties={draft.difficulties ?? []}
          onChange={(v) => onDraftChange({ ...draft, difficulties: v.length > 0 ? v : undefined })}
        />
      </div>

    </div>
  )
}

interface FilterPanelDrawerProps {
  open: boolean
  onClose: () => void
  filters: LocationFilters
  onApply: (filters: LocationFilters) => void
  onClearAll: () => void
}

export function FilterPanelDrawer({ open, onClose, filters, onApply, onClearAll }: FilterPanelDrawerProps) {
  const [closeHovered, setCloseHovered] = useState(false)
  const [draft, setDraft] = useState<LocationFilters>(filters)
  const prevOpenRef = useRef(open)

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setDraft(filters)
    }
    prevOpenRef.current = open
  }, [open, filters])

  function handleApply() {
    onApply(draft)
    onClose()
  }

  function handleClear() {
    setDraft({})
    onClearAll()
    onClose()
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
            flexShrink: 0,
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

        <LocationFilterPanel draft={draft} onDraftChange={setDraft} />

        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid rgb(var(--border))',
            display: 'flex',
            gap: '0.75rem',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={handleClear}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: '1px solid rgb(var(--border))',
              borderRadius: 'var(--radius)',
              background: 'transparent',
              color: 'rgb(var(--foreground))',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
            }}
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={handleApply}
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
            }}
          >
            Apply Filters
          </button>
        </div>
      </aside>
    </>
  )
}
