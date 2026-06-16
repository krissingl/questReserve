import { apiClient } from './client'
import type { BookingLocation, LocationImage, Booking, TimeSlot, LocationFilters } from '@/types/domain'

export interface CustomerProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  profile_picture_url: string | null
  bio: string | null
}

export async function getMyCustomerProfile(): Promise<CustomerProfile> {
  const response = await apiClient.get<CustomerProfile>('/customer/profile')
  return response.data
}

export interface UpdateCustomerProfilePayload {
  first_name?: string
  last_name?: string
  bio?: string | null
}

export async function updateMyCustomerProfile(payload: UpdateCustomerProfilePayload): Promise<CustomerProfile> {
  const response = await apiClient.patch<CustomerProfile>('/customer/profile', payload)
  return response.data
}

export async function uploadCustomerProfilePicture(file: File): Promise<CustomerProfile> {
  const formData = new FormData()
  formData.append('image', file)
  const response = await apiClient.post<CustomerProfile>(
    '/customer/profile/picture',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return response.data
}

export async function getBookingLocations(filters?: LocationFilters): Promise<BookingLocation[]> {
  const params: Record<string, string | number> = {}
  if (filters?.difficulty) params.difficulty = filters.difficulty
  if (filters?.levelRangeMin !== undefined) params.levelRangeMin = filters.levelRangeMin
  if (filters?.levelRangeMax !== undefined) params.levelRangeMax = filters.levelRangeMax
  if (filters?.runTimeMax !== undefined) params.runTimeMax = filters.runTimeMax
  if (filters?.setting) params.setting = filters.setting
  if (filters?.landscapeType) params.landscapeType = filters.landscapeType
  if (filters?.toneTag) params.toneTag = filters.toneTag
  if (filters?.partySizeMin !== undefined) params.partySizeMin = filters.partySizeMin
  if (filters?.partySizeMax !== undefined) params.partySizeMax = filters.partySizeMax
  const response = await apiClient.get<BookingLocation[]>('/customer/locations', { params })
  return response.data
}

export async function getBookingLocationById(id: string): Promise<BookingLocation> {
  const response = await apiClient.get<BookingLocation>(`/customer/locations/${id}`)
  return response.data
}

export async function createBooking(timeSlotId: string): Promise<void> {
  await apiClient.post('/customer/bookings', { time_slot_id: timeSlotId })
}

export async function getLocationImages(locationId: string): Promise<LocationImage[]> {
  const response = await apiClient.get<LocationImage[]>(`/customer/locations/${locationId}/images`)
  return response.data
}

export async function getAvailableSlots(locationId: string): Promise<TimeSlot[]> {
  const response = await apiClient.get<TimeSlot[]>(`/customer/locations/${locationId}/slots`)
  return response.data
}

export async function cancelBooking(bookingId: string): Promise<void> {
  await apiClient.delete(`/customer/bookings/${bookingId}`)
}

export async function getMyBookings(): Promise<Booking[]> {
  const response = await apiClient.get<Booking[]>('/customer/bookings')
  return response.data
}

