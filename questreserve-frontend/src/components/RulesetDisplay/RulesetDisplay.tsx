import { Link } from 'react-router-dom'
import type { BookingLocation } from '@/types/domain'

export const GORE_LABELS: Record<number, string> = { 0: 'None', 1: 'Mild', 2: 'Moderate', 3: 'Graphic' }

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function primaryFocusLabel(value: number): string {
  if (value === 0) return 'Balanced'
  const abs = Math.abs(value)
  const side = value < 0 ? 'Puzzle' : 'Combat'
  const pct = abs === 5 ? 100 : abs === 4 ? 80 : abs === 3 ? 60 : abs === 2 ? 40 : 20
  return `${pct}% ${side}`
}

export function SectionHeading({ children }: { children: React.ReactNode }) {
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

export function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
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
      <span style={{ color: 'rgb(var(--muted-foreground))', flexShrink: 0, minWidth: '8rem' }}>{label}</span>
      <span style={{ color: 'rgb(var(--foreground))' }}>{value}</span>
    </div>
  )
}

export function RulesetBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <SectionHeading>{title}</SectionHeading>
      {children}
    </div>
  )
}

interface RulesetDisplayProps {
  location: BookingLocation
  emptyState?: 'null' | { editPath: string }
}

export function RulesetDisplay({ location, emptyState = 'null' }: RulesetDisplayProps) {
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
    if (emptyState === 'null') return null
    return (
      <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))' }}>
        No adventure details configured yet.{' '}
        <Link
          to={emptyState.editPath}
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
          {location.primary_focus != null && <MetaRow label="Primary Focus" value={primaryFocusLabel(location.primary_focus)} />}
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
