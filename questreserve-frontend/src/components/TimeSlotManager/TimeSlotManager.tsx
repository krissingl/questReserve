import { useState } from 'react'
import { useSlotsByLocation } from '@/hooks/useSlotsByLocation'
import { createSlot, deleteSlot } from '@/api/provider.api'
import type { TimeSlot } from '@/types/domain'

interface TimeSlotManagerProps {
  locationId: string
}

function formatDateTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return isoString
  }
}

interface SlotRowProps {
  slot: TimeSlot
  onDeleted: () => void
}

function SlotRow({ slot, onDeleted }: SlotRowProps) {
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleDelete() {
    if (!window.confirm('Delete this time slot? This cannot be undone.')) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteSlot(slot.id)
      onDeleted()
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete slot.')
      setDeleting(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius)',
        backgroundColor: 'rgb(var(--background))',
        gap: '1rem',
      }}
    >
      <div style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--foreground))' }}>
        <span>{formatDateTime(slot.start_time)}</span>
        <span style={{ margin: '0 0.5rem', color: 'rgb(var(--muted-foreground))' }}>→</span>
        <span>{formatDateTime(slot.end_time)}</span>
        {deleteError && (
          <p style={{ marginTop: '0.25rem', color: 'rgb(var(--destructive))', fontSize: '0.75rem' }}>
            {deleteError}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        style={{
          flexShrink: 0,
          padding: '0.3rem 0.75rem',
          borderRadius: 'var(--radius)',
          backgroundColor: 'rgb(var(--destructive) / 0.1)',
          color: 'rgb(var(--destructive))',
          border: 'none',
          fontSize: '0.75rem',
          fontWeight: 'var(--weight-medium)',
          cursor: deleting ? 'not-allowed' : 'pointer',
          opacity: deleting ? 0.6 : 1,
        }}
      >
        {deleting ? 'Deleting…' : 'Delete'}
      </button>
    </div>
  )
}

export function TimeSlotManager({ locationId }: TimeSlotManagerProps) {
  const { data: slots, isLoading, error: fetchError, refetch } = useSlotsByLocation(locationId)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  async function handleAddSlot(e: React.FormEvent) {
    e.preventDefault()
    if (!startTime || !endTime) {
      setAddError('Both start and end times are required.')
      return
    }
    setAdding(true)
    setAddError(null)
    try {
      await createSlot(locationId, { start_time: startTime, end_time: endTime })
      setStartTime('')
      setEndTime('')
      refetch()
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : 'Failed to create time slot.')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div
      style={{
        padding: '1.5rem',
        borderRadius: 'var(--radius)',
        backgroundColor: 'rgb(var(--card))',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.1rem',
          fontWeight: 'var(--weight-bold)',
          color: 'rgb(var(--foreground))',
          marginBottom: '1rem',
        }}
      >
        Time Slots
      </h2>

      {/* Slot list */}
      {isLoading && (
        <p style={{ color: 'rgb(var(--muted-foreground))', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
          Loading slots…
        </p>
      )}

      {!isLoading && fetchError && (
        <p style={{ color: 'rgb(var(--destructive))', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
          {fetchError}
        </p>
      )}

      {!isLoading && !fetchError && slots.length === 0 && (
        <p style={{ color: 'rgb(var(--muted-foreground))', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
          No time slots yet.
        </p>
      )}

      {!isLoading && !fetchError && slots.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {slots.map((slot) => (
            <SlotRow key={slot.id} slot={slot} onDeleted={refetch} />
          ))}
        </div>
      )}

      {/* Add slot form */}
      <form onSubmit={handleAddSlot}>
        <h3
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-semibold)',
            color: 'rgb(var(--foreground))',
            marginBottom: '0.75rem',
          }}
        >
          Add Time Slot
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div>
            <label
              htmlFor="slot-start"
              style={{
                display: 'block',
                fontSize: '0.75rem',
                color: 'rgb(var(--muted-foreground))',
                marginBottom: '0.25rem',
              }}
            >
              Start time
            </label>
            <input
              id="slot-start"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius)',
                border: '1px solid rgb(var(--border))',
                backgroundColor: 'rgb(var(--background))',
                color: 'rgb(var(--foreground))',
                fontSize: 'var(--text-sm)',
              }}
            />
          </div>
          <div>
            <label
              htmlFor="slot-end"
              style={{
                display: 'block',
                fontSize: '0.75rem',
                color: 'rgb(var(--muted-foreground))',
                marginBottom: '0.25rem',
              }}
            >
              End time
            </label>
            <input
              id="slot-end"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius)',
                border: '1px solid rgb(var(--border))',
                backgroundColor: 'rgb(var(--background))',
                color: 'rgb(var(--foreground))',
                fontSize: 'var(--text-sm)',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius)',
              backgroundColor: 'rgb(var(--accent))',
              color: 'rgb(var(--accent-foreground))',
              border: 'none',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-semibold)',
              cursor: adding ? 'not-allowed' : 'pointer',
              opacity: adding ? 0.6 : 1,
            }}
          >
            {adding ? 'Adding…' : 'Add Slot'}
          </button>
        </div>
        {addError && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'rgb(var(--destructive))' }}>
            {addError}
          </p>
        )}
      </form>
    </div>
  )
}
