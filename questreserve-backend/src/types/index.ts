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
  bio: string | null;
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
  bio: string | null;
  created_at: Date;
  updated_at: Date;
}

export type LandscapeType = 'tundra' | 'forest' | 'desert' | 'cave' | 'coastal' | 'volcanic' | 'urban' | 'plains' | 'mountain' | 'swamp';
export type LocationSetting = 'interior' | 'exterior';
export type ToneTag = 'horror' | 'heroic' | 'comedic' | 'mystery' | 'political';
export type PrimaryFocus = number;
export type LootType = 'guaranteed' | 'random' | 'none';
export type BookingType = 'concurrent' | 'exclusive';

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

  // Core specs
  party_size_min: number | null;
  party_size_max: number | null;
  level_range_min: number | null;
  level_range_max: number | null;

  // Environment
  landscape_type: LandscapeType | null;
  setting: LocationSetting | null;
  environment_tags: string[] | null;

  // Restrictions
  magic_restrictions: string[] | null;
  class_restrictions: string[] | null;
  race_restrictions: string[] | null;
  faction_restrictions: string[] | null;
  party_composition_tags: string[] | null;
  physical_access: string[] | null;
  mount_permitted: boolean;
  familiar_permitted: boolean;
  solo_permitted: boolean;
  booking_type: BookingType | null;

  // Tone & content
  tone_tags: ToneTag[] | null;
  gore_level: number | null;
  non_lethal_mode: boolean;
  permadeath_risk: boolean;
  primary_focus: PrimaryFocus | null;
  boss_encounter: boolean;
  pvp_permitted: boolean;
  scouting_permitted: boolean;

  // Run logistics
  run_time_minutes: number | null;
  reset_time_hours: number | null;
  time_limit_minutes: number | null;

  // Amenities & loot
  has_safe_room: boolean;
  has_merchant: boolean;
  equipment_provided: boolean;
  guide_provided: boolean;
  loot_type: LootType | null;
  boss_loot: boolean;
  unique_item_chance: boolean;
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
  end_user_profile_picture_url: string | null;
  status: BookingStatus;
  created_at: Date;
  updated_at: Date;
  start_time: Date;
  end_time: Date;
  booking_location_id: string;
  location_name: string;
}

export interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_type: 'provider' | 'customer';
  body: string;
  created_at: Date;
  read_at: Date | null;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewer_type: 'provider' | 'customer';
  reviewer_first_name?: string | null;
  reviewer_last_name?: string | null;
  target_id: string;
  target_type: 'provider' | 'customer' | 'location';
  booking_id: string;
  rating: number;
  body: string | null;
  created_at: Date;
}

export interface LocationFilters {
  difficulties?: Difficulty[];
  levelRangeMin?: number;
  levelRangeMax?: number;
  runTimeMax?: number;
  setting?: LocationSetting;
  landscapeType?: LandscapeType;
  toneTags?: ToneTag[];
  partySizeMin?: number;
  partySizeMax?: number;
  primaryFocusMin?: number;
  primaryFocusMax?: number;
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
