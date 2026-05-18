import { useState, useEffect } from 'react'
import { getLocationImages } from '@/api/customer.api'
import type { LocationImage } from '@/types/domain'

interface UseLocationImagesResult {
  data: LocationImage[] | null
  isLoading: boolean
  error: Error | null
}

export function useLocationImages(locationId: string): UseLocationImagesResult {
  const [data, setData] = useState<LocationImage[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!locationId) {
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    getLocationImages(locationId)
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch images'))
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [locationId])

  return { data, isLoading, error }
}
