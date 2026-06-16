import { apiClient } from './client'
import type { BookingLocation, BookingLocationWithSlotCount, BookingType, Difficulty, LocationImage, LandscapeType, LocationSetting, LootType, PrimaryFocus, TimeSlot, TimeSlotWithBooking, ToneTag, ProviderBooking, ProviderProfile, ProviderDashboardStats } from '@/types/domain'

interface LocationRulesetPayload {
  party_size_min?: number | null
  party_size_max?: number | null
  level_range_min?: number | null
  level_range_max?: number | null
  landscape_type?: LandscapeType | null
  setting?: LocationSetting | null
  environment_tags?: string[] | null
  magic_restrictions?: string[] | null
  class_restrictions?: string[] | null
  race_restrictions?: string[] | null
  faction_restrictions?: string[] | null
  party_composition_tags?: string[] | null
  physical_access?: string[] | null
  mount_permitted?: boolean
  familiar_permitted?: boolean
  solo_permitted?: boolean
  booking_type?: BookingType | null
  tone_tags?: ToneTag[] | null
  gore_level?: number | null
  non_lethal_mode?: boolean
  permadeath_risk?: boolean
  primary_focus?: PrimaryFocus | null
  boss_encounter?: boolean
  pvp_permitted?: boolean
  scouting_permitted?: boolean
  run_time_minutes?: number | null
  reset_time_hours?: number | null
  time_limit_minutes?: number | null
  has_safe_room?: boolean
  has_merchant?: boolean
  equipment_provided?: boolean
  guide_provided?: boolean
  loot_type?: LootType | null
  boss_loot?: boolean
  unique_item_chance?: boolean
}

export interface CreateLocationPayload extends LocationRulesetPayload {
  name: string
  description?: string
  difficulty: Difficulty
  cancellation_policy: string
}

export interface UpdateLocationPayload extends LocationRulesetPayload {
  name?: string
  description?: string
  difficulty?: Difficulty
  cancellation_policy?: string
}

export interface CreateSlotPayload {
  start_time: string
  end_time: string
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


export async function getSlotsByLocation(locationId: string): Promise<TimeSlotWithBooking[]> {
  const response = await apiClient.get<TimeSlotWithBooking[]>(`/provider/locations/${locationId}/slots`)
  return response.data
}

export async function createSlot(locationId: string, payload: CreateSlotPayload): Promise<TimeSlot> {
  const response = await apiClient.post<TimeSlot>(`/provider/locations/${locationId}/slots`, payload)
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
  first_name?: string
  last_name?: string
  organization_name?: string
  bio?: string | null
}

export async function updateMyProfile(payload: UpdateProfilePayload): Promise<ProviderProfile> {
  const response = await apiClient.patch<ProviderProfile>('/provider/profile', payload)
  return response.data
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await apiClient.patch('/auth/provider/password', payload)
}

export async function uploadProviderProfilePicture(file: File): Promise<ProviderProfile> {
  const formData = new FormData()
  formData.append('image', file)
  const response = await apiClient.post<ProviderProfile>(
    '/provider/profile/picture',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return response.data
}

export interface CustomerBookingSummary {
  id: string
  location_name: string
  start_time: string
  end_time: string
  status: 'BOOKED' | 'CANCELLED'
}

export interface ProviderCustomerProfile {
  id: string
  first_name: string
  last_name: string
  profile_picture_url: string | null
  bio: string | null
  bookings: CustomerBookingSummary[]
}

export async function getProviderCustomer(customerId: string): Promise<ProviderCustomerProfile> {
  const response = await apiClient.get<ProviderCustomerProfile>(`/provider/customers/${customerId}`)
  return response.data
}


