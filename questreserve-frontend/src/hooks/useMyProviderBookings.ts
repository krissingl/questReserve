import { useState, useEffect } from 'react'
import { getMyBookings } from '@/api/provider.api'
import type { ProviderBooking } from '@/types/domain'

interface UseMyProviderBookingsResult {
  data: ProviderBooking[]
  isLoading: boolean
  error: string | null
}

export function useMyProviderBookings(): UseMyProviderBookingsResult {
  const [data, setData] = useState<ProviderBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    getMyBookings()
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch bookings')
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { data, isLoading, error }
}
