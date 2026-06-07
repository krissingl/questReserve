import { useState, useEffect } from 'react'
import { getInbox } from '@/api/messages.api'
import type { InboxEntry } from '@/api/messages.api'

interface UseInboxResult {
  data: InboxEntry[]
  isLoading: boolean
  error: string | null
}

export function useInbox(deps: unknown[] = [], skip = false): UseInboxResult {
  const [data, setData] = useState<InboxEntry[]>([])
  const [isLoading, setIsLoading] = useState(!skip)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (skip) return
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, ...deps])

  return { data, isLoading, error }
}
