import React, { useState } from 'react'
import type { CreateLocationPayload } from '@/api/provider.api'
import {
  DIFFICULTY_OPTIONS,
  LANDSCAPE_TYPE_OPTIONS,
  SETTING_OPTIONS,
  TONE_TAG_OPTIONS,
  PRIMARY_FOCUS_OPTIONS,
  LOOT_TYPE_OPTIONS,
  BOOKING_TYPE_OPTIONS,
  type Difficulty,
  type LandscapeType,
  type LocationSetting,
  type ToneTag,
  type PrimaryFocus,
  type LootType,
  type BookingType,
} from '@/types/domain'

export type SurveyState = Partial<CreateLocationPayload>

interface LocationSurveyProps {
  formState: SurveyState
  onChange: (updates: Partial<SurveyState>) => void
  onSubmit: () => Promise<void>
  submitLabel?: string
  apiError?: string | null
  isSubmitting?: boolean
  submitDisabled?: boolean
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  borderRadius: 'var(--radius)',
  border: '1px solid rgb(var(--border))',
  fontSize: 'var(--text-sm)',
  backgroundColor: 'rgb(var(--background))',
  color: 'rgb(var(--foreground))',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '0.25rem',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--weight-medium)',
  color: 'rgb(var(--foreground))',
}

const fieldStyle: React.CSSProperties = {
  marginBottom: '1rem',
}

const errorStyle: React.CSSProperties = {
  marginTop: '0.25rem',
  fontSize: '0.75rem',
  color: 'rgb(var(--destructive))',
}

const optionalLabel = (
  <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'rgb(var(--muted-foreground))' }}>
    {' '}(optional)
  </span>
)

function parseTagInput(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: '0.7rem',
        fontWeight: 'var(--weight-bold)',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        color: 'rgb(var(--muted-foreground))',
        marginBottom: '0.75rem',
        paddingBottom: '0.4rem',
        borderBottom: '1px solid rgb(var(--border))',
      }}
    >
      {children}
    </p>
  )
}

function BooleanToggle({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label
      htmlFor={id}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        fontSize: 'var(--text-sm)',
        color: 'rgb(var(--foreground))',
        marginBottom: '0.5rem',
      }}
    >
      <input
        id={id}
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        style={{ cursor: 'pointer' }}
      />
      {label}
    </label>
  )
}

function CheckboxGroup<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: T[]
  selected: T[]
  onChange: (v: T[]) => void
}) {
  function toggle(opt: T) {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt))
    } else {
      onChange([...selected, opt])
    }
  }

  return (
    <div style={fieldStyle}>
      <span style={labelStyle}>{label}{optionalLabel}</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {options.map((opt) => (
          <label
            key={opt}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: 'var(--text-sm)',
              color: 'rgb(var(--foreground))',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius)',
              border: `1px solid ${selected.includes(opt) ? 'rgb(var(--accent))' : 'rgb(var(--border))'}`,
              backgroundColor: selected.includes(opt) ? 'rgb(var(--accent) / 0.1)' : 'transparent',
            }}
          >
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => toggle(opt)}
              style={{ cursor: 'pointer' }}
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  )
}

function RadioGroup<T extends string>({
  id,
  label,
  options,
  value,
  onChange,
  required,
}: {
  id: string
  label: string
  options: { value: T; label: string }[]
  value: T | undefined
  onChange: (v: T) => void
  required?: boolean
}) {
  return (
    <div style={fieldStyle}>
      <span style={labelStyle}>{label}{!required && optionalLabel}</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {options.map((opt) => (
          <label
            key={opt.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: 'var(--text-sm)',
              color: 'rgb(var(--foreground))',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius)',
              border: `1px solid ${value === opt.value ? 'rgb(var(--accent))' : 'rgb(var(--border))'}`,
              backgroundColor: value === opt.value ? 'rgb(var(--accent) / 0.1)' : 'transparent',
            }}
          >
            <input
              type="radio"
              name={id}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              style={{ cursor: 'pointer' }}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  )
}

function TabCoreInfo({
  state,
  onChange,
  errors,
}: {
  state: SurveyState
  onChange: (u: Partial<SurveyState>) => void
  errors: Record<string, string>
}) {
  return (
    <div>
      <SectionLabel>Basic Information</SectionLabel>

      <div style={fieldStyle}>
        <label htmlFor="srv-name" style={labelStyle}>Name</label>
        <input
          id="srv-name"
          type="text"
          style={{ ...inputStyle, borderColor: errors.name ? 'rgb(var(--destructive))' : 'rgb(var(--border))' }}
          value={state.name ?? ''}
          onChange={(e) => onChange({ name: e.target.value })}
        />
        {errors.name && <p style={errorStyle}>{errors.name}</p>}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="srv-desc" style={labelStyle}>Description{optionalLabel}</label>
        <textarea
          id="srv-desc"
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
          value={state.description ?? ''}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>

      <div style={fieldStyle}>
        <label htmlFor="srv-diff" style={labelStyle}>Difficulty</label>
        <select
          id="srv-diff"
          style={{ ...inputStyle, borderColor: errors.difficulty ? 'rgb(var(--destructive))' : 'rgb(var(--border))' }}
          value={state.difficulty ?? ''}
          onChange={(e) => onChange({ difficulty: e.target.value as Difficulty })}
        >
          <option value="">Select difficulty…</option>
          {DIFFICULTY_OPTIONS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {errors.difficulty && <p style={errorStyle}>{errors.difficulty}</p>}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="srv-cancel" style={labelStyle}>Cancellation Policy{optionalLabel}</label>
        <textarea
          id="srv-cancel"
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
          value={state.cancellation_policy ?? ''}
          onChange={(e) => onChange({ cancellation_policy: e.target.value })}
        />
      </div>

      <SectionLabel>Party Requirements</SectionLabel>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={fieldStyle}>
          <label htmlFor="srv-pmin" style={labelStyle}>Party Size Min{optionalLabel}</label>
          <input
            id="srv-pmin"
            type="number"
            min={1}
            style={inputStyle}
            value={state.party_size_min ?? ''}
            onChange={(e) => onChange({ party_size_min: e.target.value ? parseInt(e.target.value, 10) : undefined })}
          />
        </div>
        <div style={fieldStyle}>
          <label htmlFor="srv-pmax" style={labelStyle}>Party Size Max{optionalLabel}</label>
          <input
            id="srv-pmax"
            type="number"
            min={1}
            style={inputStyle}
            value={state.party_size_max ?? ''}
            onChange={(e) => onChange({ party_size_max: e.target.value ? parseInt(e.target.value, 10) : undefined })}
          />
        </div>
        <div style={fieldStyle}>
          <label htmlFor="srv-lmin" style={labelStyle}>Level Range Min{optionalLabel}</label>
          <input
            id="srv-lmin"
            type="number"
            min={1}
            style={inputStyle}
            value={state.level_range_min ?? ''}
            onChange={(e) => onChange({ level_range_min: e.target.value ? parseInt(e.target.value, 10) : undefined })}
          />
        </div>
        <div style={fieldStyle}>
          <label htmlFor="srv-lmax" style={labelStyle}>Level Range Max{optionalLabel}</label>
          <input
            id="srv-lmax"
            type="number"
            min={1}
            style={inputStyle}
            value={state.level_range_max ?? ''}
            onChange={(e) => onChange({ level_range_max: e.target.value ? parseInt(e.target.value, 10) : undefined })}
          />
        </div>
      </div>
    </div>
  )
}

function TabEnvironment({
  state,
  onChange,
}: {
  state: SurveyState
  onChange: (u: Partial<SurveyState>) => void
}) {
  return (
    <div>
      <SectionLabel>Location & Landscape</SectionLabel>

      <div style={fieldStyle}>
        <label htmlFor="srv-landscape" style={labelStyle}>Landscape Type{optionalLabel}</label>
        <select
          id="srv-landscape"
          style={inputStyle}
          value={state.landscape_type ?? ''}
          onChange={(e) => onChange({ landscape_type: (e.target.value || null) as LandscapeType | null })}
        >
          <option value="">Select landscape…</option>
          {LANDSCAPE_TYPE_OPTIONS.map((lt) => (
            <option key={lt} value={lt}>{lt}</option>
          ))}
        </select>
      </div>

      <RadioGroup<LocationSetting>
        id="srv-setting"
        label="Setting"
        options={SETTING_OPTIONS.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
        value={state.setting ?? undefined}
        onChange={(v) => onChange({ setting: v })}
      />

      <SectionLabel>Special Environment Tags</SectionLabel>

      <CheckboxGroup
        label="Environment Tags"
        options={['lava', 'haunted', 'aerial', 'underwater', 'frozen', 'toxic', 'astral']}
        selected={(state.environment_tags as string[]) ?? []}
        onChange={(v) => onChange({ environment_tags: v })}
      />
    </div>
  )
}

function TabRestrictions({
  state,
  onChange,
}: {
  state: SurveyState
  onChange: (u: Partial<SurveyState>) => void
}) {
  return (
    <div>
      <SectionLabel>Magic & Access</SectionLabel>

      <CheckboxGroup
        label="Magic Restrictions"
        options={['antimagic', 'wild_magic', 'divine_restricted', 'arcane_restricted', 'none']}
        selected={(state.magic_restrictions as string[]) ?? []}
        onChange={(v) => onChange({ magic_restrictions: v })}
      />

      <CheckboxGroup
        label="Physical Access Requirements"
        options={['vertical_traversal', 'water_traversal', 'narrow_passages', 'darkness']}
        selected={(state.physical_access as string[]) ?? []}
        onChange={(v) => onChange({ physical_access: v })}
      />

      <SectionLabel>Class, Race & Faction</SectionLabel>

      <div style={fieldStyle}>
        <label htmlFor="srv-class" style={labelStyle}>Class Restrictions{optionalLabel}</label>
        <input
          id="srv-class"
          type="text"
          placeholder="e.g. wizard, rogue (comma-separated)"
          style={inputStyle}
          value={(state.class_restrictions ?? []).join(', ')}
          onChange={(e) => onChange({ class_restrictions: parseTagInput(e.target.value) })}
        />
      </div>

      <div style={fieldStyle}>
        <label htmlFor="srv-race" style={labelStyle}>Race Restrictions{optionalLabel}</label>
        <input
          id="srv-race"
          type="text"
          placeholder="e.g. elf, dwarf (comma-separated)"
          style={inputStyle}
          value={(state.race_restrictions ?? []).join(', ')}
          onChange={(e) => onChange({ race_restrictions: parseTagInput(e.target.value) })}
        />
      </div>

      <div style={fieldStyle}>
        <label htmlFor="srv-faction" style={labelStyle}>Faction Restrictions{optionalLabel}</label>
        <input
          id="srv-faction"
          type="text"
          placeholder="e.g. Harpers, Zhentarim (comma-separated)"
          style={inputStyle}
          value={(state.faction_restrictions ?? []).join(', ')}
          onChange={(e) => onChange({ faction_restrictions: parseTagInput(e.target.value) })}
        />
      </div>

      <SectionLabel>Party Composition & Permits</SectionLabel>

      <div style={fieldStyle}>
        <label htmlFor="srv-comp" style={labelStyle}>Party Composition Tags{optionalLabel}</label>
        <input
          id="srv-comp"
          type="text"
          placeholder="e.g. healer_required, no_all_melee (comma-separated)"
          style={inputStyle}
          value={(state.party_composition_tags ?? []).join(', ')}
          onChange={(e) => onChange({ party_composition_tags: parseTagInput(e.target.value) })}
        />
      </div>

      <div>
        <span style={labelStyle}>Permits</span>
        <BooleanToggle
          id="srv-mount"
          label="Mount Permitted"
          value={state.mount_permitted ?? false}
          onChange={(v) => onChange({ mount_permitted: v })}
        />
        <BooleanToggle
          id="srv-familiar"
          label="Familiar Permitted"
          value={state.familiar_permitted ?? false}
          onChange={(v) => onChange({ familiar_permitted: v })}
        />
        <BooleanToggle
          id="srv-solo"
          label="Solo Permitted"
          value={state.solo_permitted ?? false}
          onChange={(v) => onChange({ solo_permitted: v })}
        />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <RadioGroup<BookingType>
          id="srv-booking-type"
          label="Booking Type"
          options={BOOKING_TYPE_OPTIONS.map((bt) => ({ value: bt, label: bt.charAt(0).toUpperCase() + bt.slice(1) }))}
          value={state.booking_type ?? undefined}
          onChange={(v) => onChange({ booking_type: v })}
        />
      </div>
    </div>
  )
}

function TabTone({
  state,
  onChange,
}: {
  state: SurveyState
  onChange: (u: Partial<SurveyState>) => void
}) {
  return (
    <div>
      <SectionLabel>Tone & Atmosphere</SectionLabel>

      <CheckboxGroup<ToneTag>
        label="Tone Tags"
        options={TONE_TAG_OPTIONS}
        selected={(state.tone_tags as ToneTag[]) ?? []}
        onChange={(v) => onChange({ tone_tags: v })}
      />

      <RadioGroup<PrimaryFocus>
        id="srv-focus"
        label="Primary Focus"
        options={PRIMARY_FOCUS_OPTIONS.map((f) => ({ value: f, label: f.charAt(0).toUpperCase() + f.slice(1) }))}
        value={state.primary_focus ?? undefined}
        onChange={(v) => onChange({ primary_focus: v })}
      />

      <RadioGroup
        id="srv-gore"
        label="Gore Level"
        options={[
          { value: '0', label: 'None' },
          { value: '1', label: 'Mild' },
          { value: '2', label: 'Moderate' },
          { value: '3', label: 'Graphic' },
        ]}
        value={state.gore_level !== undefined && state.gore_level !== null ? String(state.gore_level) : undefined}
        onChange={(v) => onChange({ gore_level: parseInt(v, 10) })}
      />

      <SectionLabel>Content Flags</SectionLabel>

      <BooleanToggle
        id="srv-nonlethal"
        label="Non-Lethal Mode Available"
        value={state.non_lethal_mode ?? false}
        onChange={(v) => onChange({ non_lethal_mode: v })}
      />
      <BooleanToggle
        id="srv-permadeath"
        label="Permadeath Risk"
        value={state.permadeath_risk ?? false}
        onChange={(v) => onChange({ permadeath_risk: v })}
      />
      <BooleanToggle
        id="srv-boss"
        label="Boss Encounter Present"
        value={state.boss_encounter ?? false}
        onChange={(v) => onChange({ boss_encounter: v })}
      />
      <BooleanToggle
        id="srv-pvp"
        label="PvP Within Party Permitted"
        value={state.pvp_permitted ?? false}
        onChange={(v) => onChange({ pvp_permitted: v })}
      />
      <BooleanToggle
        id="srv-scouting"
        label="Scouting Run Permitted"
        value={state.scouting_permitted ?? false}
        onChange={(v) => onChange({ scouting_permitted: v })}
      />
    </div>
  )
}

function TabLogistics({
  state,
  onChange,
}: {
  state: SurveyState
  onChange: (u: Partial<SurveyState>) => void
}) {
  return (
    <div>
      <SectionLabel>Timing</SectionLabel>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        <div style={fieldStyle}>
          <label htmlFor="srv-runtime" style={labelStyle}>Estimated Run Time (min){optionalLabel}</label>
          <input
            id="srv-runtime"
            type="number"
            min={1}
            style={inputStyle}
            value={state.run_time_minutes ?? ''}
            onChange={(e) => onChange({ run_time_minutes: e.target.value ? parseInt(e.target.value, 10) : undefined })}
          />
        </div>
        <div style={fieldStyle}>
          <label htmlFor="srv-reset" style={labelStyle}>Reset Time (hours){optionalLabel}</label>
          <input
            id="srv-reset"
            type="number"
            min={1}
            style={inputStyle}
            value={state.reset_time_hours ?? ''}
            onChange={(e) => onChange({ reset_time_hours: e.target.value ? parseInt(e.target.value, 10) : undefined })}
          />
        </div>
        <div style={fieldStyle}>
          <label htmlFor="srv-timelimit" style={labelStyle}>Time Limit (min, blank = none){optionalLabel}</label>
          <input
            id="srv-timelimit"
            type="number"
            min={1}
            style={inputStyle}
            value={state.time_limit_minutes ?? ''}
            onChange={(e) => onChange({ time_limit_minutes: e.target.value ? parseInt(e.target.value, 10) : null })}
          />
        </div>
      </div>
    </div>
  )
}

function TabAmenities({
  state,
  onChange,
}: {
  state: SurveyState
  onChange: (u: Partial<SurveyState>) => void
}) {
  return (
    <div>
      <SectionLabel>On-Site Amenities</SectionLabel>

      <BooleanToggle
        id="srv-saferoom"
        label="Safe Room Present"
        value={state.has_safe_room ?? false}
        onChange={(v) => onChange({ has_safe_room: v })}
      />
      <BooleanToggle
        id="srv-merchant"
        label="On-Site Merchant"
        value={state.has_merchant ?? false}
        onChange={(v) => onChange({ has_merchant: v })}
      />
      <BooleanToggle
        id="srv-equipment"
        label="Equipment Provided"
        value={state.equipment_provided ?? false}
        onChange={(v) => onChange({ equipment_provided: v })}
      />
      <BooleanToggle
        id="srv-guide"
        label="Guide / GM Provided"
        value={state.guide_provided ?? false}
        onChange={(v) => onChange({ guide_provided: v })}
      />

      <SectionLabel>Loot</SectionLabel>

      <RadioGroup<LootType>
        id="srv-loot"
        label="Loot Type"
        options={LOOT_TYPE_OPTIONS.map((l) => ({ value: l, label: l.charAt(0).toUpperCase() + l.slice(1) }))}
        value={state.loot_type ?? undefined}
        onChange={(v) => onChange({ loot_type: v })}
      />

      <BooleanToggle
        id="srv-bossloot"
        label="Boss Loot Present"
        value={state.boss_loot ?? false}
        onChange={(v) => onChange({ boss_loot: v })}
      />
      <BooleanToggle
        id="srv-unique"
        label="Unique Item Chance"
        value={state.unique_item_chance ?? false}
        onChange={(v) => onChange({ unique_item_chance: v })}
      />
    </div>
  )
}

const TAB_DEFS = [
  { id: 'core', label: 'Core Info' },
  { id: 'environment', label: 'Environment' },
  { id: 'restrictions', label: 'Restrictions' },
  { id: 'tone', label: 'Tone' },
  { id: 'logistics', label: 'Logistics' },
  { id: 'amenities', label: 'Amenities' },
] as const

type TabId = typeof TAB_DEFS[number]['id']

export function LocationSurvey({
  formState,
  onChange,
  onSubmit,
  submitLabel = 'Publish Location',
  apiError,
  isSubmitting = false,
  submitDisabled = false,
}: LocationSurveyProps) {
  const [activeTab, setActiveTab] = useState<TabId>('core')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function validateCore(): Record<string, string> {
    const errs: Record<string, string> = {}
    if (!formState.name?.trim()) errs.name = 'Name is required'
    if (!formState.difficulty) errs.difficulty = 'Please select a difficulty'
    return errs
  }

  async function handleSave() {
    const errs = validateCore()
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      setActiveTab('core')
      return
    }
    setFieldErrors({})
    await onSubmit()
  }

  return (
    <div>
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.15rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid rgb(var(--border))',
        }}
      >
        {TAB_DEFS.map((tab) => {
          const active = activeTab === tab.id
          const hasError = tab.id === 'core' && Object.keys(fieldErrors).length > 0
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.5rem 0.85rem',
                fontSize: 'var(--text-sm)',
                fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                color: hasError
                  ? 'rgb(var(--destructive))'
                  : active
                  ? 'rgb(var(--accent))'
                  : 'rgb(var(--muted-foreground))',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${active ? 'rgb(var(--accent))' : 'transparent'}`,
                marginBottom: '-1px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'color 0.12s ease, border-color 0.12s ease',
              }}
            >
              {tab.label}
              {hasError && (
                <span style={{ marginLeft: '0.3rem', color: 'rgb(var(--destructive))' }}>*</span>
              )}
            </button>
          )
        })}
      </div>

      {apiError && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius)',
            backgroundColor: 'rgb(var(--destructive) / 0.1)',
            color: 'rgb(var(--destructive))',
            fontSize: 'var(--text-sm)',
          }}
          role="alert"
        >
          {apiError}
        </div>
      )}

      <div style={{ minHeight: '280px' }}>
        {activeTab === 'core' && (
          <TabCoreInfo state={formState} onChange={onChange} errors={fieldErrors} />
        )}
        {activeTab === 'environment' && (
          <TabEnvironment state={formState} onChange={onChange} />
        )}
        {activeTab === 'restrictions' && (
          <TabRestrictions state={formState} onChange={onChange} />
        )}
        {activeTab === 'tone' && (
          <TabTone state={formState} onChange={onChange} />
        )}
        {activeTab === 'logistics' && (
          <TabLogistics state={formState} onChange={onChange} />
        )}
        {activeTab === 'amenities' && (
          <TabAmenities state={formState} onChange={onChange} />
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid rgb(var(--border))',
        }}
      >
        <button
          type="button"
          onClick={handleSave}
          disabled={isSubmitting || submitDisabled}
          style={{
            padding: '0.5rem 1.5rem',
            borderRadius: 'var(--radius)',
            backgroundColor: 'rgb(var(--accent))',
            color: 'rgb(var(--accent-foreground))',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-semibold)',
            border: 'none',
            cursor: isSubmitting || submitDisabled ? 'not-allowed' : 'pointer',
            opacity: isSubmitting || submitDisabled ? 0.45 : 1,
            transition: 'opacity 0.15s ease',
          }}
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </div>
  )
}
