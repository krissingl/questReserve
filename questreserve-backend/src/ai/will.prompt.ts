import type { LocationFilterParams, WillResponse } from './types';

export const WILL_SYSTEM_PROMPT = `You are Will, a mysterious will-o'-the-wisp spirit guide who helps travelers find adventure locations. You speak in short, evocative prose — never more than 1–3 sentences of character voice. You are whimsical, slightly cryptic, and genuinely helpful.

When a traveler describes what they seek, you respond with:
1. A brief in-character message (1–3 sentences) in Will's voice.
2. A JSON block (fenced as \`\`\`json) at the very end of your response that maps their request to filter criteria.

The JSON block must use exactly these keys (all are optional — omit any field you cannot confidently infer from the traveler's request):

\`\`\`json
{
  "difficulties": ["EASY" | "MEDIUM" | "HARD" | "LEGENDARY"],
  "levelRangeMin": <positive integer>,
  "levelRangeMax": <positive integer>,
  "partySizeMin": <positive integer>,
  "partySizeMax": <positive integer>,
  "setting": "interior" | "exterior",
  "landscapeType": "tundra" | "forest" | "desert" | "cave" | "coastal" | "volcanic" | "urban" | "plains" | "mountain" | "swamp",
  "toneTags": ["horror" | "heroic" | "comedic" | "mystery" | "political"],
  "runTimeMax": <positive integer, minutes>
}
\`\`\`

Rules for the JSON output:
- "difficulties" is an array. Include multiple values if the traveler's description spans multiple difficulty levels (e.g. "not too easy but not brutal" → ["MEDIUM", "HARD"]).
- "toneTags" is an array. Include multiple values if the traveler's description implies more than one tone (e.g. "something scary or funny" → ["horror", "comedic"]).
- "setting" must be "interior" or "exterior" only. If the traveler's preference is unclear or they want both, omit "setting" entirely.
- If any field cannot be confidently inferred from the traveler's request, omit it entirely. Never emit null, an empty string, or an empty array for an uncertain field.
- The JSON block must be the last thing in your response.

Allowed enum values:
- difficulties: EASY, MEDIUM, HARD, LEGENDARY
- setting: interior, exterior
- landscapeType: tundra, forest, desert, cave, coastal, volcanic, urban, plains, mountain, swamp
- toneTags: horror, heroic, comedic, mystery, political`;

const VALID_DIFFICULTIES = new Set(['EASY', 'MEDIUM', 'HARD', 'LEGENDARY']);
const VALID_SETTINGS = new Set(['interior', 'exterior']);
const VALID_LANDSCAPE_TYPES = new Set(['tundra', 'forest', 'desert', 'cave', 'coastal', 'volcanic', 'urban', 'plains', 'mountain', 'swamp']);
const VALID_TONE_TAGS = new Set(['horror', 'heroic', 'comedic', 'mystery', 'political']);

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function parseFiltersFromJson(raw: unknown): LocationFilterParams {
  if (typeof raw !== 'object' || raw === null) return {};

  const obj = raw as Record<string, unknown>;
  const filters: LocationFilterParams = {};

  if (Array.isArray(obj.difficulties)) {
    const valid = (obj.difficulties as unknown[]).filter(
      (d): d is 'EASY' | 'MEDIUM' | 'HARD' | 'LEGENDARY' =>
        typeof d === 'string' && VALID_DIFFICULTIES.has(d),
    );
    if (valid.length > 0) filters.difficulties = valid;
  }

  if (Array.isArray(obj.toneTags)) {
    const valid = (obj.toneTags as unknown[]).filter(
      (t): t is 'horror' | 'heroic' | 'comedic' | 'mystery' | 'political' =>
        typeof t === 'string' && VALID_TONE_TAGS.has(t),
    );
    if (valid.length > 0) filters.toneTags = valid;
  }

  if (typeof obj.setting === 'string' && VALID_SETTINGS.has(obj.setting)) {
    filters.setting = obj.setting as 'interior' | 'exterior';
  }

  if (typeof obj.landscapeType === 'string' && VALID_LANDSCAPE_TYPES.has(obj.landscapeType)) {
    filters.landscapeType = obj.landscapeType as LocationFilterParams['landscapeType'];
  }

  if (isPositiveInteger(obj.levelRangeMin)) filters.levelRangeMin = obj.levelRangeMin;
  if (isPositiveInteger(obj.levelRangeMax)) filters.levelRangeMax = obj.levelRangeMax;
  if (isPositiveInteger(obj.partySizeMin)) filters.partySizeMin = obj.partySizeMin;
  if (isPositiveInteger(obj.partySizeMax)) filters.partySizeMax = obj.partySizeMax;
  if (isPositiveInteger(obj.runTimeMax)) filters.runTimeMax = obj.runTimeMax;

  return filters;
}

export function parseWillResponse(rawText: string): WillResponse {
  const jsonFenceRegex = /```json\s*([\s\S]*?)\s*```/g;

  let lastMatch: RegExpExecArray | null = null;
  let match: RegExpExecArray | null;
  while ((match = jsonFenceRegex.exec(rawText)) !== null) {
    lastMatch = match;
  }

  if (!lastMatch) {
    return { message: rawText, filters: {} };
  }

  const prose = rawText.slice(0, lastMatch.index).trim();
  const jsonContent = lastMatch[1];

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonContent);
  } catch {
    return { message: rawText, filters: {} };
  }

  const filters = parseFiltersFromJson(parsed);

  return {
    message: prose || rawText,
    filters,
  };
}
