import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { askWill } from '@/api/will.api'
import { filtersToParams } from '@/utils/filters'
import type { LocationFilters } from '@/types/domain'

// ASSET: replace with approved orb illustration

const WILL_ORB_KEYFRAMES = `
@keyframes will-orb-pulse {
  0%, 100% {
    box-shadow: 0 0 8px 2px rgb(var(--accent) / 0.6), 0 0 20px 6px rgb(var(--accent) / 0.25);
    transform: scale(1);
    opacity: 1;
  }
  50% {
    box-shadow: 0 0 14px 5px rgb(var(--accent) / 0.85), 0 0 32px 10px rgb(var(--accent) / 0.4);
    transform: scale(1.06);
    opacity: 0.9;
  }
}

@keyframes will-orb-pulse-fast {
  0%, 100% {
    box-shadow: 0 0 8px 2px rgb(var(--accent) / 0.6), 0 0 20px 6px rgb(var(--accent) / 0.25);
    transform: scale(1);
    opacity: 1;
  }
  50% {
    box-shadow: 0 0 14px 5px rgb(var(--accent) / 0.85), 0 0 32px 10px rgb(var(--accent) / 0.4);
    transform: scale(1.06);
    opacity: 0.9;
  }
}

.will-orb-idle {
  animation: will-orb-pulse 2.8s ease-in-out infinite;
}

.will-orb-loading {
  animation: will-orb-pulse-fast 0.8s ease-in-out infinite;
}
`

const orbDiameter = 56

export function WillOrb() {
  const [, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!input.trim() || loading) return
    setLoading(true)
    setResponse('')

    try {
      const result = await askWill(input.trim())
      setResponse(result.message)
      const filters = result.filters as LocationFilters
      setSearchParams(filtersToParams(filters))
    } catch {
      setResponse("The mist grows thick… I've lost the thread. Speak to me again, traveler.")
      setSearchParams(new URLSearchParams())
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleClear() {
    setInput('')
    setResponse('')
    setSearchParams(new URLSearchParams())
  }

  return (
    <>
      <style>{WILL_ORB_KEYFRAMES}</style>

      <div
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.75rem',
        }}
      >
        {open && (
          <div
            style={{
              width: '300px',
              borderRadius: 'var(--radius)',
              border: '1px solid rgb(var(--border))',
              backgroundColor: 'rgb(var(--background))',
              boxShadow: '0 8px 32px rgb(0 0 0 / 0.3)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Panel header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.75rem',
                borderBottom: '1px solid rgb(var(--border))',
                backgroundColor: 'rgb(var(--card))',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* ASSET: replace with approved orb illustration */}
                <div
                  className={loading ? 'will-orb-loading' : 'will-orb-idle'}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: 'rgb(var(--accent))',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 'var(--weight-semibold)',
                    fontSize: 'var(--text-sm)',
                    color: 'rgb(var(--foreground))',
                  }}
                >
                  Will
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close Will panel"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgb(var(--muted-foreground))',
                  fontSize: '1.1rem',
                  lineHeight: 1,
                  padding: '0.1rem 0.25rem',
                  borderRadius: 'var(--radius)',
                }}
              >
                ×
              </button>
            </div>

            {/* Response display */}
            <div
              style={{
                minHeight: '60px',
                padding: '0.75rem',
                fontSize: 'var(--text-sm)',
                color: response ? 'rgb(var(--foreground))' : 'rgb(var(--muted-foreground))',
                fontStyle: response ? 'italic' : 'normal',
                lineHeight: '1.5',
                borderBottom: '1px solid rgb(var(--border))',
              }}
            >
              {loading
                ? 'Seeking the path…'
                : response || 'Ask Will to help you find an adventure.'}
            </div>

            {/* Input area */}
            <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your quest, traveler…"
                disabled={loading}
                rows={3}
                style={{
                  width: '100%',
                  resize: 'none',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgb(var(--border))',
                  backgroundColor: 'rgb(var(--input, var(--background)))',
                  color: 'rgb(var(--foreground))',
                  padding: '0.5rem',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                  opacity: loading ? 0.6 : 1,
                }}
              />
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !input.trim()}
                  style={{
                    flex: 1,
                    padding: '0.4rem 0.6rem',
                    borderRadius: 'var(--radius)',
                    border: 'none',
                    backgroundColor: 'rgb(var(--accent))',
                    color: 'rgb(var(--accent-foreground))',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-semibold)',
                    cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                    opacity: loading || !input.trim() ? 0.6 : 1,
                  }}
                >
                  Ask Will
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  style={{
                    padding: '0.4rem 0.6rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid rgb(var(--border))',
                    backgroundColor: 'transparent',
                    color: 'rgb(var(--muted-foreground))',
                    fontSize: 'var(--text-sm)',
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Orb button */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? 'Close Will' : 'Open Will'}
          className={loading ? 'will-orb-loading' : 'will-orb-idle'}
          style={{
            width: `${orbDiameter}px`,
            height: `${orbDiameter}px`,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'rgb(var(--accent))',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
          }}
        />
      </div>
    </>
  )
}
