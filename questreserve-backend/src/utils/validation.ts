import { LandscapeType, LocationSetting, LootType, BookingType, ToneTag } from '../types';

const RULESET_FIELDS = [
  'party_size_min', 'party_size_max', 'level_range_min', 'level_range_max',
  'landscape_type', 'setting', 'environment_tags',
  'magic_restrictions', 'class_restrictions', 'race_restrictions',
  'faction_restrictions', 'party_composition_tags', 'physical_access',
  'mount_permitted', 'familiar_permitted', 'solo_permitted', 'booking_type',
  'tone_tags', 'gore_level', 'non_lethal_mode', 'permadeath_risk',
  'primary_focus', 'boss_encounter', 'pvp_permitted', 'scouting_permitted',
  'run_time_minutes', 'reset_time_hours', 'time_limit_minutes',
  'has_safe_room', 'has_merchant', 'equipment_provided', 'guide_provided',
  'loot_type', 'boss_loot', 'unique_item_chance',
] as const;

const VALID_LANDSCAPE_TYPES: LandscapeType[] = ['tundra', 'forest', 'desert', 'cave', 'coastal', 'volcanic', 'urban', 'plains', 'mountain', 'swamp'];
const VALID_SETTINGS: LocationSetting[] = ['interior', 'exterior'];
const VALID_LOOT_TYPES: LootType[] = ['guaranteed', 'random', 'none'];
const VALID_BOOKING_TYPES: BookingType[] = ['concurrent', 'exclusive'];
const VALID_TONE_TAGS: ToneTag[] = ['horror', 'heroic', 'comedic', 'mystery', 'political'];

const RULESET_BOOLEAN_FIELDS = [
  'mount_permitted', 'familiar_permitted', 'solo_permitted',
  'non_lethal_mode', 'permadeath_risk', 'boss_encounter',
  'pvp_permitted', 'scouting_permitted', 'has_safe_room',
  'has_merchant', 'equipment_provided', 'guide_provided',
  'boss_loot', 'unique_item_chance',
] as const;

const RULESET_INTEGER_FIELDS: Array<{ field: string; min: number; max: number }> = [
  { field: 'party_size_min', min: 1, max: 999 },
  { field: 'party_size_max', min: 1, max: 999 },
  { field: 'level_range_min', min: 1, max: 9999 },
  { field: 'level_range_max', min: 1, max: 9999 },
  { field: 'gore_level', min: 0, max: 3 },
  { field: 'primary_focus', min: -5, max: 5 },
  { field: 'run_time_minutes', min: 1, max: 99999 },
  { field: 'reset_time_hours', min: 0, max: 9999 },
  { field: 'time_limit_minutes', min: 1, max: 99999 },
];

const RULESET_STRING_ARRAY_FIELDS = [
  'environment_tags', 'magic_restrictions', 'class_restrictions',
  'race_restrictions', 'faction_restrictions', 'party_composition_tags',
  'physical_access', 'tone_tags',
] as const;

export function extractRulesetFields(body: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const field of RULESET_FIELDS) {
    if (field in body) result[field] = body[field];
  }
  return result;
}

export function validateRulesetFields(fields: Record<string, unknown>): string | null {
  if ('landscape_type' in fields && fields.landscape_type !== null && !VALID_LANDSCAPE_TYPES.includes(fields.landscape_type as LandscapeType)) {
    return `landscape_type must be one of: ${VALID_LANDSCAPE_TYPES.join(', ')}`;
  }
  if ('setting' in fields && fields.setting !== null && !VALID_SETTINGS.includes(fields.setting as LocationSetting)) {
    return `setting must be one of: ${VALID_SETTINGS.join(', ')}`;
  }
  if ('loot_type' in fields && fields.loot_type !== null && !VALID_LOOT_TYPES.includes(fields.loot_type as LootType)) {
    return `loot_type must be one of: ${VALID_LOOT_TYPES.join(', ')}`;
  }
  if ('booking_type' in fields && fields.booking_type !== null && !VALID_BOOKING_TYPES.includes(fields.booking_type as BookingType)) {
    return `booking_type must be one of: ${VALID_BOOKING_TYPES.join(', ')}`;
  }

  for (const boolField of RULESET_BOOLEAN_FIELDS) {
    if (boolField in fields && typeof fields[boolField] !== 'boolean') {
      return `${boolField} must be a boolean`;
    }
  }

  for (const { field, min, max } of RULESET_INTEGER_FIELDS) {
    if (field in fields && fields[field] !== null) {
      const val = fields[field];
      if (typeof val !== 'number' || !Number.isInteger(val) || val < min || val > max) {
        return `${field} must be an integer between ${min} and ${max}`;
      }
    }
  }

  if ('tone_tags' in fields && fields.tone_tags !== null) {
    if (!Array.isArray(fields.tone_tags) || !(fields.tone_tags as unknown[]).every((t) => VALID_TONE_TAGS.includes(t as ToneTag))) {
      return `tone_tags must be an array of: ${VALID_TONE_TAGS.join(', ')}`;
    }
  }

  for (const arrField of RULESET_STRING_ARRAY_FIELDS) {
    if (arrField === 'tone_tags') continue;
    if (arrField in fields && fields[arrField] !== null) {
      if (!Array.isArray(fields[arrField]) || !(fields[arrField] as unknown[]).every((v) => typeof v === 'string')) {
        return `${arrField} must be an array of strings`;
      }
    }
  }

  return null;
}

export function parsePositiveInt(value: string | undefined, paramName: string): { ok: true; value: number } | { ok: false; error: string } | undefined {
  if (value === undefined) return undefined;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed <= 0 || String(parsed) !== value) {
    return { ok: false, error: `${paramName} must be a positive integer` };
  }
  return { ok: true, value: parsed };
}

export function parseSignedInt(value: string | undefined, paramName: string): { ok: true; value: number } | { ok: false; error: string } | undefined {
  if (value === undefined) return undefined;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || String(parsed) !== value) {
    return { ok: false, error: `${paramName} must be an integer` };
  }
  return { ok: true, value: parsed };
}

export function validateRequiredStrings(body: unknown, fields: string[]): string | null {
  if (typeof body !== 'object' || body === null) return 'Request body must be a JSON object';
  const b = body as Record<string, unknown>;
  for (const field of fields) {
    if (typeof b[field] !== 'string' || (b[field] as string).trim() === '') {
      return `${field} is required`;
    }
  }
  return null;
}
