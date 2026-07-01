import { apiClient } from './client'

export type AdminRole = 'PLATFORM_ADMIN' | 'CLIENT_SUCCESS' | 'SUPERUSER'
export type ProviderStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING'
export type ProviderPlan = 'FREE' | 'STANDARD' | 'PREMIUM'
export type BookingStatus = 'BOOKED' | 'CANCELLED'

export interface AdminProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  role: AdminRole
  created_at: string
  updated_at: string
}

export interface AdminUserView {
  id: string
  first_name: string
  last_name: string
  email: string
  role: AdminRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UpdateAdminUserInput {
  role?: AdminRole
  is_active?: boolean
}

export interface AdminProvider {
  id: string
  first_name: string
  last_name: string
  email: string
  organization_name: string | null
  plan: ProviderPlan
  status: ProviderStatus
  profile_picture_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface AdminBookingView {
  id: string
  time_slot_id: string
  end_user_id: string
  status: BookingStatus
  created_at: string
  updated_at: string
  start_time: string
  end_time: string
  booking_location_id: string
  location_name: string
  provider_id: string
  provider_name: string
}

export interface RegisterAdminInput {
  first_name: string
  last_name: string
  email: string
  password: string
  role: AdminRole
}

export async function getAdminMe(): Promise<AdminProfile> {
  const response = await apiClient.get<AdminProfile>('/admin/me')
  return response.data
}

export async function listProviders(): Promise<AdminProvider[]> {
  const response = await apiClient.get<AdminProvider[]>('/admin/providers')
  return response.data
}

export async function getProvider(id: string): Promise<AdminProvider> {
  const response = await apiClient.get<AdminProvider>(`/admin/providers/${id}`)
  return response.data
}

export async function setProviderStatus(id: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<AdminProvider> {
  const response = await apiClient.patch<AdminProvider>(`/admin/providers/${id}/status`, { status })
  return response.data
}

export async function setProviderPlan(id: string, plan: ProviderPlan): Promise<AdminProvider> {
  const response = await apiClient.patch<AdminProvider>(`/admin/providers/${id}/plan`, { plan })
  return response.data
}

export async function getPlatformBookings(): Promise<AdminBookingView[]> {
  const response = await apiClient.get<AdminBookingView[]>('/admin/bookings')
  return response.data
}

export async function registerAdminUser(input: RegisterAdminInput): Promise<void> {
  await apiClient.post('/auth/admin/register', input)
}

export async function listAdminUsers(): Promise<AdminUserView[]> {
  const response = await apiClient.get<AdminUserView[]>('/admin/users')
  return response.data
}

export async function updateAdminUser(id: string, input: UpdateAdminUserInput): Promise<AdminUserView> {
  const response = await apiClient.patch<AdminUserView>(`/admin/users/${id}`, input)
  return response.data
}
