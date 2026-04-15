import { useState, useEffect } from 'react'
import { getBookingLocationById } from '@/api/customer.api'
import type { BookingLocation } from '@/types/domain'

interface UseBookingLocationResult {
  data: BookingLocation | null
  isLoading: boolean
  error: Error | null
}

export function useBookingLocation(id: string): UseBookingLocationResult {
  const [data, setData] = useState<BookingLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    getBookingLocationById(id)
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch location'))
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return { data, isLoading, error }
}
