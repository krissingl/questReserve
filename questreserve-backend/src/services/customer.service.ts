import { BookingLocationRepository, LocationFilters } from '../repositories/booking-location.repository';
import { LocationImagesRepository } from '../repositories/location-images.repository';
import { TimeSlotRepository } from '../repositories/time-slot.repository';
import { BookingRepository } from '../repositories/booking.repository';
import { Booking, BookingLocation, Difficulty, LocationImage, TimeSlot } from '../types';

export class CustomerNotFoundError extends Error {
  constructor() {
    super('Customer not found');
    this.name = 'CustomerNotFoundError';
  }
}

export interface CustomerProfileView {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture_url: string | null;
  bio: string | null;
}

export interface UpdateCustomerProfileInput {
  first_name?: string;
  last_name?: string;
  bio?: string | null;
}

export class SlotNotFoundError extends Error {
  constructor() {
    super('Time slot not found');
    this.name = 'SlotNotFoundError';
  }
}

export class SlotUnavailableError extends Error {
  constructor() {
    super('Time slot is not available');
    this.name = 'SlotUnavailableError';
  }
}

export class BookingNotFoundError extends Error {
  constructor() {
    super('Booking not found');
    this.name = 'BookingNotFoundError';
  }
}

export class BookingOwnershipError extends Error {
  constructor() {
    super('Booking does not belong to this user');
    this.name = 'BookingOwnershipError';
  }
}

export class BookingAlreadyCancelledError extends Error {
  constructor() {
    super('Booking has already been cancelled');
    this.name = 'BookingAlreadyCancelledError';
  }
}

export class LocationNotFoundError extends Error {
  constructor() {
    super('Booking location not found');
    this.name = 'LocationNotFoundError';
  }
}

export class CustomerService {
  constructor(
    private readonly locationRepo: BookingLocationRepository,
    private readonly locationImagesRepo: LocationImagesRepository,
    private readonly slotRepo: TimeSlotRepository,
    private readonly bookingRepo: BookingRepository
  ) {}

  async browseLocations(filters: LocationFilters = {}): Promise<BookingLocation[]> {
    return this.locationRepo.findAll(filters);
  }

  async getLocation(locationId: string): Promise<BookingLocation | null> {
    return this.locationRepo.findById(locationId);
  }

  async getLocationWithProvider(locationId: string): Promise<(BookingLocation & { provider_first_name: string; provider_last_name: string; provider_profile_picture_url: string | null }) | null> {
    return this.locationRepo.findByIdWithProvider(locationId);
  }

  async getLocationImages(locationId: string): Promise<LocationImage[]> {
    const location = await this.locationRepo.findById(locationId);
    if (!location) throw new LocationNotFoundError();
    return this.locationImagesRepo.findByLocation(locationId);
  }

  async getAvailableSlots(locationId: string, date?: string): Promise<TimeSlot[]> {
    const slots = await this.slotRepo.findAllByLocation(locationId);
    if (slots.length === 0) return [];

    const slotIds = slots.map((s) => s.id);
    const bookedBookings = await this.bookingRepo.findBookedByTimeSlots(slotIds);
    const bookedSlotIds = new Set(bookedBookings.map((b) => b.time_slot_id));

    const available = slots.filter((slot) => !bookedSlotIds.has(slot.id));

    if (date) {
      const filterDate = new Date(date);
      if (isNaN(filterDate.getTime())) return [];
      return available.filter((slot) => {
        const slotDate = new Date(slot.start_time);
        return (
          slotDate.getFullYear() === filterDate.getFullYear() &&
          slotDate.getMonth() === filterDate.getMonth() &&
          slotDate.getDate() === filterDate.getDate()
        );
      });
    }

    return available;
  }

  async createBooking(endUserId: string, timeSlotId: string): Promise<Booking> {
    const slot = await this.slotRepo.findById(timeSlotId);
    if (!slot) throw new SlotNotFoundError();

    const existing = await this.bookingRepo.findByTimeSlot(timeSlotId);
    if (existing) throw new SlotUnavailableError();

    return this.bookingRepo.create({
      time_slot_id: timeSlotId,
      end_user_id: endUserId,
      status: 'BOOKED',
    });
  }

  async getBookingHistory(endUserId: string): Promise<Booking[]> {
    return this.bookingRepo.findAllByEndUser(endUserId);
  }

  async cancelBooking(endUserId: string, bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) throw new BookingNotFoundError();
    if (booking.end_user_id !== endUserId) throw new BookingOwnershipError();
    if (booking.status === 'CANCELLED') throw new BookingAlreadyCancelledError();

    const updated = await this.bookingRepo.update(bookingId, { status: 'CANCELLED' });
    if (!updated) throw new BookingNotFoundError();
    return updated;
  }

  async getProfile(customerId: string): Promise<CustomerProfileView | null> {
    const customer = await this.bookingRepo.findCustomerById(customerId);
    if (!customer) return null;
    return {
      id: customer.id,
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      profile_picture_url: customer.profile_picture_url ?? null,
      bio: customer.bio ?? null,
    };
  }

  async updateProfile(customerId: string, input: UpdateCustomerProfileInput): Promise<CustomerProfileView | null> {
    const updates: Partial<Pick<import('../types').EndUser, 'first_name' | 'last_name' | 'bio'>> = {};
    if (input.first_name !== undefined) updates.first_name = input.first_name;
    if (input.last_name !== undefined) updates.last_name = input.last_name;
    if ('bio' in input) updates.bio = input.bio ?? null;
    const customer = await this.bookingRepo.updateCustomer(customerId, updates);
    if (!customer) return null;
    return {
      id: customer.id,
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      profile_picture_url: customer.profile_picture_url ?? null,
      bio: customer.bio ?? null,
    };
  }

  async setProfilePicture(customerId: string, url: string): Promise<CustomerProfileView | null> {
    const customer = await this.bookingRepo.updateCustomer(customerId, { profile_picture_url: url });
    if (!customer) return null;
    return {
      id: customer.id,
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      profile_picture_url: customer.profile_picture_url ?? null,
      bio: customer.bio ?? null,
    };
  }
}
