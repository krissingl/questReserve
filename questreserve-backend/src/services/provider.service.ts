import { Knex } from 'knex';
import { BookingLocationRepository } from '../repositories/booking-location.repository';
import { TimeSlotRepository } from '../repositories/time-slot.repository';
import { BookingLocation, Difficulty, ProviderBookingView, TimeSlot } from '../types';

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

export interface UpdateSlotInput {
  start_time?: Date;
  end_time?: Date;
}

export class ProviderService {
  constructor(
    private readonly locationRepo: BookingLocationRepository,
    private readonly slotRepo: TimeSlotRepository,
    private readonly knex: Knex
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

  async getLocations(providerId: string): Promise<BookingLocation[]> {
    return this.locationRepo.findAllByProvider(providerId);
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

  async getSlots(providerId: string, locationId: string): Promise<TimeSlot[]> {
    await this.assertLocationOwnership(providerId, locationId);
    return this.slotRepo.findAllByLocation(locationId);
  }

  async updateSlot(
    providerId: string,
    slotId: string,
    data: UpdateSlotInput
  ): Promise<TimeSlot> {
    await this.assertSlotOwnership(providerId, slotId);
    const updated = await this.slotRepo.update(slotId, data);
    if (!updated) throw new SlotNotFoundError();
    return updated;
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

  async getBookings(providerId: string): Promise<ProviderBookingView[]> {
    const rows = await this.knex('booking')
      .join('time_slot', 'booking.time_slot_id', 'time_slot.id')
      .join('booking_location', 'time_slot.booking_location_id', 'booking_location.id')
      .where('booking_location.provider_id', providerId)
      .select(
        'booking.id',
        'booking.time_slot_id',
        'booking.end_user_id',
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
