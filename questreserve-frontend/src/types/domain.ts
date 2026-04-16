export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'LEGENDARY'
export type BookingStatus = 'BOOKED' | 'CANCELLED'

export interface TimeSlot {
  id: string
  booking_location_id: string
  start_time: string
  end_time: string
  created_at: string
  updated_at: string
}

export interface BookingLocation {
  id: string
  provider_id: string
  name: string
  description: string | null
  difficulty: Difficulty
  cancellation_policy: string
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
}

export interface EnrichedBooking extends Booking {
  location_name: string
  booking_location_id: string
  slot_start_time: string
  slot_end_time: string
}
