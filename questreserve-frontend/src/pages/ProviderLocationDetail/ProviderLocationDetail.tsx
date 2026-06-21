import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMyLocation } from '@/hooks/useMyLocation'
import { TimeSlotManager } from '@/components/TimeSlotManager/TimeSlotManager'
import { ReviewList, StarDisplay } from '@/components/ReviewList/ReviewList'
import { getReviews } from '@/api/guest.api'
import { DIFFICULTY_COLOURS } from '@/constants/difficulty'
import type { BookingLocation } from '@/types/domain'

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const GORE_LABELS: Record<number, string> = { 0: 'None', 1: 'Mild', 2: 'Moderate', 3: 'Graphic' }

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: '0.7rem',
        fontWeight: 'var(--weight-bold)',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        color: 'rgb(var(--muted-foreground))',
        marginBottom: '0.6rem',
        paddingBottom: '0.35rem',
        borderBottom: '1px solid rgb(var(--border))',
      }}
    >
      {children}
    </p>
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
      <span style={{ color: 'rgb(var(--muted-foreground))', flexShrink: 0, minWidth: '7rem' }}>{label}</span>
      <span style={{ color: 'rgb(var(--foreground))' }}>{value}</span>
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

  if (!hasAny) {
    return (
      <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))' }}>
        No adventure details configured yet.{' '}
        <Link
          to={`/provider/locations/${location.id}/edit`}
          style={{ color: 'rgb(var(--accent))', textDecoration: 'none' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none' }}
        >
          Edit adventure
        </Link>
        {' '}to fill in your ruleset.
      </p>
    )
  }

  return (
    <div>
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
            <MetaRow
              label="Environment"
              value={location.environment_tags.map((t) => capitalize(t.replace(/_/g, ' '))).join(', ')}
            />
          )}
        </RulesetBlock>
      )}

      {hasRestrictions && (
        <RulesetBlock title="Restrictions & Access">
          {location.magic_restrictions && location.magic_restrictions.length > 0 && (
            <MetaRow
              label="Magic"
              value={location.magic_restrictions.map((r) => capitalize(r.replace(/_/g, ' '))).join(', ')}
            />
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
            <MetaRow
              label="Physical Access"
              value={location.physical_access.map((a) => capitalize(a.replace(/_/g, ' '))).join(', ')}
            />
          )}
          {location.party_composition_tags && location.party_composition_tags.length > 0 && (
            <MetaRow
              label="Party Composition"
              value={location.party_composition_tags.map((t) => capitalize(t.replace(/_/g, ' '))).join(', ')}
            />
          )}
          {location.booking_type && <MetaRow label="Booking" value={capitalize(location.booking_type)} />}
          {(location.mount_permitted || location.familiar_permitted || location.solo_permitted) && (
            <MetaRow
              label="Permits"
              value={[
                location.mount_permitted ? 'Mount' : null,
                location.familiar_permitted ? 'Familiar' : null,
                location.solo_permitted ? 'Solo' : null,
              ].filter(Boolean).join(', ')}
            />
          )}
        </RulesetBlock>
      )}

      {hasTone && (
        <RulesetBlock title="Tone & Content">
          {location.tone_tags && location.tone_tags.length > 0 && (
            <MetaRow
              label="Tone"
              value={location.tone_tags.map((t) => capitalize(t)).join(', ')}
            />
          )}
          {location.primary_focus && <MetaRow label="Primary Focus" value={capitalize(location.primary_focus)} />}
          {location.gore_level != null && (
            <MetaRow label="Gore Level" value={GORE_LABELS[location.gore_level] ?? String(location.gore_level)} />
          )}
          {(location.permadeath_risk || location.pvp_permitted || location.boss_encounter || location.non_lethal_mode || location.scouting_permitted) && (
            <MetaRow
              label="Content Flags"
              value={[
                location.permadeath_risk ? 'Permadeath Risk' : null,
                location.pvp_permitted ? 'PvP Permitted' : null,
                location.boss_encounter ? 'Boss Encounter' : null,
                location.non_lethal_mode ? 'Non-Lethal Mode' : null,
                location.scouting_permitted ? 'Scouting Permitted' : null,
              ].filter(Boolean).join(', ')}
            />
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
            <MetaRow
              label="Amenities"
              value={[
                location.has_safe_room ? 'Safe Room' : null,
                location.has_merchant ? 'Merchant' : null,
                location.equipment_provided ? 'Equipment Provided' : null,
                location.guide_provided ? 'Guide Provided' : null,
              ].filter(Boolean).join(', ')}
            />
          )}
          {location.loot_type && <MetaRow label="Loot" value={capitalize(location.loot_type)} />}
          {(location.boss_loot || location.unique_item_chance) && (
            <MetaRow
              label="Loot Features"
              value={[
                location.boss_loot ? 'Boss Loot' : null,
                location.unique_item_chance ? 'Unique Item Chance' : null,
              ].filter(Boolean).join(', ')}
            />
          )}
        </RulesetBlock>
      )}
    </div>
  )
}

export function ProviderLocationDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: location, isLoading, error: fetchError } = useMyLocation(id ?? '')
  const [reviewsOpen, setReviewsOpen] = useState(false)
  const [reviewSummary, setReviewSummary] = useState<{ averageRating: number; count: number } | null>(null)

  useEffect(() => {
    if (!id) return
    getReviews(id, 'location')
      .then((data) => setReviewSummary({ averageRating: data.averageRating, count: data.count }))
      .catch((err) => console.error('ProviderLocationDetail: failed to load review summary', err))
  }, [id])

  if (!id) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'rgb(var(--destructive))' }}>Invalid adventure ID.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading adventure…</p>
      </div>
    )
  }

  if (fetchError || !location) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'rgb(var(--destructive))' }}>
          Failed to load adventure.
        </p>
        <Link
          to="/provider/dashboard"
          style={{
            display: 'inline-block',
            marginTop: '1rem',
            color: 'rgb(var(--accent))',
            textDecoration: 'none',
            fontSize: 'var(--text-sm)',
          }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '85%' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link
          to="/provider/dashboard"
          style={{
            fontSize: 'var(--text-sm)',
            color: 'rgb(var(--muted-foreground))',
            textDecoration: 'none',
          }}
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Header card */}
      <div
        style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius)',
          backgroundColor: 'rgb(var(--card))',
          boxShadow: 'var(--shadow-card)',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.75rem',
                fontWeight: 'var(--weight-bold)',
                color: 'rgb(var(--foreground))',
                margin: '0 0 0.5rem 0',
              }}
            >
              {location.name}
            </h1>
            <span
              style={{
                display: 'inline-block',
                padding: '0.2rem 0.65rem',
                borderRadius: 'var(--radius)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-bold)',
                letterSpacing: '0.04em',
                backgroundColor: DIFFICULTY_COLOURS[location.difficulty],
                color: 'rgb(var(--primary-foreground, 255 255 255))',
              }}
            >
              {location.difficulty}
            </span>
          </div>
          <Link
            to={`/provider/locations/${id}/edit`}
            style={{
              flexShrink: 0,
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius)',
              border: '1px solid rgb(var(--border))',
              color: 'rgb(var(--foreground))',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
              textDecoration: 'none',
              backgroundColor: 'transparent',
            }}
          >
            Edit Adventure
          </Link>
        </div>

        {location.image_url && (
          <div
            style={{
              width: '100%',
              aspectRatio: '16 / 9',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              marginBottom: '1.25rem',
              backgroundColor: 'rgb(var(--background))',
            }}
          >
            <img
              src={location.image_url}
              alt={location.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        {location.description && (
          <div style={{ marginBottom: '1.25rem' }}>
            <p
              style={{
                fontSize: '0.7rem',
                fontWeight: 'var(--weight-bold)',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                color: 'rgb(var(--muted-foreground))',
                marginBottom: '0.4rem',
              }}
            >
              Description
            </p>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'rgb(var(--muted-foreground))',
                lineHeight: '1.6',
              }}
            >
              {location.description}
            </p>
          </div>
        )}

        <div>
          <p
            style={{
              fontSize: '0.7rem',
              fontWeight: 'var(--weight-bold)',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              color: 'rgb(var(--muted-foreground))',
              marginBottom: '0.4rem',
            }}
          >
            Cancellation Policy
          </p>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'rgb(var(--muted-foreground))',
              lineHeight: '1.6',
            }}
          >
            {location.cancellation_policy}
          </p>
        </div>
      </div>

      {/* Ruleset card */}
      <div
        style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius)',
          backgroundColor: 'rgb(var(--card))',
          boxShadow: 'var(--shadow-card)',
          marginBottom: '1.5rem',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1rem',
            fontWeight: 'var(--weight-bold)',
            color: 'rgb(var(--foreground))',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '2px solid rgb(var(--accent) / 0.3)',
          }}
        >
          Adventure Details
        </h2>
        <RulesetDisplay location={location} />
      </div>

      <TimeSlotManager locationId={id} />

      {/* Reviews accordion */}
      <div
        style={{
          marginTop: '1.5rem',
          borderRadius: 'var(--radius)',
          backgroundColor: 'rgb(var(--card))',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
        }}
      >
        <button
          type="button"
          onClick={() => setReviewsOpen((o) => !o)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '1rem 1.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1rem',
                fontWeight: 'var(--weight-semibold)',
                color: 'rgb(var(--foreground))',
              }}
            >
              Guest Reviews
            </span>
            {reviewSummary !== null && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <StarDisplay rating={reviewSummary.averageRating} size={16} />
                <span style={{ fontSize: 'var(--text-xs)', color: 'rgb(var(--muted-foreground))' }}>
                  {reviewSummary.count === 0
                    ? 'No reviews yet'
                    : `${reviewSummary.averageRating.toFixed(1)} (${reviewSummary.count})`}
                </span>
              </span>
            )}
          </span>
          <span
            style={{
              fontSize: 'var(--text-sm)',
              color: 'rgb(var(--muted-foreground))',
              transform: reviewsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease',
              display: 'inline-block',
            }}
          >
            &#9660;
          </span>
        </button>

        {reviewsOpen && (
          <div style={{ padding: '0 1.5rem 1.5rem' }}>
            <ReviewList targetId={id} targetType="location" />
          </div>
        )}
      </div>
    </div>
  )
}
