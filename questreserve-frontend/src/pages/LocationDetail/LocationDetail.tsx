import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useBookingLocation } from '@/hooks/useBookingLocation'
import { useAvailableSlots } from '@/hooks/useAvailableSlots'
import { useCreateBooking } from '@/hooks/useCreateBooking'
import { useLocationImages } from '@/hooks/useLocationImages'
import { useAuth } from '@/contexts/AuthContext'
import { formatSlotTime } from '@/utils/formatSlotTime'
import { LocationGallery } from '@/components/LocationGallery/LocationGallery'
import { AvatarIcon } from '@/components/AvatarIcon/AvatarIcon'
import { ReviewList } from '@/components/ReviewList/ReviewList'
import { ReviewForm } from '@/components/ReviewForm/ReviewForm'
import { getMyBookings } from '@/api/customer.api'
import { DIFFICULTY_COLOURS } from '@/constants/difficulty'
import type { TimeSlot, Booking } from '@/types/domain'

interface SlotCardProps {
  slot: TimeSlot
  isPending: boolean
  bookingLoading: boolean
  onReserve: (slot: TimeSlot) => void
  onConfirm: () => void
  onCancel: () => void
}

function SlotCard({ slot, isPending, bookingLoading, onReserve, onConfirm, onCancel }: SlotCardProps) {
  const [hovered, setHovered] = useState(false)
  const [reserveHovered, setReserveHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-lg p-4"
      style={{
        backgroundColor: hovered ? 'rgb(var(--accent) / 0.06)' : 'rgb(var(--card))',
        boxShadow: 'var(--shadow-card)',
        border: `1px solid ${hovered ? 'rgb(var(--accent) / 0.35)' : 'transparent'}`,
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span style={{ color: 'rgb(var(--foreground))' }}>
            {formatSlotTime(slot.start_time)}
          </span>
          <span className="mx-2" style={{ color: 'rgb(var(--muted-foreground))' }}>
            &ndash;
          </span>
          <span style={{ color: 'rgb(var(--foreground))' }}>
            {formatSlotTime(slot.end_time)}
          </span>
        </div>

        {!isPending && (
          <button
            type="button"
            onClick={() => onReserve(slot)}
            onMouseEnter={() => setReserveHovered(true)}
            onMouseLeave={() => setReserveHovered(false)}
            className="rounded px-4 py-1.5 text-sm font-medium"
            style={{
              backgroundColor: reserveHovered ? 'rgb(var(--accent) / 0.85)' : 'rgb(var(--accent))',
              color: 'rgb(var(--accent-foreground))',
              transition: 'background-color 0.15s ease',
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
              onClick={onConfirm}
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
              onClick={onCancel}
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
}

function getResponseStatus(err: unknown): number | null {
  if (
    err != null &&
    typeof err === 'object' &&
    'response' in err &&
    err.response != null &&
    typeof err.response === 'object' &&
    'status' in err.response
  ) {
    return (err.response as { status: number }).status
  }
  return null
}

export function LocationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { token, role } = useAuth()

  const { data: location, isLoading, error } = useBookingLocation(id ?? '')
  const { data: images } = useLocationImages(id ?? '')
  const { data: rawSlots, isLoading: slotsLoading, error: slotsError } = useAvailableSlots(id ?? '')
  const slots = rawSlots
    ? rawSlots.filter((s) => new Date(s.start_time) > new Date())
    : rawSlots
  const { createBooking, isLoading: bookingLoading } = useCreateBooking()

  const slotParam = searchParams.get('slot')

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [conflictError, setConflictError] = useState<string | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [eligibleBooking, setEligibleBooking] = useState<Booking | null>(null)
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0)

  useEffect(() => {
    if (!token || role !== 'customer' || !id) {
      setEligibleBooking(null)
      return
    }
    getMyBookings()
      .then((bookings) => {
        const eligible = bookings
          .filter((b) => b.status === 'BOOKED' && b.booking_location_id === id)
          .sort((a, b) => new Date(b.slot_start_time).getTime() - new Date(a.slot_start_time).getTime())[0]
        setEligibleBooking(eligible ?? null)
      })
      .catch(() => setEligibleBooking(null))
  }, [token, role, id])

  const pendingSlotId: string | null =
    selectedSlotId ?? (token && slotParam && !slotsLoading ? slotParam : null)

  const pendingSlot: TimeSlot | null =
    pendingSlotId && slots ? (slots.find((s) => s.id === pendingSlotId) ?? null) : null

  const handleReserveClick = (slot: TimeSlot) => {
    if (!token) {
      const redirect = `/locations/${id}`
      navigate(`/customer/login?redirect=${encodeURIComponent(redirect)}&slot=${slot.id}`)
      return
    }
    setSelectedSlotId(slot.id)
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
      if (getResponseStatus(err) === 409) {
        setConflictError('This time slot is no longer available. Please choose another.')
      } else {
        setBookingError('Something went wrong. Please try again.')
      }
      setSelectedSlotId(null)
    }
  }

  const handleCancelConfirm = () => {
    setSelectedSlotId(null)
    setConflictError(null)
    setBookingError(null)
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
          to="/locations"
          className="mb-4 inline-block text-sm underline-offset-4 hover:underline"
          style={{ color: 'rgb(var(--accent))' }}
        >
          &larr; Back to Adventures
        </Link>
        <p className="mt-4" style={{ color: 'rgb(var(--destructive))' }}>
          Location not found or an error occurred.
        </p>
      </main>
    )
  }

  if (!location) return null

  return (
    <main className="p-8" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <Link
        to="/locations"
        className="mb-4 inline-block text-sm underline-offset-4 hover:underline"
        style={{ color: 'rgb(var(--accent))' }}
      >
        &larr; Back to Adventures
      </Link>

      <div
        className="mt-4 rounded-lg overflow-hidden"
        style={{
          backgroundColor: 'rgb(var(--card))',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {images && images.length > 0 && (
          <div style={{ padding: '1rem 1rem 0', height: '420px' }}>
            <LocationGallery images={images} locationName={location.name} />
          </div>
        )}

        <div className="p-8">
        <h1
          className="mb-2 text-3xl font-bold"
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'rgb(var(--foreground))',
          }}
        >
          {location.name}
        </h1>

        <div className="flex items-center gap-3 flex-wrap">
          <span
            className="inline-block rounded px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: DIFFICULTY_COLOURS[location.difficulty],
              color: 'rgb(var(--primary-foreground, 255 255 255))',
            }}
          >
            {location.difficulty}
          </span>

          {location.provider_first_name && location.provider_last_name && (
            <Link
              to={`/providers/${location.provider_id}/profile`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: 'var(--text-sm)',
                color: 'rgb(var(--muted-foreground))',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgb(var(--accent))' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgb(var(--muted-foreground))' }}
            >
              <AvatarIcon
                firstName={location.provider_first_name}
                lastName={location.provider_last_name}
                size="sm"
                pictureUrl={location.provider_profile_picture_url}
              />
              <span>{location.provider_first_name} {location.provider_last_name}</span>
            </Link>
          )}
        </div>

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
      </div>

      <div className="mt-6">
        <h2
          className="mb-4 text-xl font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: 'rgb(var(--foreground))' }}
        >
          Available Times
        </h2>

        {conflictError && (
          <p
            className="mb-4 rounded p-3 text-sm"
            style={{ backgroundColor: 'rgb(var(--destructive) / 0.1)', color: 'rgb(var(--destructive))' }}
          >
            {conflictError}
          </p>
        )}

        {bookingError && (
          <p
            className="mb-4 rounded p-3 text-sm"
            style={{ backgroundColor: 'rgb(var(--destructive) / 0.1)', color: 'rgb(var(--destructive))' }}
          >
            {bookingError}
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
            {slots.map((slot) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                isPending={pendingSlot?.id === slot.id}
                bookingLoading={bookingLoading}
                onReserve={handleReserveClick}
                onConfirm={handleConfirm}
                onCancel={handleCancelConfirm}
              />
            ))}
          </div>
        )}
      </div>

      {id && (
        <div
          className="mt-6 rounded-lg"
          style={{
            padding: '1.25rem',
            backgroundColor: 'rgb(var(--card))',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h2
            className="mb-4 text-xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'rgb(var(--foreground))' }}
          >
            Reviews
          </h2>
          <ReviewList targetId={id} targetType="location" refreshKey={reviewRefreshKey} />
          {role === 'customer' && (
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgb(var(--border))', paddingTop: '1.25rem' }}>
              {eligibleBooking ? (
                <ReviewForm
                  bookingId={eligibleBooking.id}
                  targetId={id}
                  targetType="location"
                  onSuccess={() => setReviewRefreshKey((k) => k + 1)}
                />
              ) : (
                <p className="text-sm" style={{ color: 'rgb(var(--muted-foreground))' }}>
                  Book this adventure to leave a review.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  )
}
