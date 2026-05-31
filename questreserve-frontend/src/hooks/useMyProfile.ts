import { useState, useEffect } from 'react'
import { getMyProfile } from '@/api/provider.api'
import type { ProviderProfile } from '@/types/domain'

interface UseMyProfileResult {
  data: ProviderProfile | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useMyProfile(): UseMyProfileResult {
  const [data, setData] = useState<ProviderProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchCount, setFetchCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    getMyProfile()
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch profile')
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [fetchCount])

  function refetch() {
    setFetchCount((c) => c + 1)
  }

  return { data, isLoading, error, refetch }
}
