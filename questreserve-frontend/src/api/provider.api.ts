import { apiClient } from './client'
import type { BookingLocation, BookingLocationWithSlotCount, LocationImage, TimeSlot, TimeSlotWithBooking, ProviderBooking, ProviderProfile, ProviderDashboardStats, Difficulty } from '@/types/domain'

export interface CreateLocationPayload {
  name: string
  description?: string
  difficulty: Difficulty
  cancellation_policy: string
}

export interface UpdateLocationPayload {
  name?: string
  description?: string
  difficulty?: Difficulty
  cancellation_policy?: string
}

export interface CreateSlotPayload {
  start_time: string
  end_time: string
}

export interface UpdateSlotPayload {
  start_time?: string
  end_time?: string
}

export async function getMyLocations(): Promise<BookingLocationWithSlotCount[]> {
  const response = await apiClient.get<BookingLocationWithSlotCount[]>('/provider/locations')
  return response.data
}

export async function getDashboardStats(): Promise<ProviderDashboardStats> {
  const response = await apiClient.get<ProviderDashboardStats>('/provider/dashboard/stats')
  return response.data
}

export async function getMyLocationById(id: string): Promise<BookingLocation> {
  const response = await apiClient.get<BookingLocation>(`/provider/locations/${id}`)
  return response.data
}

export async function createLocation(payload: CreateLocationPayload): Promise<BookingLocation> {
  const response = await apiClient.post<BookingLocation>('/provider/locations', payload)
  return response.data
}

export async function updateLocation(id: string, payload: UpdateLocationPayload): Promise<BookingLocation> {
  const response = await apiClient.patch<BookingLocation>(`/provider/locations/${id}`, payload)
  return response.data
}

export async function uploadLocationImage(id: string, file: File): Promise<{ image_url: string }> {
  const formData = new FormData()
  formData.append('image', file)
  const response = await apiClient.post<{ image_url: string }>(
    `/provider/locations/${id}/image`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return response.data
}

export async function getSlotsByLocation(locationId: string): Promise<TimeSlotWithBooking[]> {
  const response = await apiClient.get<TimeSlotWithBooking[]>(`/provider/locations/${locationId}/slots`)
  return response.data
}

export async function createSlot(locationId: string, payload: CreateSlotPayload): Promise<TimeSlot> {
  const response = await apiClient.post<TimeSlot>(`/provider/locations/${locationId}/slots`, payload)
  return response.data
}

export async function updateSlot(slotId: string, payload: UpdateSlotPayload): Promise<TimeSlot> {
  const response = await apiClient.patch<TimeSlot>(`/provider/slots/${slotId}`, payload)
  return response.data
}

export async function deleteSlot(slotId: string): Promise<void> {
  await apiClient.delete(`/provider/slots/${slotId}`)
}

export async function getProviderLocationImages(locationId: string): Promise<LocationImage[]> {
  const response = await apiClient.get<LocationImage[]>(`/provider/locations/${locationId}/images`)
  return response.data
}

export async function addProviderLocationImage(locationId: string, file: File): Promise<LocationImage> {
  const formData = new FormData()
  formData.append('image', file)
  const response = await apiClient.post<LocationImage>(
    `/provider/locations/${locationId}/images`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return response.data
}

export async function deleteProviderLocationImage(locationId: string, imageId: string): Promise<void> {
  await apiClient.delete(`/provider/locations/${locationId}/images/${imageId}`)
}

export async function getMyBookings(): Promise<ProviderBooking[]> {
  const response = await apiClient.get<ProviderBooking[]>('/provider/bookings')
  return response.data
}

export async function getMyProfile(): Promise<ProviderProfile> {
  const response = await apiClient.get<ProviderProfile>('/provider/profile')
  return response.data
}

export interface UpdateProfilePayload {
  email?: string
  password?: string
}

export async function updateMyProfile(payload: UpdateProfilePayload): Promise<ProviderProfile> {
  const response = await apiClient.patch<ProviderProfile>('/provider/profile', payload)
  return response.data
}
