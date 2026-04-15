export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'LEGENDARY'
export type BookingStatus = 'BOOKED' | 'CANCELLED'

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
