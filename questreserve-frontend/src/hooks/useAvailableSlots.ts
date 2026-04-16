import { useState, useEffect } from 'react'
import { getAvailableSlots } from '@/api/customer.api'
import type { TimeSlot } from '@/types/domain'

interface UseAvailableSlotsResult {
  data: TimeSlot[] | null
  isLoading: boolean
  error: Error | null
}

export function useAvailableSlots(locationId: string): UseAvailableSlotsResult {
  const [data, setData] = useState<TimeSlot[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!locationId) {
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    getAvailableSlots(locationId)
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch slots'))
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [locationId])

  return { data, isLoading, error }
}
