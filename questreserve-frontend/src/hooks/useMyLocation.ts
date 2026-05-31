import { useState, useEffect } from 'react'
import { getMyLocationById } from '@/api/provider.api'
import type { BookingLocation } from '@/types/domain'

interface UseMyLocationResult {
  data: BookingLocation | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useMyLocation(id: string): UseMyLocationResult {
  const [data, setData] = useState<BookingLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchCount, setFetchCount] = useState(0)

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
  }, [id, fetchCount])

  function refetch() {
    setFetchCount((c) => c + 1)
  }

  return { data, isLoading, error, refetch }
}
