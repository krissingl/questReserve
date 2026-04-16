import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useBookingLocation } from '@/hooks/useBookingLocation'
import { useAvailableSlots } from '@/hooks/useAvailableSlots'
import { useCreateBooking } from '@/hooks/useCreateBooking'
import { useAuth } from '@/contexts/AuthContext'
import type { TimeSlot } from '@/types/domain'

function formatSlotTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function LocationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { token } = useAuth()

  const { data: location, isLoading, error } = useBookingLocation(id ?? '')
  const { data: slots, isLoading: slotsLoading, error: slotsError } = useAvailableSlots(id ?? '')
  const { createBooking, isLoading: bookingLoading } = useCreateBooking()

  const [pendingSlot, setPendingSlot] = useState<TimeSlot | null>(null)
  const [conflictError, setConflictError] = useState<string | null>(null)

  const slotParam = searchParams.get('slot')
  useEffect(() => {
    if (!token || !slotParam || !slots || pendingSlot) return
    const match = slots.find((s) => s.id === slotParam)
    if (match) {
      setPendingSlot(match)
    }
  }, [token, slotParam, slots, pendingSlot])

  const handleReserveClick = (slot: TimeSlot) => {
    if (!token) {
      const redirect = `/customer/locations/${id}`
      navigate(`/customer/login?redirect=${encodeURIComponent(redirect)}&slot=${slot.id}`)
      return
    }
    setPendingSlot(slot)
    setConflictError(null)
  }

  const handleConfirm = async () => {
    if (!pendingSlot || !location) return
    try {
      await createBooking(pendingSlot.id)
      navigate('/customer/payment', {
        state: {
          locationName: location.name,
          slotStart: pendingSlot.start_time,
          slotEnd: pendingSlot.end_time,
        },
      })
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setConflictError('This time slot is no longer available. Please choose another.')
      }
      setPendingSlot(null)
    }
  }

  const handleCancelConfirm = () => {
    setPendingSlot(null)
    setConflictError(null)
  }

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

      <div className="mt-6">
        <h2
          className="mb-4 text-xl font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: 'rgb(var(--foreground))' }}
        >
          Available Times
        </h2>

        {conflictError && (
          <p className="mb-4 rounded p-3 text-sm" style={{ backgroundColor: 'rgb(var(--destructive) / 0.1)', color: 'rgb(var(--destructive))' }}>
            {conflictError}
          </p>
        )}

        {slotsLoading && (
          <p className="text-sm" style={{ color: 'rgb(var(--muted-foreground))' }}>
            Loading available slots…
          </p>
        )}

        {!slotsLoading && slotsError && (
          <p className="text-sm" style={{ color: 'rgb(var(--destructive))' }}>
            Failed to load available times. Please try again.
          </p>
        )}

        {!slotsLoading && !slotsError && slots && slots.length === 0 && (
          <p className="text-sm" style={{ color: 'rgb(var(--muted-foreground))' }}>
            No available time slots at this time.
          </p>
        )}

        {!slotsLoading && !slotsError && slots && slots.length > 0 && (
          <div className="flex flex-col gap-3">
            {slots.map((slot) => {
              const isPending = pendingSlot?.id === slot.id

              return (
                <div
                  key={slot.id}
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: 'rgb(var(--card))',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span style={{ color: 'rgb(var(--foreground))' }}>
                        {formatSlotTime(slot.start_time)}
                      </span>
                      <span
                        className="mx-2"
                        style={{ color: 'rgb(var(--muted-foreground))' }}
                      >
                        &ndash;
                      </span>
                      <span style={{ color: 'rgb(var(--foreground))' }}>
                        {formatSlotTime(slot.end_time)}
                      </span>
                    </div>

                    {!isPending && (
                      <button
                        type="button"
                        onClick={() => handleReserveClick(slot)}
                        className="rounded px-4 py-1.5 text-sm font-medium"
                        style={{
                          backgroundColor: 'rgb(var(--primary))',
                          color: 'rgb(var(--primary-foreground, 255 255 255))',
                        }}
                      >
                        Reserve
                      </button>
                    )}
                  </div>

                  {isPending && (
                    <div
                      className="mt-3 rounded p-3 text-sm"
                      style={{ backgroundColor: 'rgb(var(--primary) / 0.08)' }}
                    >
                      <p className="mb-2 font-medium" style={{ color: 'rgb(var(--foreground))' }}>
                        Confirm reservation for{' '}
                        <span style={{ color: 'rgb(var(--accent))' }}>
                          {formatSlotTime(slot.start_time)} &ndash; {formatSlotTime(slot.end_time)}
                        </span>
                        ?
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleConfirm}
                          disabled={bookingLoading}
                          className="rounded px-4 py-1.5 text-sm font-medium"
                          style={{
                            backgroundColor: 'rgb(var(--accent))',
                            color: 'rgb(var(--accent-foreground))',
                            opacity: bookingLoading ? 0.6 : 1,
                          }}
                        >
                          {bookingLoading ? 'Booking…' : 'Confirm'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelConfirm}
                          disabled={bookingLoading}
                          className="rounded px-4 py-1.5 text-sm font-medium"
                          style={{ color: 'rgb(var(--muted-foreground))' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
