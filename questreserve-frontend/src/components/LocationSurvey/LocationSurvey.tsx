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
}

const TOTAL_STEPS = 6

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

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: '0.95rem',
  fontWeight: 'var(--weight-semibold)',
  color: 'rgb(var(--foreground))',
  marginBottom: '1rem',
  marginTop: '0.25rem',
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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
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

function StepA({
  state,
  onChange,
  errors,
}: {
  state: SurveyState
  onChange: (u: Partial<SurveyState>) => void
  errors: Record<string, string>
}) {
  return (
    <>
      <p style={sectionHeadingStyle}>Core Info</p>

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
    </>
  )
}

function StepB({
  state,
  onChange,
}: {
  state: SurveyState
  onChange: (u: Partial<SurveyState>) => void
}) {
  return (
    <>
      <p style={sectionHeadingStyle}>Environment</p>

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

      <CheckboxGroup
        label="Environment Tags"
        options={['lava', 'haunted', 'aerial', 'underwater', 'frozen', 'toxic', 'astral']}
        selected={(state.environment_tags as string[]) ?? []}
        onChange={(v) => onChange({ environment_tags: v })}
      />
    </>
  )
}

function StepC({
  state,
  onChange,
}: {
  state: SurveyState
  onChange: (u: Partial<SurveyState>) => void
}) {
  return (
    <>
      <p style={sectionHeadingStyle}>Restrictions &amp; Access</p>

      <CheckboxGroup
        label="Magic Restrictions"
        options={['antimagic', 'wild_magic', 'divine_restricted', 'arcane_restricted', 'none']}
        selected={(state.magic_restrictions as string[]) ?? []}
        onChange={(v) => onChange({ magic_restrictions: v })}
      />

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

      <CheckboxGroup
        label="Physical Access Requirements"
        options={['vertical_traversal', 'water_traversal', 'narrow_passages', 'darkness']}
        selected={(state.physical_access as string[]) ?? []}
        onChange={(v) => onChange({ physical_access: v })}
      />

      <div style={{ marginBottom: '1rem' }}>
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

      <RadioGroup<BookingType>
        id="srv-booking-type"
        label="Booking Type"
        options={BOOKING_TYPE_OPTIONS.map((bt) => ({ value: bt, label: bt.charAt(0).toUpperCase() + bt.slice(1) }))}
        value={state.booking_type ?? undefined}
        onChange={(v) => onChange({ booking_type: v })}
      />
    </>
  )
}

function StepD({
  state,
  onChange,
}: {
  state: SurveyState
  onChange: (u: Partial<SurveyState>) => void
}) {
  return (
    <>
      <p style={sectionHeadingStyle}>Tone &amp; Content</p>

      <CheckboxGroup<ToneTag>
        label="Tone Tags"
        options={TONE_TAG_OPTIONS}
        selected={(state.tone_tags as ToneTag[]) ?? []}
        onChange={(v) => onChange({ tone_tags: v })}
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

      <RadioGroup<PrimaryFocus>
        id="srv-focus"
        label="Primary Focus"
        options={PRIMARY_FOCUS_OPTIONS.map((f) => ({ value: f, label: f.charAt(0).toUpperCase() + f.slice(1) }))}
        value={state.primary_focus ?? undefined}
        onChange={(v) => onChange({ primary_focus: v })}
      />

      <div style={{ marginBottom: '1rem' }}>
        <span style={labelStyle}>Flags</span>
        <BooleanToggle
          id="srv-nonlethal"
          label="Non-Lethal Mode"
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
          label="Boss Encounter"
          value={state.boss_encounter ?? false}
          onChange={(v) => onChange({ boss_encounter: v })}
        />
        <BooleanToggle
          id="srv-pvp"
          label="PvP Permitted"
          value={state.pvp_permitted ?? false}
          onChange={(v) => onChange({ pvp_permitted: v })}
        />
        <BooleanToggle
          id="srv-scouting"
          label="Scouting Permitted"
          value={state.scouting_permitted ?? false}
          onChange={(v) => onChange({ scouting_permitted: v })}
        />
      </div>
    </>
  )
}

function StepE({
  state,
  onChange,
}: {
  state: SurveyState
  onChange: (u: Partial<SurveyState>) => void
}) {
  return (
    <>
      <p style={sectionHeadingStyle}>Run Logistics</p>

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
    </>
  )
}

function StepF({
  state,
  onChange,
}: {
  state: SurveyState
  onChange: (u: Partial<SurveyState>) => void
}) {
  return (
    <>
      <p style={sectionHeadingStyle}>Amenities &amp; Loot</p>

      <div style={{ marginBottom: '1rem' }}>
        <span style={labelStyle}>Amenities</span>
        <BooleanToggle
          id="srv-saferoom"
          label="Has Safe Room"
          value={state.has_safe_room ?? false}
          onChange={(v) => onChange({ has_safe_room: v })}
        />
        <BooleanToggle
          id="srv-merchant"
          label="Has Merchant"
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
      </div>

      <RadioGroup<LootType>
        id="srv-loot"
        label="Loot Type"
        options={LOOT_TYPE_OPTIONS.map((l) => ({ value: l, label: l.charAt(0).toUpperCase() + l.slice(1) }))}
        value={state.loot_type ?? undefined}
        onChange={(v) => onChange({ loot_type: v })}
      />

      <div style={{ marginBottom: '1rem' }}>
        <span style={labelStyle}>Loot Flags</span>
        <BooleanToggle
          id="srv-bossloot"
          label="Boss Loot"
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
    </>
  )
}

const STEP_TITLES = [
  'Core Info',
  'Environment',
  'Restrictions & Access',
  'Tone & Content',
  'Run Logistics',
  'Amenities & Loot',
]

export function LocationSurvey({
  formState,
  onChange,
  onSubmit,
  submitLabel = 'Publish Location',
  apiError,
  isSubmitting = false,
}: LocationSurveyProps) {
  const [step, setStep] = useState(1)
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({})

  function validateStepA(): Record<string, string> {
    const errs: Record<string, string> = {}
    if (!formState.name?.trim()) errs.name = 'Name is required'
    if (!formState.difficulty) errs.difficulty = 'Please select a difficulty'
    return errs
  }

  function handleNext() {
    if (step === 1) {
      const errs = validateStepA()
      if (Object.keys(errs).length > 0) {
        setStepErrors(errs)
        return
      }
      setStepErrors({})
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  function handleBack() {
    setStepErrors({})
    setStep((s) => Math.max(s - 1, 1))
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius)',
          backgroundColor: 'rgb(var(--muted))',
        }}
      >
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'rgb(var(--foreground))' }}>
          Step {step} of {TOTAL_STEPS}: {STEP_TITLES[step - 1]}
        </span>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: i + 1 <= step ? 'rgb(var(--accent))' : 'rgb(var(--border))',
              }}
            />
          ))}
        </div>
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
        {step === 1 && <StepA state={formState} onChange={onChange} errors={stepErrors} />}
        {step === 2 && <StepB state={formState} onChange={onChange} />}
        {step === 3 && <StepC state={formState} onChange={onChange} />}
        {step === 4 && <StepD state={formState} onChange={onChange} />}
        {step === 5 && <StepE state={formState} onChange={onChange} />}
        {step === 6 && <StepF state={formState} onChange={onChange} />}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid rgb(var(--border))',
        }}
      >
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius)',
            border: '1px solid rgb(var(--border))',
            backgroundColor: 'transparent',
            color: step === 1 ? 'rgb(var(--muted-foreground))' : 'rgb(var(--foreground))',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-medium)',
            cursor: step === 1 ? 'not-allowed' : 'pointer',
            opacity: step === 1 ? 0.5 : 1,
          }}
        >
          Back
        </button>

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={handleNext}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius)',
              backgroundColor: 'rgb(var(--accent))',
              color: 'rgb(var(--accent-foreground))',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-semibold)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: 'var(--radius)',
              backgroundColor: 'rgb(var(--accent))',
              color: 'rgb(var(--accent-foreground))',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-semibold)',
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            {isSubmitting ? 'Saving…' : submitLabel}
          </button>
        )}
      </div>
    </div>
  )
}

