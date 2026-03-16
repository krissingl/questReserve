import {
  CustomerService,
  SlotNotFoundError,
  SlotUnavailableError,
  BookingNotFoundError,
  BookingOwnershipError,
  BookingAlreadyCancelledError,
} from './customer.service';
import { BookingLocationRepository } from '../repositories/booking-location.repository';
import { TimeSlotRepository } from '../repositories/time-slot.repository';
import { BookingRepository } from '../repositories/booking.repository';
import { Booking, BookingLocation, TimeSlot } from '../types';

function makeLocation(overrides: Partial<BookingLocation> = {}): BookingLocation {
  return {
    id: 'loc-1',
    provider_id: 'prov-1',
    name: 'Test Location',
    description: null,
    difficulty: 'EASY',
    cancellation_policy: 'No refunds.',
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

function makeSlot(overrides: Partial<TimeSlot> = {}): TimeSlot {
  const start = new Date('2030-06-15T10:00:00Z');
  const end = new Date('2030-06-15T12:00:00Z');
  return {
    id: 'slot-1',
    booking_location_id: 'loc-1',
    start_time: start,
    end_time: end,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'booking-1',
    time_slot_id: 'slot-1',
    end_user_id: 'user-1',
    status: 'BOOKED',
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

function makeRepositories() {
  const locationRepo = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findAllByProvider: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<BookingLocationRepository>;

  const slotRepo = {
    findById: jest.fn(),
    findAll: jest.fn(),
    findAllByLocation: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<TimeSlotRepository>;

  const bookingRepo = {
    findById: jest.fn(),
    findAll: jest.fn(),
    findAllByEndUser: jest.fn(),
    findByTimeSlot: jest.fn(),
    findBookedByTimeSlots: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<BookingRepository>;

  return { locationRepo, slotRepo, bookingRepo };
}

describe('CustomerService', () => {
  let locationRepo: jest.Mocked<BookingLocationRepository>;
  let slotRepo: jest.Mocked<TimeSlotRepository>;
  let bookingRepo: jest.Mocked<BookingRepository>;
  let service: CustomerService;

  beforeEach(() => {
    const repos = makeRepositories();
    locationRepo = repos.locationRepo;
    slotRepo = repos.slotRepo;
    bookingRepo = repos.bookingRepo;
    service = new CustomerService(locationRepo, slotRepo, bookingRepo);
  });

  describe('browseLocations', () => {
    it('returns all locations when no difficulty filter is applied', async () => {
      const locations = [makeLocation({ difficulty: 'EASY' }), makeLocation({ id: 'loc-2', difficulty: 'HARD' })];
      locationRepo.findAll.mockResolvedValue(locations);

      const result = await service.browseLocations();

      expect(result).toEqual(locations);
    });

    it('returns a filtered subset when a difficulty value is provided', async () => {
      const easyLoc = makeLocation({ difficulty: 'EASY' });
      const hardLoc = makeLocation({ id: 'loc-2', difficulty: 'HARD' });
      locationRepo.findAll.mockResolvedValue([easyLoc, hardLoc]);

      const result = await service.browseLocations('EASY');

      expect(result).toEqual([easyLoc]);
    });
  });

  describe('getAvailableSlots', () => {
    it('returns only slots not present in booked bookings', async () => {
      const slot1 = makeSlot({ id: 'slot-1' });
      const slot2 = makeSlot({ id: 'slot-2' });
      slotRepo.findAllByLocation.mockResolvedValue([slot1, slot2]);
      bookingRepo.findBookedByTimeSlots.mockResolvedValue([makeBooking({ time_slot_id: 'slot-1' })]);

      const result = await service.getAvailableSlots('loc-1');

      expect(result).toEqual([slot2]);
    });

    it('applies a date filter correctly when one is provided', async () => {
      const day1Start = new Date(2030, 5, 15, 10, 0, 0); // June 15 local, 10am
      const day2Start = new Date(2030, 5, 16, 10, 0, 0); // June 16 local, 10am
      const slot1 = makeSlot({ id: 'slot-1', start_time: day1Start });
      const slot2 = makeSlot({ id: 'slot-2', start_time: day2Start });
      slotRepo.findAllByLocation.mockResolvedValue([slot1, slot2]);
      bookingRepo.findBookedByTimeSlots.mockResolvedValue([]);

      const result = await service.getAvailableSlots('loc-1', '2030-06-15T12:00:00');

      expect(result).toEqual([slot1]);
    });

    it('returns an empty array when no slots exist for the location', async () => {
      slotRepo.findAllByLocation.mockResolvedValue([]);

      const result = await service.getAvailableSlots('loc-1');

      expect(result).toEqual([]);
    });

    it('returns an empty array when the date string is invalid', async () => {
      slotRepo.findAllByLocation.mockResolvedValue([makeSlot()]);
      bookingRepo.findBookedByTimeSlots.mockResolvedValue([]);

      const result = await service.getAvailableSlots('loc-1', 'not-a-date');

      expect(result).toEqual([]);
    });
  });

  describe('createBooking', () => {
    it('happy path returns a new Booking', async () => {
      const slot = makeSlot();
      const booking = makeBooking();
      slotRepo.findById.mockResolvedValue(slot);
      bookingRepo.findByTimeSlot.mockResolvedValue(null);
      bookingRepo.create.mockResolvedValue(booking);

      const result = await service.createBooking('user-1', 'slot-1');

      expect(result).toEqual(booking);
      expect(bookingRepo.create).toHaveBeenCalledWith({
        time_slot_id: 'slot-1',
        end_user_id: 'user-1',
        status: 'BOOKED',
      });
    });

    it('throws SlotNotFoundError when the slot does not exist', async () => {
      slotRepo.findById.mockResolvedValue(null);

      await expect(service.createBooking('user-1', 'slot-missing')).rejects.toThrow(SlotNotFoundError);
    });

    it('throws SlotUnavailableError when a BOOKED booking already exists for the slot', async () => {
      slotRepo.findById.mockResolvedValue(makeSlot());
      bookingRepo.findByTimeSlot.mockResolvedValue(makeBooking());

      await expect(service.createBooking('user-1', 'slot-1')).rejects.toThrow(SlotUnavailableError);
    });
  });

  describe('getBookingHistory', () => {
    it('delegates to bookingRepo.findAllByEndUser and returns the results', async () => {
      const bookings = [makeBooking(), makeBooking({ id: 'booking-2' })];
      bookingRepo.findAllByEndUser.mockResolvedValue(bookings);

      const result = await service.getBookingHistory('user-1');

      expect(result).toEqual(bookings);
      expect(bookingRepo.findAllByEndUser).toHaveBeenCalledWith('user-1');
    });

    it('returns an empty array when the user has no bookings', async () => {
      bookingRepo.findAllByEndUser.mockResolvedValue([]);

      const result = await service.getBookingHistory('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('cancelBooking', () => {
    it('happy path returns the updated booking with status CANCELLED', async () => {
      const booking = makeBooking({ end_user_id: 'user-1', status: 'BOOKED' });
      const cancelled = makeBooking({ end_user_id: 'user-1', status: 'CANCELLED' });
      bookingRepo.findById.mockResolvedValue(booking);
      bookingRepo.update.mockResolvedValue(cancelled);

      const result = await service.cancelBooking('user-1', 'booking-1');

      expect(result.status).toBe('CANCELLED');
    });

    it('throws BookingNotFoundError when the booking does not exist', async () => {
      bookingRepo.findById.mockResolvedValue(null);

      await expect(service.cancelBooking('user-1', 'booking-missing')).rejects.toThrow(BookingNotFoundError);
    });

    it('throws BookingOwnershipError when end_user_id does not match the caller', async () => {
      bookingRepo.findById.mockResolvedValue(makeBooking({ end_user_id: 'user-other' }));

      await expect(service.cancelBooking('user-1', 'booking-1')).rejects.toThrow(BookingOwnershipError);
    });

    it('throws BookingAlreadyCancelledError when the booking is already CANCELLED', async () => {
      bookingRepo.findById.mockResolvedValue(makeBooking({ end_user_id: 'user-1', status: 'CANCELLED' }));

      await expect(service.cancelBooking('user-1', 'booking-1')).rejects.toThrow(BookingAlreadyCancelledError);
    });
  });
});
