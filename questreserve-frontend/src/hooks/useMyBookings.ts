import { useState, useEffect } from 'react'
import { getMyBookings } from '@/api/customer.api'
import type { Booking } from '@/types/domain'

interface UseMyBookingsResult {
  data: Booking[] | null
  isLoading: boolean
  error: Error | null
}

export function useMyBookings(): UseMyBookingsResult {
  const [data, setData] = useState<Booking[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

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
  }, [])

  return { data, isLoading, error }
}
