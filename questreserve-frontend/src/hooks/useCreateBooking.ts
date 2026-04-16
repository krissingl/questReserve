import { useState } from 'react'
import { createBooking as createBookingApi } from '@/api/customer.api'
import type { Booking } from '@/types/domain'

interface UseCreateBookingResult {
  createBooking: (timeSlotId: string) => Promise<Booking>
  isLoading: boolean
  error: Error | null
}

export function useCreateBooking(): UseCreateBookingResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createBooking = async (timeSlotId: string): Promise<Booking> => {
    setIsLoading(true)
    setError(null)
    try {
      const booking = await createBookingApi(timeSlotId)
      return booking
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create booking')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { createBooking, isLoading, error }
}
