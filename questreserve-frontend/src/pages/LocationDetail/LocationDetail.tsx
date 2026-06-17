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
      style={{
        borderRadius: 'var(--radius)',
        padding: '0.65rem 0.75rem',
        backgroundColor: hovered ? 'rgb(var(--accent) / 0.06)' : 'rgb(var(--background))',
        border: `1px solid ${hovered ? 'rgb(var(--accent) / 0.35)' : 'rgb(var(--border))'}`,
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--foreground))' }}>
          {formatSlotTime(slot.start_time)}
          <span style={{ margin: '0 0.35rem', color: 'rgb(var(--muted-foreground))' }}>&ndash;</span>
          {formatSlotTime(slot.end_time)}
        </span>

        {!isPending && (
          <button
            type="button"
            onClick={() => onReserve(slot)}
            onMouseEnter={() => setReserveHovered(true)}
            onMouseLeave={() => setReserveHovered(false)}
            style={{
              flexShrink: 0,
              borderRadius: 'var(--radius)',
              padding: '0.3rem 0.85rem',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
              backgroundColor: reserveHovered ? 'rgb(var(--accent) / 0.85)' : 'rgb(var(--accent))',
              color: 'rgb(var(--accent-foreground))',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            Reserve
          </button>
        )}
      </div>

      {isPending && (
        <div
          style={{
            marginTop: '0.6rem',
            borderRadius: 'var(--radius)',
            padding: '0.6rem 0.75rem',
            backgroundColor: 'rgb(var(--primary) / 0.08)',
          }}
        >
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'rgb(var(--foreground))', marginBottom: '0.5rem' }}>
            Confirm{' '}
            <span style={{ color: 'rgb(var(--accent))' }}>
              {formatSlotTime(slot.start_time)} &ndash; {formatSlotTime(slot.end_time)}
            </span>
            ?
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={onConfirm}
              disabled={bookingLoading}
              style={{
                borderRadius: 'var(--radius)',
                padding: '0.3rem 0.85rem',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-medium)',
                backgroundColor: 'rgb(var(--accent))',
                color: 'rgb(var(--accent-foreground))',
                border: 'none',
                cursor: bookingLoading ? 'not-allowed' : 'pointer',
                opacity: bookingLoading ? 0.6 : 1,
              }}
            >
              {bookingLoading ? 'Booking…' : 'Confirm'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={bookingLoading}
              style={{
                borderRadius: 'var(--radius)',
                padding: '0.3rem 0.85rem',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-medium)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgb(var(--muted-foreground))',
              }}
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

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-bold)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'rgb(var(--muted-foreground))',
        marginBottom: '0.6rem',
        paddingBottom: '0.35rem',
        borderBottom: '1px solid rgb(var(--border))',
      }}
    >
      {children}
    </h3>
  )
}

function Tag({
  label,
  variant = 'neutral',
}: {
  label: string
  variant?: 'neutral' | 'accent' | 'warning'
}) {
  const dotColor =
    variant === 'accent'
      ? 'rgb(var(--accent))'
      : variant === 'warning'
      ? 'rgb(var(--destructive))'
      : 'rgb(var(--muted-foreground))'

  const bg =
    variant === 'accent'
      ? 'rgb(var(--accent) / 0.08)'
      : variant === 'warning'
      ? 'rgb(var(--destructive) / 0.08)'
      : 'rgb(var(--muted) / 0.4)'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.2rem 0.55rem 0.2rem 0.45rem',
        borderRadius: 'var(--radius)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-medium)',
        backgroundColor: bg,
        color: 'rgb(var(--foreground))',
        border: '1px solid rgb(var(--border))',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  )
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '0.35rem',
        fontSize: 'var(--text-sm)',
        flexWrap: 'wrap',
        alignItems: 'baseline',
      }}
    >
      <span style={{ color: 'rgb(var(--muted-foreground))', flexShrink: 0, minWidth: '6rem' }}>{label}</span>
      <span style={{ color: 'rgb(var(--foreground))' }}>{value}</span>
    </div>
  )
}

function TagRow({ tags }: { tags: { label: string; variant?: 'neutral' | 'accent' | 'warning' }[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
      {tags.map((t) => (
        <Tag key={t.label} label={t.label} variant={t.variant} />
      ))}
    </div>
  )
}

function RulesetBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <SectionHeading>{title}</SectionHeading>
      {children}
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
    <div style={{ marginTop: '1.5rem' }}>
      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.05rem',
          fontWeight: 'var(--weight-bold)',
          color: 'rgb(var(--foreground))',
          marginBottom: '1rem',
          paddingBottom: '0.5rem',
          borderBottom: '2px solid rgb(var(--accent) / 0.3)',
        }}
      >
        Adventure Details
      </h2>

      {hasCoreSpecs && (
        <RulesetBlock title="Core Specs">
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
        </RulesetBlock>
      )}

      {hasEnvironment && (
        <RulesetBlock title="Environment">
          {location.landscape_type && <MetaRow label="Landscape" value={capitalize(location.landscape_type)} />}
          {location.setting && <MetaRow label="Setting" value={capitalize(location.setting)} />}
          {location.environment_tags && location.environment_tags.length > 0 && (
            <TagRow tags={location.environment_tags.map((t) => ({ label: capitalize(t.replace(/_/g, ' ')), variant: 'neutral' as const }))} />
          )}
        </RulesetBlock>
      )}

      {hasRestrictions && (
        <RulesetBlock title="Restrictions & Access">
          {location.magic_restrictions && location.magic_restrictions.length > 0 && (
            <TagRow tags={location.magic_restrictions.map((r) => ({ label: capitalize(r.replace(/_/g, ' ')), variant: 'warning' as const }))} />
          )}
          {location.class_restrictions && location.class_restrictions.length > 0 && (
            <MetaRow label="Class" value={location.class_restrictions.map(capitalize).join(', ')} />
          )}
          {location.race_restrictions && location.race_restrictions.length > 0 && (
            <MetaRow label="Race" value={location.race_restrictions.map(capitalize).join(', ')} />
          )}
          {location.faction_restrictions && location.faction_restrictions.length > 0 && (
            <MetaRow label="Faction" value={location.faction_restrictions.map(capitalize).join(', ')} />
          )}
          {location.physical_access && location.physical_access.length > 0 && (
            <TagRow tags={location.physical_access.map((a) => ({ label: capitalize(a.replace(/_/g, ' ')), variant: 'warning' as const }))} />
          )}
          {location.party_composition_tags && location.party_composition_tags.length > 0 && (
            <TagRow tags={location.party_composition_tags.map((t) => ({ label: capitalize(t.replace(/_/g, ' ')), variant: 'neutral' as const }))} />
          )}
          {(location.mount_permitted || location.familiar_permitted || location.solo_permitted) && (
            <TagRow tags={[
              ...(location.mount_permitted ? [{ label: 'Mount Permitted', variant: 'accent' as const }] : []),
              ...(location.familiar_permitted ? [{ label: 'Familiar Permitted', variant: 'accent' as const }] : []),
              ...(location.solo_permitted ? [{ label: 'Solo Permitted', variant: 'accent' as const }] : []),
            ]} />
          )}
          {location.booking_type && <MetaRow label="Booking" value={capitalize(location.booking_type)} />}
        </RulesetBlock>
      )}

      {hasTone && (
        <RulesetBlock title="Tone & Content">
          {location.tone_tags && location.tone_tags.length > 0 && (
            <TagRow tags={location.tone_tags.map((t) => ({ label: capitalize(t), variant: 'accent' as const }))} />
          )}
          {location.primary_focus && <MetaRow label="Primary Focus" value={capitalize(location.primary_focus)} />}
          {location.gore_level != null && (
            <MetaRow label="Gore Level" value={GORE_LABELS[location.gore_level] ?? String(location.gore_level)} />
          )}
          {(location.permadeath_risk || location.pvp_permitted || location.boss_encounter || location.non_lethal_mode || location.scouting_permitted) && (
            <TagRow tags={[
              ...(location.permadeath_risk ? [{ label: 'Permadeath Risk', variant: 'warning' as const }] : []),
              ...(location.pvp_permitted ? [{ label: 'PvP Permitted', variant: 'warning' as const }] : []),
              ...(location.boss_encounter ? [{ label: 'Boss Encounter', variant: 'accent' as const }] : []),
              ...(location.non_lethal_mode ? [{ label: 'Non-Lethal Mode', variant: 'accent' as const }] : []),
              ...(location.scouting_permitted ? [{ label: 'Scouting Permitted', variant: 'neutral' as const }] : []),
            ]} />
          )}
        </RulesetBlock>
      )}

      {hasRunLogistics && (
        <RulesetBlock title="Run Logistics">
          {location.run_time_minutes != null && <MetaRow label="Est. Run Time" value={`${location.run_time_minutes} min`} />}
          {location.reset_time_hours != null && <MetaRow label="Reset Time" value={`${location.reset_time_hours} hr`} />}
          {location.time_limit_minutes != null && <MetaRow label="Time Limit" value={`${location.time_limit_minutes} min`} />}
        </RulesetBlock>
      )}

      {hasAmenities && (
        <RulesetBlock title="Amenities & Loot">
          {(location.has_safe_room || location.has_merchant || location.equipment_provided || location.guide_provided) && (
            <TagRow tags={[
              ...(location.has_safe_room ? [{ label: 'Safe Room', variant: 'accent' as const }] : []),
              ...(location.has_merchant ? [{ label: 'Merchant', variant: 'accent' as const }] : []),
              ...(location.equipment_provided ? [{ label: 'Equipment Provided', variant: 'accent' as const }] : []),
              ...(location.guide_provided ? [{ label: 'Guide Provided', variant: 'accent' as const }] : []),
            ]} />
          )}
          {location.loot_type && <MetaRow label="Loot" value={capitalize(location.loot_type)} />}
          {(location.boss_loot || location.unique_item_chance) && (
            <TagRow tags={[
              ...(location.boss_loot ? [{ label: 'Boss Loot', variant: 'accent' as const }] : []),
              ...(location.unique_item_chance ? [{ label: 'Unique Item Chance', variant: 'accent' as const }] : []),
            ]} />
          )}
        </RulesetBlock>
      )}
    </div>
  )
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.2rem 0.65rem',
        borderRadius: 'var(--radius)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-bold)',
        letterSpacing: '0.04em',
        backgroundColor: DIFFICULTY_COLOURS[difficulty as keyof typeof DIFFICULTY_COLOURS] ?? 'rgb(var(--muted))',
        color: 'rgb(var(--primary-foreground, 255 255 255))',
      }}
    >
      {difficulty}
    </span>
  )
}

function BookingPanel({
  location,
  slots,
  slotsLoading,
  slotsError,
  pendingSlot,
  bookingLoading,
  conflictError,
  bookingError,
  onReserve,
  onConfirm,
  onCancel,
}: {
  location: BookingLocation
  slots: TimeSlot[] | null | undefined
  slotsLoading: boolean
  slotsError: unknown
  pendingSlot: TimeSlot | null
  bookingLoading: boolean
  conflictError: string | null
  bookingError: string | null
  onReserve: (slot: TimeSlot) => void
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      style={{
        borderRadius: 'var(--radius)',
        backgroundColor: 'rgb(var(--card))',
        boxShadow: 'var(--shadow-card)',
        padding: '1.25rem',
        position: 'sticky',
        top: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <DifficultyBadge difficulty={location.difficulty} />
        {location.provider_first_name && location.provider_last_name && (
          <Link
            to={`/providers/${location.provider_id}/profile`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
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

      {location.cancellation_policy && (
        <div style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgb(var(--border))' }}>
          <p
            style={{
              fontSize: '0.7rem',
              fontWeight: 'var(--weight-bold)',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              color: 'rgb(var(--muted-foreground))',
              marginBottom: '0.3rem',
            }}
          >
            Cancellation Policy
          </p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--foreground))', lineHeight: 1.5 }}>
            {location.cancellation_policy}
          </p>
        </div>
      )}

      <h2
        style={{
          fontSize: '0.7rem',
          fontWeight: 'var(--weight-bold)',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          color: 'rgb(var(--muted-foreground))',
          marginBottom: '0.75rem',
        }}
      >
        Available Times
      </h2>

      {conflictError && (
        <p
          style={{
            marginBottom: '0.75rem',
            borderRadius: 'var(--radius)',
            padding: '0.5rem 0.75rem',
            fontSize: 'var(--text-sm)',
            backgroundColor: 'rgb(var(--destructive) / 0.1)',
            color: 'rgb(var(--destructive))',
          }}
        >
          {conflictError}
        </p>
      )}

      {bookingError && (
        <p
          style={{
            marginBottom: '0.75rem',
            borderRadius: 'var(--radius)',
            padding: '0.5rem 0.75rem',
            fontSize: 'var(--text-sm)',
            backgroundColor: 'rgb(var(--destructive) / 0.1)',
            color: 'rgb(var(--destructive))',
          }}
        >
          {bookingError}
        </p>
      )}

      {slotsLoading && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))' }}>
          Loading available slots…
        </p>
      )}

      {!slotsLoading && slotsError && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--destructive))' }}>
          Failed to load available times.
        </p>
      )}

      {!slotsLoading && !slotsError && slots && slots.length === 0 && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))' }}>
          No available time slots at this time.
        </p>
      )}

      {!slotsLoading && !slotsError && slots && slots.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {slots.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              isPending={pendingSlot?.id === slot.id}
              bookingLoading={bookingLoading}
              onReserve={onReserve}
              onConfirm={onConfirm}
              onCancel={onCancel}
            />
          ))}
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
      <main style={{ padding: '2rem' }}>
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading location…</p>
      </main>
    )
  }

  if (error) {
    return (
      <main style={{ padding: '2rem' }}>
        <Link
          to="/locations"
          style={{ display: 'inline-block', marginBottom: '1rem', fontSize: 'var(--text-sm)', color: 'rgb(var(--accent))', textDecoration: 'none' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none' }}
        >
          &larr; Back to Adventures
        </Link>
        <p style={{ marginTop: '1rem', color: 'rgb(var(--destructive))' }}>
          Location not found or an error occurred.
        </p>
      </main>
    )
  }

  if (!location) return null

  return (
    <main
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1.5rem 2rem 3rem',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Link
        to="/locations"
        style={{ display: 'inline-block', marginBottom: '1.25rem', fontSize: 'var(--text-sm)', color: 'rgb(var(--accent))', textDecoration: 'none' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none' }}
      >
        &larr; Back to Adventures
      </Link>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* Left column — content */}
        <div>
          {/* Hero card */}
          <div
            style={{
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              backgroundColor: 'rgb(var(--card))',
              boxShadow: 'var(--shadow-card)',
              marginBottom: '1.5rem',
            }}
          >
            {images && images.length > 0 && (
              <div style={{ height: '340px' }}>
                <LocationGallery images={images} locationName={location.name} />
              </div>
            )}
            <div style={{ padding: '1.5rem' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.75rem',
                  fontWeight: 'var(--weight-bold)',
                  color: 'rgb(var(--foreground))',
                  marginBottom: '0.75rem',
                  lineHeight: 1.2,
                }}
              >
                {location.name}
              </h1>

              {location.description && (
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'rgb(var(--foreground))',
                    lineHeight: 1.7,
                  }}
                >
                  {location.description}
                </p>
              )}
            </div>
          </div>

          {/* Ruleset details */}
          {(() => {
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

            if (!(hasCoreSpecs || hasEnvironment || hasRestrictions || hasTone || hasRunLogistics || hasAmenities)) return null

            return (
              <div
                style={{
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'rgb(var(--card))',
                  boxShadow: 'var(--shadow-card)',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                <RulesetDisplay location={location} />
              </div>
            )
          })()}

          {/* Reviews */}
          {id && (
            <div
              style={{
                borderRadius: 'var(--radius)',
                backgroundColor: 'rgb(var(--card))',
                boxShadow: 'var(--shadow-card)',
                padding: '1.5rem',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.05rem',
                  fontWeight: 'var(--weight-bold)',
                  color: 'rgb(var(--foreground))',
                  marginBottom: '1rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '2px solid rgb(var(--accent) / 0.3)',
                }}
              >
                Reviews
              </h2>
              <ReviewList targetId={id} targetType="location" refreshKey={reviewRefreshKey} />
              {role === 'customer' && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgb(var(--border))' }}>
                  {eligibleBooking ? (
                    <ReviewForm
                      bookingId={eligibleBooking.id}
                      targetId={id}
                      targetType="location"
                      onSuccess={() => setReviewRefreshKey((k) => k + 1)}
                    />
                  ) : (
                    <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))' }}>
                      Book this adventure to leave a review.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column — booking panel */}
        <div>
          <BookingPanel
            location={location}
            slots={slots}
            slotsLoading={slotsLoading}
            slotsError={slotsError}
            pendingSlot={pendingSlot}
            bookingLoading={bookingLoading}
            conflictError={conflictError}
            bookingError={bookingError}
            onReserve={handleReserveClick}
            onConfirm={handleConfirm}
            onCancel={handleCancelConfirm}
          />
        </div>
      </div>
    </main>
  )
}
