import { useState, useEffect } from 'react'
import { getBookingLocations } from '@/api/customer.api'
import type { BookingLocation, LocationFilters } from '@/types/domain'

interface UseBookingLocationsResult {
  data: BookingLocation[] | null
  isLoading: boolean
  error: Error | null
}

export function useBookingLocations(filters?: LocationFilters): UseBookingLocationsResult {
  const [data, setData] = useState<BookingLocation[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const difficulty = filters?.difficulty
  const levelRangeMin = filters?.levelRangeMin
  const levelRangeMax = filters?.levelRangeMax
  const runTimeMax = filters?.runTimeMax
  const setting = filters?.setting
  const landscapeType = filters?.landscapeType
  const toneTag = filters?.toneTag
  const partySizeMin = filters?.partySizeMin
  const partySizeMax = filters?.partySizeMax

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    getBookingLocations({
      difficulty,
      levelRangeMin,
      levelRangeMax,
      runTimeMax,
      setting,
      landscapeType,
      toneTag,
      partySizeMin,
      partySizeMax,
    })
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch locations'))
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [difficulty, levelRangeMin, levelRangeMax, runTimeMax, setting, landscapeType, toneTag, partySizeMin, partySizeMax])

  return { data, isLoading, error }
}
