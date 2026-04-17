import { BookingLocationRepository } from '../repositories/booking-location.repository';
import { TimeSlotRepository } from '../repositories/time-slot.repository';
import { BookingRepository } from '../repositories/booking.repository';
import { Booking, BookingLocation, Difficulty, TimeSlot } from '../types';

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

export class CustomerService {
  constructor(
    private readonly locationRepo: BookingLocationRepository,
    private readonly slotRepo: TimeSlotRepository,
    private readonly bookingRepo: BookingRepository
  ) {}

  async browseLocations(difficulty?: Difficulty): Promise<BookingLocation[]> {
    const all = await this.locationRepo.findAll();
    if (difficulty) {
      return all.filter((loc) => loc.difficulty === difficulty);
    }
    return all;
  }

  async getLocation(locationId: string): Promise<BookingLocation | null> {
    return this.locationRepo.findById(locationId);
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
}
