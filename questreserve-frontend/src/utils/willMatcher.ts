import type { Difficulty, LandscapeType, LocationFilters, LocationSetting, ToneTag } from '@/types/domain'

const LANDSCAPE_KEYWORDS: Array<[RegExp, LandscapeType]> = [
  [/\b(cave|underground|cavern|dungeon)\b/, 'cave'],
  [/\b(forest|woods|jungle|woodland)\b/, 'forest'],
  [/\b(desert|sand|arid|dune)\b/, 'desert'],
  [/\b(mountain|alpine|peak|highland|summit)\b/, 'mountain'],
  [/\b(swamp|marsh|bog|fen|mire)\b/, 'swamp'],
  [/\b(coastal|ocean|sea|beach|shore|maritime)\b/, 'coastal'],
  [/\b(volcanic|lava|magma|caldera)\b/, 'volcanic'],
  [/\b(tundra|arctic|frozen|icy|glacier|permafrost)\b/, 'tundra'],
  [/\b(urban|city|town|metropolis|district|alley|street)\b/, 'urban'],
  [/\b(plains|grassland|meadow|field|steppe|savanna)\b/, 'plains'],
]

const TONE_KEYWORDS: Array<[RegExp, ToneTag]> = [
  [/\b(spooky|scary|eerie|creepy|haunted|horror|horrific|terrifying|dread|dark|sinister|macabre)\b/, 'horror'],
  [/\b(heroic|glorious|valiant|noble quest|brave|chivalric)\b/, 'heroic'],
  [/\b(epic|legendary)\b(?!\s+(difficulty|challenge|tier|mode))/, 'heroic'],
  [/\b(funny|comedic|silly|lighthearted|whimsical|humorous|comic|jovial)\b/, 'comedic'],
  [/\b(mystery|mysterious|investigative|detective|whodunit|enigmatic|puzzling|riddle)\b/, 'mystery'],
  [/\b(political|intrigue|court|noble(s)?|diplomacy|faction|power play|scheming)\b/, 'political'],
]

const DIFFICULTY_KEYWORDS: Array<[RegExp, Difficulty]> = [
  [/\b(easy|beginner|simple|starter|novice|newbie|casual|relaxed)\b/, 'EASY'],
  [/\b(medium|moderate|average|balanced|middling)\b/, 'MEDIUM'],
  [/\b(hard|difficult|challenging|tough|demanding)\b/, 'HARD'],
  [/\b(deadly|lethal|extreme|brutal|punishing|merciless|legendary (difficulty|challenge|tier|mode)|death trap|lethal)\b/, 'LEGENDARY'],
]

const SETTING_KEYWORDS: Array<[RegExp, LocationSetting]> = [
  [/\b(indoor|inside|interior|enclosed|indoors|underground)\b/, 'interior'],
  [/\b(outdoor|outside|exterior|open[\s-]air|outdoors|open world)\b/, 'exterior'],
]

function extractPartySize(input: string): Pick<LocationFilters, 'partySizeMin' | 'partySizeMax'> {
  const result: Pick<LocationFilters, 'partySizeMin' | 'partySizeMax'> = {}

  if (/\bsolo\b/.test(input)) {
    result.partySizeMin = 1
    result.partySizeMax = 1
    return result
  }

  const rangeMatch = input.match(/\b(\d+)\s*(?:to|-)\s*(\d+)\s*(?:players?|people|adventurers?|heroes?)?\b/)
  if (rangeMatch) {
    const a = parseInt(rangeMatch[1], 10)
    const b = parseInt(rangeMatch[2], 10)
    result.partySizeMin = Math.min(a, b)
    result.partySizeMax = Math.max(a, b)
    return result
  }

  const partyOfMatch = input.match(/\b(?:party|group)\s+of\s+(\d+)\b/)
  if (partyOfMatch) {
    const n = parseInt(partyOfMatch[1], 10)
    result.partySizeMin = n
    result.partySizeMax = n
    return result
  }

  const exactPlayersMatch = input.match(/\b(\d+)\s+(?:players?|people|adventurers?|heroes?)\b/)
  if (exactPlayersMatch) {
    const n = parseInt(exactPlayersMatch[1], 10)
    result.partySizeMin = n
    result.partySizeMax = n
    return result
  }

  return result
}

function extractLevelRange(input: string): Pick<LocationFilters, 'levelRangeMin' | 'levelRangeMax'> {
  const result: Pick<LocationFilters, 'levelRangeMin' | 'levelRangeMax'> = {}

  const rangeMatch = input.match(/\b(?:level|lvl)\s+(\d+)\s*(?:to|-)\s*(\d+)\b/)
  if (rangeMatch) {
    const a = parseInt(rangeMatch[1], 10)
    const b = parseInt(rangeMatch[2], 10)
    result.levelRangeMin = Math.min(a, b)
    result.levelRangeMax = Math.max(a, b)
    return result
  }

  const singleMatch = input.match(/\b(?:level|lvl)\s+(\d+)\b/)
  if (singleMatch) {
    result.levelRangeMin = parseInt(singleMatch[1], 10)
    return result
  }

  if (/\b(veteran|experienced|high[\s-]level|endgame|end[\s-]game)\b/.test(input)) {
    result.levelRangeMin = 10
    return result
  }

  if (/\b(novice|beginner|new player|low[\s-]level)\b/.test(input)) {
    result.levelRangeMin = 1
    result.levelRangeMax = 5
    return result
  }

  return result
}

function extractRunTime(input: string): Pick<LocationFilters, 'runTimeMax'> {
  if (/\b(quick|short|1[\s-]hour|one[\s-]hour|1 hr)\b/.test(input)) {
    return { runTimeMax: 60 }
  }
  if (/\b(half[\s-]?day|3[\s-]4\s*hours?|3 to 4\s*hours?|afternoon)\b/.test(input)) {
    return { runTimeMax: 240 }
  }
  if (/\b(full[\s-]?day|long|6\+?\s*hours?|all day|marathon)\b/.test(input)) {
    return { runTimeMax: 480 }
  }

  const hourMatch = input.match(/\b(\d+)\s*(?:hour|hr)s?\b/)
  if (hourMatch) {
    const hours = parseInt(hourMatch[1], 10)
    return { runTimeMax: hours * 60 }
  }

  return {}
}

export function matchFilters(input: string): Partial<LocationFilters> {
  const lower = input.toLowerCase()
  const filters: Partial<LocationFilters> = {}

  for (const [pattern, landscape] of LANDSCAPE_KEYWORDS) {
    if (pattern.test(lower)) {
      filters.landscapeType = landscape
      break
    }
  }

  const toneTags: ToneTag[] = []
  for (const [pattern, tone] of TONE_KEYWORDS) {
    if (pattern.test(lower) && !toneTags.includes(tone)) {
      toneTags.push(tone)
    }
  }
  if (toneTags.length > 0) filters.toneTags = toneTags

  const difficulties: Difficulty[] = []
  for (const [pattern, diff] of DIFFICULTY_KEYWORDS) {
    if (pattern.test(lower) && !difficulties.includes(diff)) {
      difficulties.push(diff)
    }
  }
  if (difficulties.length > 0) filters.difficulties = difficulties

  for (const [pattern, setting] of SETTING_KEYWORDS) {
    if (pattern.test(lower)) {
      filters.setting = setting
      break
    }
  }

  Object.assign(filters, extractPartySize(lower))
  Object.assign(filters, extractLevelRange(lower))
  Object.assign(filters, extractRunTime(lower))

  return filters
}
