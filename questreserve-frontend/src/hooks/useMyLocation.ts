import { useState, useEffect } from 'react'
import { getMyLocationById } from '@/api/provider.api'
import type { BookingLocation } from '@/types/domain'

interface UseMyLocationResult {
  data: BookingLocation | null
  isLoading: boolean
  error: string | null
}

export function useMyLocation(id: string): UseMyLocationResult {
  const [data, setData] = useState<BookingLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    getMyLocationById(id)
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch location')
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return { data, isLoading, error }
}
