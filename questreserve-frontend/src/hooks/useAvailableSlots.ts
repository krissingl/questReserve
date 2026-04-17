import { useState, useEffect, useCallback } from 'react'
import { getAvailableSlots } from '@/api/customer.api'
import type { TimeSlot } from '@/types/domain'

interface UseAvailableSlotsResult {
  data: TimeSlot[] | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useAvailableSlots(locationId: string): UseAvailableSlotsResult {
  const [data, setData] = useState<TimeSlot[] | null>(null)
  const [fetchState, setFetchState] = useState<{
    isLoading: boolean
    error: Error | null
  }>({ isLoading: !!locationId, error: null })
  const [fetchCount, setFetchCount] = useState(0)

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
  }, [locationId, fetchCount])

  const refetch = useCallback(() => {
    setFetchState((prev) => ({ ...prev, isLoading: true }))
    setFetchCount((c) => c + 1)
  }, [])

  return { data, isLoading: fetchState.isLoading, error: fetchState.error, refetch }
}
