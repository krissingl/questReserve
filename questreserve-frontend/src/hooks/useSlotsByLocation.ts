import { useState, useEffect } from 'react'
import { getSlotsByLocation } from '@/api/provider.api'
import type { TimeSlotWithBooking } from '@/types/domain'

interface UseSlotsByLocationResult {
  data: TimeSlotWithBooking[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useSlotsByLocation(locationId: string): UseSlotsByLocationResult {
  const [data, setData] = useState<TimeSlotWithBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchCount, setFetchCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    getSlotsByLocation(locationId)
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch time slots')
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [locationId, fetchCount])

  function refetch() {
    setFetchCount((c) => c + 1)
  }

  return { data, isLoading, error, refetch }
}
