import { useState, useEffect } from 'react'
import { getInbox } from '@/api/provider.api'
import type { InboxEntry } from '@/api/provider.api'

interface UseInboxResult {
  data: InboxEntry[]
  isLoading: boolean
  error: string | null
}

export function useInbox(): UseInboxResult {
  const [data, setData] = useState<InboxEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    getInbox()
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch inbox')
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { data, isLoading, error }
}
