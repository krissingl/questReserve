import { apiClient } from './client'
import type { BookingLocation, EnrichedBooking } from '@/types/domain'

export async function getBookingLocations(filters?: { difficulty?: string }): Promise<BookingLocation[]> {
  const params: Record<string, string> = {}
  if (filters?.difficulty) {
    params.difficulty = filters.difficulty
  }
  const response = await apiClient.get<BookingLocation[]>('/customer/locations', { params })
  return response.data
}

export async function getBookingLocationById(id: string): Promise<BookingLocation> {
  const response = await apiClient.get<BookingLocation>(`/customer/locations/${id}`)
  return response.data
}

export async function getMyBookings(): Promise<EnrichedBooking[]> {
  const response = await apiClient.get<EnrichedBooking[]>('/customer/bookings')
  return response.data
}
