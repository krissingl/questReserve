import type { Difficulty, LandscapeType, LocationSetting, ToneTag } from './domain'

export interface WillLocationFilters {
  difficulties?: Difficulty[]
  levelRangeMin?: number
  levelRangeMax?: number
  partySizeMin?: number
  partySizeMax?: number
  setting?: LocationSetting
  landscapeType?: LandscapeType
  toneTags?: ToneTag[]
  runTimeMax?: number
}

export interface WillApiResponse {
  message: string
  filters: WillLocationFilters
}
