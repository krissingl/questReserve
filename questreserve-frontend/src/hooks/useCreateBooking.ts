import { useState } from 'react'
import { createBooking as createBookingApi } from '@/api/customer.api'

interface UseCreateBookingResult {
  createBooking: (timeSlotId: string) => Promise<void>
  isLoading: boolean
}

export function useCreateBooking(): UseCreateBookingResult {
  const [isLoading, setIsLoading] = useState(false)

  const createBooking = async (timeSlotId: string): Promise<void> => {
    setIsLoading(true)
    try {
      await createBookingApi(timeSlotId)
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create booking')
    } finally {
      setIsLoading(false)
    }
  }

  return { createBooking, isLoading }
}
