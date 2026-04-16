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
  const [fetchState, setFetchState] = useState<{
    isLoading: boolean
    error: Error | null
  }>({ isLoading: !!locationId, error: null })

  useEffect(() => {
    if (!locationId) return

    let cancelled = false

    getAvailableSlots(locationId)
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setFetchState({ isLoading: false, error: null })
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setFetchState({
            isLoading: false,
            error: err instanceof Error ? err : new Error('Failed to fetch slots'),
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [locationId])

  return { data, isLoading: fetchState.isLoading, error: fetchState.error }
}
