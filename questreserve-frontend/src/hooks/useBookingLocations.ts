import { useState, useEffect } from 'react'
import { getBookingLocations } from '@/api/customer.api'
import type { BookingLocation } from '@/types/domain'

interface UseBookingLocationsResult {
  data: BookingLocation[] | null
  isLoading: boolean
  error: Error | null
}

export function useBookingLocations(filters?: { difficulty?: string }): UseBookingLocationsResult {
  const [data, setData] = useState<BookingLocation[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const difficulty = filters?.difficulty

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    getBookingLocations(difficulty ? { difficulty } : undefined)
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
  }, [difficulty])

  return { data, isLoading, error }
}
