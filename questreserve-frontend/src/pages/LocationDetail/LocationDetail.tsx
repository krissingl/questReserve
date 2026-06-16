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
import type { TimeSlot, Booking, BookingLocation } from '@/types/domain'

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

const GORE_LABELS: Record<number, string> = { 0: 'None', 1: 'Mild', 2: 'Moderate', 3: 'Graphic' }

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function Chip({ label, variant = 'neutral' }: { label: string; variant?: 'neutral' | 'accent' | 'warning' }) {
  const bg =
    variant === 'accent'
      ? 'rgb(var(--accent) / 0.12)'
      : variant === 'warning'
      ? 'rgb(var(--destructive) / 0.1)'
      : 'rgb(var(--muted) / 0.5)'
  const color =
    variant === 'accent'
      ? 'rgb(var(--accent))'
      : variant === 'warning'
      ? 'rgb(var(--destructive))'
      : 'rgb(var(--foreground))'
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.15rem 0.55rem',
        borderRadius: 'var(--radius-pill)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-medium)',
        backgroundColor: bg,
        color,
        border: `1px solid ${color}`,
        lineHeight: 1.5,
      }}
    >
      {label}
    </span>
  )
}

interface RulesetSectionProps {
  title: string
  children: React.ReactNode
}

function RulesetSection({ title, children }: RulesetSectionProps) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h3
        style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--weight-semibold)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'rgb(var(--muted-foreground))',
          marginBottom: '0.75rem',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', fontSize: 'var(--text-sm)', flexWrap: 'wrap', alignItems: 'baseline' }}>
      <span style={{ color: 'rgb(var(--muted-foreground))', flexShrink: 0 }}>{label}:</span>
      <span style={{ color: 'rgb(var(--foreground))' }}>{value}</span>
    </div>
  )
}

function ChipRow({ chips }: { chips: { label: string; variant?: 'neutral' | 'accent' | 'warning' }[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
      {chips.map((c) => (
        <Chip key={c.label} label={c.label} variant={c.variant} />
      ))}
    </div>
  )
}

function RulesetDisplay({ location }: { location: BookingLocation }) {
  const hasCoreSpecs =
    location.party_size_min != null ||
    location.party_size_max != null ||
    location.level_range_min != null ||
    location.level_range_max != null

  const hasEnvironment =
    location.landscape_type != null ||
    location.setting != null ||
    (location.environment_tags && location.environment_tags.length > 0)

  const hasRestrictions =
    (location.magic_restrictions && location.magic_restrictions.length > 0) ||
    (location.class_restrictions && location.class_restrictions.length > 0) ||
    (location.race_restrictions && location.race_restrictions.length > 0) ||
    (location.faction_restrictions && location.faction_restrictions.length > 0) ||
    (location.physical_access && location.physical_access.length > 0) ||
    (location.party_composition_tags && location.party_composition_tags.length > 0) ||
    location.mount_permitted ||
    location.familiar_permitted ||
    location.solo_permitted ||
    location.booking_type != null

  const hasTone =
    (location.tone_tags && location.tone_tags.length > 0) ||
    location.gore_level != null ||
    location.non_lethal_mode ||
    location.permadeath_risk ||
    location.primary_focus != null ||
    location.boss_encounter ||
    location.pvp_permitted ||
    location.scouting_permitted

  const hasRunLogistics =
    location.run_time_minutes != null ||
    location.reset_time_hours != null ||
    location.time_limit_minutes != null

  const hasAmenities =
    location.has_safe_room ||
    location.has_merchant ||
    location.equipment_provided ||
    location.guide_provided ||
    location.loot_type != null ||
    location.boss_loot ||
    location.unique_item_chance

  const hasAny = hasCoreSpecs || hasEnvironment || hasRestrictions || hasTone || hasRunLogistics || hasAmenities

  if (!hasAny) return null

  return (
    <div
      className="mt-6 rounded-lg"
      style={{ padding: '1.5rem', backgroundColor: 'rgb(var(--card))', boxShadow: 'var(--shadow-card)' }}
    >
      <h2
        className="mb-4 text-xl font-bold"
        style={{ fontFamily: 'var(--font-heading)', color: 'rgb(var(--foreground))' }}
      >
        Adventure Details
      </h2>

      {hasCoreSpecs && (
        <RulesetSection title="Core Specs">
          {(location.party_size_min != null || location.party_size_max != null) && (
            <MetaRow
              label="Party Size"
              value={
                location.party_size_min != null && location.party_size_max != null
                  ? `${location.party_size_min}–${location.party_size_max} players`
                  : location.party_size_min != null
                  ? `Min ${location.party_size_min}`
                  : `Max ${location.party_size_max}`
              }
            />
          )}
          {(location.level_range_min != null || location.level_range_max != null) && (
            <MetaRow
              label="Level Range"
              value={
                location.level_range_min != null && location.level_range_max != null
                  ? `${location.level_range_min}–${location.level_range_max}`
                  : location.level_range_min != null
                  ? `Level ${location.level_range_min}+`
                  : `Up to level ${location.level_range_max}`
              }
            />
          )}
        </RulesetSection>
      )}

      {hasEnvironment && (
        <RulesetSection title="Environment">
          {location.landscape_type && (
            <MetaRow label="Landscape" value={capitalize(location.landscape_type)} />
          )}
          {location.setting && (
            <MetaRow label="Setting" value={capitalize(location.setting)} />
          )}
          {location.environment_tags && location.environment_tags.length > 0 && (
            <div style={{ marginBottom: '0.4rem' }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))', marginRight: '0.4rem' }}>Tags:</span>
              <ChipRow chips={location.environment_tags.map((t) => ({ label: capitalize(t.replace(/_/g, ' ')), variant: 'neutral' as const }))} />
            </div>
          )}
        </RulesetSection>
      )}

      {hasRestrictions && (
        <RulesetSection title="Restrictions & Access">
          {location.magic_restrictions && location.magic_restrictions.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))', display: 'block', marginBottom: '0.3rem' }}>Magic:</span>
              <ChipRow chips={location.magic_restrictions.map((r) => ({ label: capitalize(r.replace(/_/g, ' ')), variant: 'warning' as const }))} />
            </div>
          )}
          {location.class_restrictions && location.class_restrictions.length > 0 && (
            <MetaRow label="Class Restrictions" value={location.class_restrictions.map(capitalize).join(', ')} />
          )}
          {location.race_restrictions && location.race_restrictions.length > 0 && (
            <MetaRow label="Race Restrictions" value={location.race_restrictions.map(capitalize).join(', ')} />
          )}
          {location.faction_restrictions && location.faction_restrictions.length > 0 && (
            <MetaRow label="Faction Restrictions" value={location.faction_restrictions.map(capitalize).join(', ')} />
          )}
          {location.physical_access && location.physical_access.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))', display: 'block', marginBottom: '0.3rem' }}>Physical Access Required:</span>
              <ChipRow chips={location.physical_access.map((a) => ({ label: capitalize(a.replace(/_/g, ' ')), variant: 'warning' as const }))} />
            </div>
          )}
          {location.party_composition_tags && location.party_composition_tags.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))', display: 'block', marginBottom: '0.3rem' }}>Composition Rules:</span>
              <ChipRow chips={location.party_composition_tags.map((t) => ({ label: capitalize(t.replace(/_/g, ' ')), variant: 'neutral' as const }))} />
            </div>
          )}
          {(location.mount_permitted || location.familiar_permitted || location.solo_permitted) && (
            <div style={{ marginBottom: '0.5rem' }}>
              <ChipRow chips={[
                ...(location.mount_permitted ? [{ label: 'Mount Permitted', variant: 'accent' as const }] : []),
                ...(location.familiar_permitted ? [{ label: 'Familiar Permitted', variant: 'accent' as const }] : []),
                ...(location.solo_permitted ? [{ label: 'Solo Permitted', variant: 'accent' as const }] : []),
              ]} />
            </div>
          )}
          {location.booking_type && (
            <MetaRow label="Booking Type" value={capitalize(location.booking_type)} />
          )}
        </RulesetSection>
      )}

      {hasTone && (
        <RulesetSection title="Tone & Content">
          {location.tone_tags && location.tone_tags.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <ChipRow chips={location.tone_tags.map((t) => ({ label: capitalize(t), variant: 'accent' as const }))} />
            </div>
          )}
          {location.primary_focus && (
            <MetaRow label="Primary Focus" value={capitalize(location.primary_focus)} />
          )}
          {location.gore_level != null && (
            <MetaRow label="Gore Level" value={GORE_LABELS[location.gore_level] ?? String(location.gore_level)} />
          )}
          {(location.non_lethal_mode || location.permadeath_risk || location.boss_encounter || location.pvp_permitted || location.scouting_permitted) && (
            <div>
              <ChipRow chips={[
                ...(location.permadeath_risk ? [{ label: 'Permadeath Risk', variant: 'warning' as const }] : []),
                ...(location.pvp_permitted ? [{ label: 'PvP Permitted', variant: 'warning' as const }] : []),
                ...(location.boss_encounter ? [{ label: 'Boss Encounter', variant: 'accent' as const }] : []),
                ...(location.non_lethal_mode ? [{ label: 'Non-Lethal Mode', variant: 'accent' as const }] : []),
                ...(location.scouting_permitted ? [{ label: 'Scouting Permitted', variant: 'neutral' as const }] : []),
              ]} />
            </div>
          )}
        </RulesetSection>
      )}

      {hasRunLogistics && (
        <RulesetSection title="Run Logistics">
          {location.run_time_minutes != null && (
            <MetaRow label="Est. Run Time" value={`${location.run_time_minutes} min`} />
          )}
          {location.reset_time_hours != null && (
            <MetaRow label="Reset Time" value={`${location.reset_time_hours} hr`} />
          )}
          {location.time_limit_minutes != null && (
            <MetaRow label="Time Limit" value={`${location.time_limit_minutes} min`} />
          )}
          {location.time_limit_minutes === null && location.run_time_minutes != null && (
            <MetaRow label="Time Limit" value="None" />
          )}
        </RulesetSection>
      )}

      {hasAmenities && (
        <RulesetSection title="Amenities & Loot">
          {(location.has_safe_room || location.has_merchant || location.equipment_provided || location.guide_provided) && (
            <div style={{ marginBottom: '0.5rem' }}>
              <ChipRow chips={[
                ...(location.has_safe_room ? [{ label: 'Safe Room', variant: 'accent' as const }] : []),
                ...(location.has_merchant ? [{ label: 'Merchant', variant: 'accent' as const }] : []),
                ...(location.equipment_provided ? [{ label: 'Equipment Provided', variant: 'accent' as const }] : []),
                ...(location.guide_provided ? [{ label: 'Guide Provided', variant: 'accent' as const }] : []),
              ]} />
            </div>
          )}
          {location.loot_type && (
            <MetaRow label="Loot" value={capitalize(location.loot_type)} />
          )}
          {(location.boss_loot || location.unique_item_chance) && (
            <ChipRow chips={[
              ...(location.boss_loot ? [{ label: 'Boss Loot', variant: 'accent' as const }] : []),
              ...(location.unique_item_chance ? [{ label: 'Unique Item Chance', variant: 'accent' as const }] : []),
            ]} />
          )}
        </RulesetSection>
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

      <RulesetDisplay location={location} />

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
