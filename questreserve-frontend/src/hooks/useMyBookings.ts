import { useState, useEffect, useCallback } from 'react'
import { getMyBookings } from '@/api/customer.api'
import type { Booking } from '@/types/domain'

interface UseMyBookingsResult {
  data: Booking[] | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useMyBookings(): UseMyBookingsResult {
  const [data, setData] = useState<Booking[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [fetchCount, setFetchCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    getMyBookings()
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setError(null)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch bookings'))
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [fetchCount])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setFetchCount((c) => c + 1)
  }, [])

  return { data, isLoading, error, refetch }
}
