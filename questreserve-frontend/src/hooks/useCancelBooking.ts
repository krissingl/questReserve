import { useState } from 'react'
import { cancelBooking as cancelBookingApi } from '@/api/customer.api'

interface UseCancelBookingResult {
  cancelBooking: (bookingId: string) => Promise<void>
  isLoading: boolean
}

export function useCancelBooking(): UseCancelBookingResult {
  const [isLoading, setIsLoading] = useState(false)

  const cancelBooking = async (bookingId: string): Promise<void> => {
    setIsLoading(true)
    try {
      await cancelBookingApi(bookingId)
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to cancel booking')
    } finally {
      setIsLoading(false)
    }
  }

  return { cancelBooking, isLoading }
}
