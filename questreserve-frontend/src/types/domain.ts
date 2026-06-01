export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'LEGENDARY'

export const DIFFICULTY_OPTIONS = ['EASY', 'MEDIUM', 'HARD', 'LEGENDARY'] as const satisfies ReadonlyArray<Difficulty>

export interface LocationFilters {
  difficulty?: Difficulty
}

export type BookingStatus = 'BOOKED' | 'CANCELLED'

export interface TimeSlot {
  id: string
  booking_location_id: string
  start_time: string
  end_time: string
  created_at: string
  updated_at: string
}

export interface TimeSlotWithBooking extends TimeSlot {
  booking_id: string | null
  booking_status: BookingStatus | null
}

export interface BookingLocation {
  id: string
  provider_id: string
  name: string
  description: string | null
  difficulty: Difficulty
  cancellation_policy: string
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface BookingLocationWithSlotCount extends BookingLocation {
  slot_count: number
}

export interface ProviderDashboardStats {
  total_adventures: number
  open_slots: number
  upcoming_bookings: number
}

export interface LocationImage {
  id: string
  booking_location_id: string
  image_url: string
  display_order: number
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  time_slot_id: string
  end_user_id: string
  status: BookingStatus
  created_at: string
  updated_at: string
  location_name: string
  booking_location_id: string
  slot_start_time: string
  slot_end_time: string
}

export type ProviderPlan = 'FREE' | 'STANDARD' | 'PREMIUM'
export type ProviderStatus = 'ACTIVE' | 'SUSPENDED'

export interface ProviderProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  organization_name: string | null
  plan: ProviderPlan
  status: ProviderStatus
}

export interface ProviderBooking {
  id: string
  time_slot_id: string
  end_user_id: string
  end_user_name: string | null
  end_user_first_name: string | null
  end_user_last_name: string | null
  status: BookingStatus
  created_at: string
  updated_at: string
  start_time: string
  end_time: string
  booking_location_id: string
  location_name: string
}
