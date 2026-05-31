import { useState, useEffect } from 'react'
import { getProviderLocationImages } from '@/api/provider.api'
import type { LocationImage } from '@/types/domain'

interface UseProviderLocationImagesResult {
  data: LocationImage[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useProviderLocationImages(locationId: string): UseProviderLocationImagesResult {
  const [data, setData] = useState<LocationImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchCount, setFetchCount] = useState(0)

  useEffect(() => {
    if (!locationId) {
      setIsLoading(false)
      return
    }
    let cancelled = false
    setIsLoading(true)
    setError(null)

    getProviderLocationImages(locationId)
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch gallery images')
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [locationId, fetchCount])

  function refetch() {
    setFetchCount((c) => c + 1)
  }

  return { data, isLoading, error, refetch }
}
