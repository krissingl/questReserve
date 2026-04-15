import { apiClient } from './client'
import type { BookingLocation, Booking } from '@/types/domain'

export async function getBookingLocations(filters?: { difficulty?: string }): Promise<BookingLocation[]> {
  const params: Record<string, string> = {}
  if (filters?.difficulty) {
    params.difficulty = filters.difficulty
  }
  const response = await apiClient.get<BookingLocation[]>('/customer/locations', { params })
  return response.data
}

export async function getBookingLocationById(id: number): Promise<BookingLocation> {
  const response = await apiClient.get<BookingLocation>(`/customer/locations/${id}`)
  return response.data
}

export async function getMyBookings(): Promise<Booking[]> {
  const response = await apiClient.get<Booking[]>('/customer/bookings')
  return response.data
}
