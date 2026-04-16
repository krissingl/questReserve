import { useState } from 'react'
import { cancelBooking as cancelBookingApi } from '@/api/customer.api'

interface UseCancelBookingResult {
  cancelBooking: (bookingId: string) => Promise<void>
  isLoading: boolean
  error: Error | null
}

export function useCancelBooking(): UseCancelBookingResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const cancelBooking = async (bookingId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await cancelBookingApi(bookingId)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to cancel booking')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { cancelBooking, isLoading, error }
}
