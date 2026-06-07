import bcrypt from 'bcryptjs';
import { Knex } from 'knex';
import { BookingLocationRepository } from '../repositories/booking-location.repository';
import { BookingRepository } from '../repositories/booking.repository';
import { LocationImagesRepository } from '../repositories/location-images.repository';
import { ProviderRepository } from '../repositories/provider.repository';
import { TimeSlotRepository } from '../repositories/time-slot.repository';
import { BookingLocation, BookingLocationWithSlotCount, BookingStatus, Difficulty, LocationImage, Provider, ProviderBookingView, ProviderDashboardStats, ProviderPlan, ProviderStatus, TimeSlot, TimeSlotWithBooking } from '../types';

export class LocationNotFoundError extends Error {
  constructor() {
    super('Booking location not found');
    this.name = 'LocationNotFoundError';
  }
}

export class LocationOwnershipError extends Error {
  constructor() {
    super('Booking location does not belong to this provider');
    this.name = 'LocationOwnershipError';
  }
}

export class SlotNotFoundError extends Error {
  constructor() {
    super('Time slot not found');
    this.name = 'SlotNotFoundError';
  }
}

export class ImageNotFoundError extends Error {
  constructor() {
    super('Location image not found');
    this.name = 'ImageNotFoundError';
  }
}

export class EmailConflictError extends Error {
  constructor() {
    super('An account with this email already exists');
    this.name = 'EmailConflictError';
  }
}

export interface CreateLocationInput {
  name: string;
  description?: string;
  difficulty: Difficulty;
  cancellation_policy: string;
}

export interface UpdateLocationInput {
  name?: string;
  description?: string;
  difficulty?: Difficulty;
  cancellation_policy?: string;
}

export interface CreateSlotInput {
  start_time: Date;
  end_time: Date;
}

export interface ProviderProfileView {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  organization_name: string | null;
  plan: ProviderPlan;
  status: ProviderStatus;
  profile_picture_url: string | null;
  bio: string | null;
}

export interface UpdateProfileInput {
  email?: string;
  first_name?: string;
  last_name?: string;
  organization_name?: string | null;
  bio?: string | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

interface CustomerBookingSummary {
  id: string;
  location_name: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
}

interface CustomerProfileView {
  id: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string | null;
  bio: string | null;
  bookings: CustomerBookingSummary[];
}

export class CustomerNotFoundError extends Error {
  constructor() {
    super('Customer not found');
    this.name = 'CustomerNotFoundError';
  }
}

export class IncorrectPasswordError extends Error {
  constructor() {
    super('Current password is incorrect');
    this.name = 'IncorrectPasswordError';
  }
}

export class ProviderNotFoundError extends Error {
  constructor() {
    super('Provider not found');
    this.name = 'ProviderNotFoundError';
  }
}

export class ProviderService {
  constructor(
    private readonly locationRepo: BookingLocationRepository,
    private readonly locationImagesRepo: LocationImagesRepository,
    private readonly slotRepo: TimeSlotRepository,
    private readonly knex: Knex,
    private readonly bookingRepo: BookingRepository,
    private readonly providerRepo?: ProviderRepository
  ) {}

  async createLocation(providerId: string, data: CreateLocationInput): Promise<BookingLocation> {
    return this.locationRepo.create({
      provider_id: providerId,
      name: data.name,
      description: data.description ?? null,
      difficulty: data.difficulty,
      cancellation_policy: data.cancellation_policy,
      image_url: null,
    });
  }

  async getLocations(providerId: string): Promise<BookingLocationWithSlotCount[]> {
    const locations = await this.locationRepo.findAllByProvider(providerId);
    if (locations.length === 0) return [];
    const locationIds = locations.map((l) => l.id);
    const slotCounts = await this.knex('time_slot')
      .whereIn('booking_location_id', locationIds)
      .select('booking_location_id')
      .count('id as count')
      .groupBy('booking_location_id') as { booking_location_id: string; count: string | number }[];
    const countMap = new Map(slotCounts.map((r) => [r.booking_location_id, Number(r.count)]));
    return locations.map((l) => ({ ...l, slot_count: countMap.get(l.id) ?? 0 }));
  }

  async getDashboardStats(providerId: string): Promise<ProviderDashboardStats> {
    const now = new Date();
    const [adventuresResult, openSlotsResult, upcomingResult] = await Promise.all([
      this.knex('booking_location').where({ provider_id: providerId }).count('id as count').first() as Promise<{ count: string | number }>,
      this.knex('time_slot')
        .join('booking_location', 'time_slot.booking_location_id', 'booking_location.id')
        .where({ 'booking_location.provider_id': providerId })
        .whereNotIn('time_slot.id', (qb) => {
          qb.select('time_slot_id').from('booking').where({ status: 'BOOKED' });
        })
        .count('time_slot.id as count')
        .first() as Promise<{ count: string | number }>,
      this.knex('booking')
        .join('time_slot', 'booking.time_slot_id', 'time_slot.id')
        .join('booking_location', 'time_slot.booking_location_id', 'booking_location.id')
        .where({ 'booking_location.provider_id': providerId, 'booking.status': 'BOOKED' })
        .where('time_slot.start_time', '>', now)
        .count('booking.id as count')
        .first() as Promise<{ count: string | number }>,
    ]);
    return {
      total_adventures: Number(adventuresResult?.count ?? 0),
      open_slots: Number(openSlotsResult?.count ?? 0),
      upcoming_bookings: Number(upcomingResult?.count ?? 0),
    };
  }

  async getLocation(providerId: string, locationId: string): Promise<BookingLocation> {
    return this.assertLocationOwnership(providerId, locationId);
  }

  async updateLocation(
    providerId: string,
    locationId: string,
    data: UpdateLocationInput
  ): Promise<BookingLocation> {
    await this.assertLocationOwnership(providerId, locationId);
    const updated = await this.locationRepo.update(locationId, data);
    if (!updated) throw new LocationNotFoundError();
    return updated;
  }

  async createSlot(
    providerId: string,
    locationId: string,
    data: CreateSlotInput
  ): Promise<TimeSlot> {
    await this.assertLocationOwnership(providerId, locationId);
    return this.slotRepo.create({
      booking_location_id: locationId,
      start_time: data.start_time,
      end_time: data.end_time,
    });
  }

  async getSlots(providerId: string, locationId: string): Promise<TimeSlotWithBooking[]> {
    await this.assertLocationOwnership(providerId, locationId);
    const knex = this.knex;
    const rows = await knex('time_slot')
      .leftJoin('booking', function () {
        this.on('booking.time_slot_id', '=', 'time_slot.id')
            .andOn('booking.status', '=', knex.raw("'BOOKED'"));
      })
      .where({ 'time_slot.booking_location_id': locationId })
      .select(
        'time_slot.*',
        'booking.id as booking_id',
        'booking.status as booking_status',
      );
    return rows as TimeSlotWithBooking[];
  }

  async deleteSlot(providerId: string, slotId: string): Promise<void> {
    await this.assertSlotOwnership(providerId, slotId);
    await this.slotRepo.delete(slotId);
  }

  async setLocationImage(
    providerId: string,
    locationId: string,
    url: string
  ): Promise<BookingLocation> {
    await this.assertLocationOwnership(providerId, locationId);
    const updated = await this.locationRepo.updateImageUrl(locationId, url);
    if (!updated) throw new LocationNotFoundError();
    return updated;
  }

  async addLocationImage(
    providerId: string,
    locationId: string,
    imageUrl: string
  ): Promise<LocationImage> {
    await this.assertLocationOwnership(providerId, locationId);
    const displayOrder = await this.locationImagesRepo.nextDisplayOrder(locationId);
    return this.locationImagesRepo.create({
      booking_location_id: locationId,
      image_url: imageUrl,
      display_order: displayOrder,
    });
  }

  async getLocationImages(providerId: string, locationId: string): Promise<LocationImage[]> {
    await this.assertLocationOwnership(providerId, locationId);
    return this.locationImagesRepo.findByLocation(locationId);
  }

  async deleteLocationImage(
    providerId: string,
    locationId: string,
    imageId: string
  ): Promise<void> {
    await this.assertLocationOwnership(providerId, locationId);
    const deleted = await this.locationImagesRepo.deleteByLocationAndId(locationId, imageId);
    if (!deleted) throw new ImageNotFoundError();
  }

  async getBookings(providerId: string): Promise<ProviderBookingView[]> {
    const rows = await this.knex('booking')
      .join('time_slot', 'booking.time_slot_id', 'time_slot.id')
      .join('booking_location', 'time_slot.booking_location_id', 'booking_location.id')
      .leftJoin('end_user', 'booking.end_user_id', 'end_user.id')
      .where('booking_location.provider_id', providerId)
      .select(
        'booking.id',
        'booking.time_slot_id',
        'booking.end_user_id',
        this.knex.raw("NULLIF(TRIM(CONCAT(COALESCE(end_user.first_name, ''), ' ', COALESCE(end_user.last_name, ''))), '') as end_user_name"),
        'end_user.first_name as end_user_first_name',
        'end_user.last_name as end_user_last_name',
        'end_user.profile_picture_url as end_user_profile_picture_url',
        'booking.status',
        'booking.created_at',
        'booking.updated_at',
        'time_slot.start_time',
        'time_slot.end_time',
        'time_slot.booking_location_id',
        'booking_location.name as location_name'
      );
    return rows as ProviderBookingView[];
  }

  async getProfile(providerId: string): Promise<ProviderProfileView | null> {
    const provider = await this.knex<Provider>('provider').where({ id: providerId }).first();
    if (!provider) return null;
    const { id, first_name, last_name, email, organization_name, plan, status, profile_picture_url, bio } = provider;
    return { id, first_name, last_name, email, organization_name, plan, status, profile_picture_url: profile_picture_url ?? null, bio: bio ?? null };
  }

  async updateProfile(providerId: string, input: UpdateProfileInput): Promise<ProviderProfileView | null> {
    const updates: Partial<Pick<Provider, 'email' | 'first_name' | 'last_name' | 'organization_name' | 'bio'>> = {};

    if (input.email !== undefined) {
      const existing = await this.knex<Provider>('provider').where({ email: input.email }).whereNot({ id: providerId }).first();
      if (existing) throw new EmailConflictError();
      updates.email = input.email;
    }
    if (input.first_name !== undefined) updates.first_name = input.first_name;
    if (input.last_name !== undefined) updates.last_name = input.last_name;
    if ('organization_name' in input) updates.organization_name = input.organization_name ?? null;
    if ('bio' in input) updates.bio = input.bio ?? null;

    const [updated] = await this.knex<Provider>('provider')
      .where({ id: providerId })
      .update({ ...updates, updated_at: new Date() })
      .returning(['id', 'first_name', 'last_name', 'email', 'organization_name', 'plan', 'status', 'profile_picture_url', 'bio']);
    return updated ?? null;
  }

  async setProfilePicture(providerId: string, url: string): Promise<ProviderProfileView | null> {
    const [updated] = await this.knex<Provider>('provider')
      .where({ id: providerId })
      .update({ profile_picture_url: url, updated_at: new Date() })
      .returning(['id', 'first_name', 'last_name', 'email', 'organization_name', 'plan', 'status', 'profile_picture_url', 'bio']);
    return updated ?? null;
  }

  async getPublicProfile(providerId: string): Promise<{
    id: string;
    first_name: string;
    last_name: string;
    organization_name: string | null;
    profile_picture_url: string | null;
    bio: string | null;
    locations: Array<{ id: string; name: string; description: string | null; difficulty: string; image_url: string | null }>;
  } | null> {
    if (!this.providerRepo) throw new Error('ProviderRepository not injected');
    return this.providerRepo.findPublicProfile(providerId);
  }

  async changePassword(providerId: string, input: ChangePasswordInput): Promise<void> {
    const provider = await this.knex<Provider>('provider').where({ id: providerId }).first();
    if (!provider) throw new ProviderNotFoundError();
    const match = await bcrypt.compare(input.currentPassword, provider.password_hash);
    if (!match) throw new IncorrectPasswordError();
    const newHash = await bcrypt.hash(input.newPassword, 10);
    await this.knex<Provider>('provider')
      .where({ id: providerId })
      .update({ password_hash: newHash, updated_at: new Date() });
  }

  async getCustomerProfile(providerId: string, customerId: string): Promise<CustomerProfileView> {
    const bookings = await this.bookingRepo.findByCustomerAndProvider(customerId, providerId);

    if (bookings.length === 0) throw new CustomerNotFoundError();

    const customer = await this.bookingRepo.findCustomerById(customerId);
    if (!customer) throw new CustomerNotFoundError();

    return {
      id: customer.id,
      first_name: customer.first_name,
      last_name: customer.last_name,
      profile_picture_url: customer.profile_picture_url ?? null,
      bio: customer.bio ?? null,
      bookings: bookings.map((b) => ({
        id: b.id,
        location_name: b.location_name,
        start_time: b.start_time instanceof Date ? b.start_time.toISOString() : String(b.start_time),
        end_time: b.end_time instanceof Date ? b.end_time.toISOString() : String(b.end_time),
        status: b.status as BookingStatus,
      })),
    };
  }

  private async assertLocationOwnership(
    providerId: string,
    locationId: string
  ): Promise<BookingLocation> {
    const location = await this.locationRepo.findById(locationId);
    if (!location) throw new LocationNotFoundError();
    if (location.provider_id !== providerId) throw new LocationOwnershipError();
    return location;
  }

  private async assertSlotOwnership(providerId: string, slotId: string): Promise<TimeSlot> {
    const slot = await this.slotRepo.findById(slotId);
    if (!slot) throw new SlotNotFoundError();
    await this.assertLocationOwnership(providerId, slot.booking_location_id);
    return slot;
  }
}
