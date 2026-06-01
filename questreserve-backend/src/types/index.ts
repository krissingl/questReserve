export type AdminRole = 'PLATFORM_ADMIN' | 'CLIENT_SUCCESS' | 'SUPERUSER';
export type ProviderPlan = 'FREE' | 'STANDARD' | 'PREMIUM';
export type ProviderStatus = 'ACTIVE' | 'SUSPENDED';
export type EndUserRole = 'REGULAR' | 'PREMIERE' | 'CORPORATE' | 'RESTRICTED';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'LEGENDARY';
export type BookingStatus = 'BOOKED' | 'CANCELLED';

export interface AdminUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  role: AdminRole;
  created_at: Date;
  updated_at: Date;
}

export interface Provider {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  organization_name: string | null;
  plan: ProviderPlan;
  status: ProviderStatus;
  profile_picture_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface EndUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  role: EndUserRole;
  profile_picture_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface BookingLocation {
  id: string;
  provider_id: string;
  name: string;
  description: string | null;
  difficulty: Difficulty;
  cancellation_policy: string;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface LocationImage {
  id: string;
  booking_location_id: string;
  image_url: string;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface TimeSlot {
  id: string;
  booking_location_id: string;
  start_time: Date;
  end_time: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Booking {
  id: string;
  time_slot_id: string;
  end_user_id: string;
  status: BookingStatus;
  created_at: Date;
  updated_at: Date;
}

export interface TimeSlotWithBooking extends TimeSlot {
  booking_id: string | null;
  booking_status: BookingStatus | null;
}

export interface BookingLocationWithSlotCount extends BookingLocation {
  slot_count: number;
}

export interface ProviderDashboardStats {
  total_adventures: number;
  open_slots: number;
  upcoming_bookings: number;
}

export interface ProviderBookingView {
  id: string;
  time_slot_id: string;
  end_user_id: string;
  end_user_name: string | null;
  end_user_first_name: string | null;
  end_user_last_name: string | null;
  status: BookingStatus;
  created_at: Date;
  updated_at: Date;
  start_time: Date;
  end_time: Date;
  booking_location_id: string;
  location_name: string;
}

export interface AdminBookingView {
  id: string;
  time_slot_id: string;
  end_user_id: string;
  status: BookingStatus;
  created_at: Date;
  updated_at: Date;
  start_time: Date;
  end_time: Date;
  booking_location_id: string;
  location_name: string;
  provider_id: string;
  provider_name: string;
}
