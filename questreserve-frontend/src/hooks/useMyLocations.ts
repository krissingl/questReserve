import { useState, useEffect } from 'react'
import { getMyLocations } from '@/api/provider.api'
import type { BookingLocation } from '@/types/domain'

interface UseMyLocationsResult {
  data: BookingLocation[]
  isLoading: boolean
  error: string | null
}

export function useMyLocations(): UseMyLocationsResult {
  const [data, setData] = useState<BookingLocation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    getMyLocations()
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch locations')
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { data, isLoading, error }
}
