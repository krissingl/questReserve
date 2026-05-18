import { CustomerService, SlotNotFoundError, SlotUnavailableError, BookingNotFoundError, BookingOwnershipError, BookingAlreadyCancelledError } from './customer.service';
import { BookingLocationRepository } from '../repositories/booking-location.repository';
import { LocationImagesRepository } from '../repositories/location-images.repository';
import { TimeSlotRepository } from '../repositories/time-slot.repository';
import { BookingRepository } from '../repositories/booking.repository';
import {
  getTestKnex,
  runMigrations,
  rollbackMigrations,
  createTestProvider,
  createTestLocation,
  createTestSlot,
  createTestEndUser,
} from '../tests';
import { Knex } from 'knex';

let testKnex: Knex;

beforeAll(async () => {
  testKnex = getTestKnex();
  await runMigrations(testKnex);
});

afterAll(async () => {
  await rollbackMigrations(testKnex);
  await testKnex.destroy();
});

function makeService() {
  const locationRepo = new BookingLocationRepository(testKnex);
  const locationImagesRepo = new LocationImagesRepository(testKnex);
  const slotRepo = new TimeSlotRepository(testKnex);
  const bookingRepo = new BookingRepository(testKnex);
  return new CustomerService(locationRepo, locationImagesRepo, slotRepo, bookingRepo);
}

describe('CustomerService — integration', () => {
  describe('createBooking', () => {
    it('creates a booking and returns it with status BOOKED', async () => {
      const provider = await createTestProvider(testKnex);
      const location = await createTestLocation(testKnex, provider.id);
      const slot = await createTestSlot(testKnex, location.id);
      const endUser = await createTestEndUser(testKnex);
      const service = makeService();

      const booking = await service.createBooking(endUser.id, slot.id);

      expect(booking.status).toBe('BOOKED');
      expect(booking.time_slot_id).toBe(slot.id);
      expect(booking.end_user_id).toBe(endUser.id);
      expect(booking.id).toBeDefined();
    });

    it('throws SlotNotFoundError when the slot does not exist', async () => {
      const endUser = await createTestEndUser(testKnex);
      const service = makeService();

      await expect(service.createBooking(endUser.id, '00000000-0000-0000-0000-000000000000')).rejects.toThrow(
        SlotNotFoundError
      );
    });

    it('throws SlotUnavailableError when the slot is already booked', async () => {
      const provider = await createTestProvider(testKnex);
      const location = await createTestLocation(testKnex, provider.id);
      const slot = await createTestSlot(testKnex, location.id);
      const userA = await createTestEndUser(testKnex);
      const userB = await createTestEndUser(testKnex);
      const service = makeService();

      await service.createBooking(userA.id, slot.id);

      await expect(service.createBooking(userB.id, slot.id)).rejects.toThrow(SlotUnavailableError);
    });
  });

  describe('getBookingHistory', () => {
    it('returns only bookings belonging to the requesting end user', async () => {
      const provider = await createTestProvider(testKnex);
      const location = await createTestLocation(testKnex, provider.id);
      const slot1 = await createTestSlot(testKnex, location.id);
      const slot2 = await createTestSlot(testKnex, location.id);
      const userA = await createTestEndUser(testKnex);
      const userB = await createTestEndUser(testKnex);
      const service = makeService();

      await service.createBooking(userA.id, slot1.id);
      await service.createBooking(userB.id, slot2.id);

      const history = await service.getBookingHistory(userA.id);

      expect(history.every((b) => b.end_user_id === userA.id)).toBe(true);
      expect(history.some((b) => b.time_slot_id === slot1.id)).toBe(true);
    });
  });

  describe('cancelBooking', () => {
    it('cancels a booking and returns it with status CANCELLED', async () => {
      const provider = await createTestProvider(testKnex);
      const location = await createTestLocation(testKnex, provider.id);
      const slot = await createTestSlot(testKnex, location.id);
      const endUser = await createTestEndUser(testKnex);
      const service = makeService();

      const booking = await service.createBooking(endUser.id, slot.id);
      const cancelled = await service.cancelBooking(endUser.id, booking.id);

      expect(cancelled.status).toBe('CANCELLED');
      expect(cancelled.id).toBe(booking.id);
    });

    it('throws BookingNotFoundError when the booking does not exist', async () => {
      const endUser = await createTestEndUser(testKnex);
      const service = makeService();

      await expect(
        service.cancelBooking(endUser.id, '00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow(BookingNotFoundError);
    });

    it('throws BookingOwnershipError when the booking belongs to a different user', async () => {
      const provider = await createTestProvider(testKnex);
      const location = await createTestLocation(testKnex, provider.id);
      const slot = await createTestSlot(testKnex, location.id);
      const userA = await createTestEndUser(testKnex);
      const userB = await createTestEndUser(testKnex);
      const service = makeService();

      const booking = await service.createBooking(userA.id, slot.id);

      await expect(service.cancelBooking(userB.id, booking.id)).rejects.toThrow(BookingOwnershipError);
    });

    it('throws BookingAlreadyCancelledError when cancelling a booking that is already cancelled', async () => {
      const provider = await createTestProvider(testKnex);
      const location = await createTestLocation(testKnex, provider.id);
      const slot = await createTestSlot(testKnex, location.id);
      const endUser = await createTestEndUser(testKnex);
      const service = makeService();

      const booking = await service.createBooking(endUser.id, slot.id);
      await service.cancelBooking(endUser.id, booking.id);

      await expect(service.cancelBooking(endUser.id, booking.id)).rejects.toThrow(BookingAlreadyCancelledError);
    });

    it('allows the slot to be booked again after a cancellation', async () => {
      const provider = await createTestProvider(testKnex);
      const location = await createTestLocation(testKnex, provider.id);
      const slot = await createTestSlot(testKnex, location.id);
      const userA = await createTestEndUser(testKnex);
      const userB = await createTestEndUser(testKnex);
      const service = makeService();

      const booking = await service.createBooking(userA.id, slot.id);
      await service.cancelBooking(userA.id, booking.id);

      const newBooking = await service.createBooking(userB.id, slot.id);

      expect(newBooking.status).toBe('BOOKED');
      expect(newBooking.end_user_id).toBe(userB.id);
    });
  });

  describe('getAvailableSlots', () => {
    it('excludes slots that have an active BOOKED booking', async () => {
      const provider = await createTestProvider(testKnex);
      const location = await createTestLocation(testKnex, provider.id);
      const bookedSlot = await createTestSlot(testKnex, location.id);
      const freeSlot = await createTestSlot(testKnex, location.id);
      const endUser = await createTestEndUser(testKnex);
      const service = makeService();

      await service.createBooking(endUser.id, bookedSlot.id);

      const available = await service.getAvailableSlots(location.id);

      const availableIds = available.map((s) => s.id);
      expect(availableIds).not.toContain(bookedSlot.id);
      expect(availableIds).toContain(freeSlot.id);
    });

    it('includes a slot that was booked then cancelled', async () => {
      const provider = await createTestProvider(testKnex);
      const location = await createTestLocation(testKnex, provider.id);
      const slot = await createTestSlot(testKnex, location.id);
      const endUser = await createTestEndUser(testKnex);
      const service = makeService();

      const booking = await service.createBooking(endUser.id, slot.id);
      await service.cancelBooking(endUser.id, booking.id);

      const available = await service.getAvailableSlots(location.id);

      expect(available.some((s) => s.id === slot.id)).toBe(true);
    });
  });
});
