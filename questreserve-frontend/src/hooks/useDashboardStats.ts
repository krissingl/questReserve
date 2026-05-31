import { useState, useEffect } from 'react'
import { getDashboardStats } from '@/api/provider.api'
import type { ProviderDashboardStats } from '@/types/domain'

interface UseDashboardStatsResult {
  data: ProviderDashboardStats | null
  isLoading: boolean
  error: string | null
}

export function useDashboardStats(): UseDashboardStatsResult {
  const [data, setData] = useState<ProviderDashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    getDashboardStats()
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch stats')
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { data, isLoading, error }
}
