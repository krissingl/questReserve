import type { LocationFilters } from '@/types/domain'

export function filtersToParams(filters: LocationFilters): URLSearchParams {
  const next = new URLSearchParams()
  if (filters.difficulties && filters.difficulties.length > 0) next.set('difficulties', filters.difficulties.join(','))
  if (filters.levelRangeMin !== undefined) next.set('levelRangeMin', String(filters.levelRangeMin))
  if (filters.levelRangeMax !== undefined) next.set('levelRangeMax', String(filters.levelRangeMax))
  if (filters.runTimeMax !== undefined) next.set('runTimeMax', String(filters.runTimeMax))
  if (filters.setting) next.set('setting', filters.setting)
  if (filters.landscapeType) next.set('landscapeType', filters.landscapeType)
  if (filters.toneTags && filters.toneTags.length > 0) next.set('toneTags', filters.toneTags.join(','))
  if (filters.partySizeMin !== undefined) next.set('partySizeMin', String(filters.partySizeMin))
  if (filters.partySizeMax !== undefined) next.set('partySizeMax', String(filters.partySizeMax))
  return next
}
