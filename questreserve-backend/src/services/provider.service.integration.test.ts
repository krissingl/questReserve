import {
  ProviderService,
  LocationNotFoundError,
  LocationOwnershipError,
} from './provider.service';
import { BookingLocationRepository } from '../repositories/booking-location.repository';
import { BookingRepository } from '../repositories/booking.repository';
import { LocationImagesRepository } from '../repositories/location-images.repository';
import { TimeSlotRepository } from '../repositories/time-slot.repository';
import {
  getTestKnex,
  runMigrations,
  rollbackMigrations,
  createTestProvider,
  createTestLocation,
  createTestSlot,
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
  return new ProviderService(locationRepo, locationImagesRepo, slotRepo, testKnex, bookingRepo);
}

describe('ProviderService — integration', () => {
  describe('createLocation', () => {
    it('creates and persists a location for the given provider', async () => {
      const provider = await createTestProvider(testKnex);
      const service = makeService();

      const location = await service.createLocation(provider.id, {
        name: 'Cave Adventure',
        difficulty: 'HARD',
        cancellation_policy: 'Non-refundable.',
      });

      expect(location.id).toBeDefined();
      expect(location.provider_id).toBe(provider.id);
      expect(location.name).toBe('Cave Adventure');
      expect(location.difficulty).toBe('HARD');
    });
  });

  describe('getLocation', () => {
    it('returns the location when the provider owns it', async () => {
      const provider = await createTestProvider(testKnex);
      const location = await createTestLocation(testKnex, provider.id);
      const service = makeService();

      const result = await service.getLocation(provider.id, location.id);

      expect(result.id).toBe(location.id);
    });

    it('throws LocationNotFoundError when the location does not exist', async () => {
      const provider = await createTestProvider(testKnex);
      const service = makeService();

      await expect(
        service.getLocation(provider.id, '00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow(LocationNotFoundError);
    });

    it('throws LocationOwnershipError when the location belongs to a different provider', async () => {
      const ownerProvider = await createTestProvider(testKnex);
      const otherProvider = await createTestProvider(testKnex);
      const location = await createTestLocation(testKnex, ownerProvider.id);
      const service = makeService();

      await expect(
        service.getLocation(otherProvider.id, location.id)
      ).rejects.toThrow(LocationOwnershipError);
    });
  });

  describe('updateLocation', () => {
    it('updates a location and returns the new state', async () => {
      const provider = await createTestProvider(testKnex);
      const location = await createTestLocation(testKnex, provider.id, { name: 'Old Name' });
      const service = makeService();

      const updated = await service.updateLocation(provider.id, location.id, { name: 'New Name' });

      expect(updated.name).toBe('New Name');
      expect(updated.id).toBe(location.id);
    });

    it('throws LocationOwnershipError when a different provider tries to update', async () => {
      const ownerProvider = await createTestProvider(testKnex);
      const intruder = await createTestProvider(testKnex);
      const location = await createTestLocation(testKnex, ownerProvider.id);
      const service = makeService();

      await expect(
        service.updateLocation(intruder.id, location.id, { name: 'Hacked' })
      ).rejects.toThrow(LocationOwnershipError);
    });
  });

  describe('createSlot', () => {
    it('creates a slot under an owned location', async () => {
      const provider = await createTestProvider(testKnex);
      const location = await createTestLocation(testKnex, provider.id);
      const service = makeService();
      const start = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

      const slot = await service.createSlot(provider.id, location.id, { start_time: start, end_time: end });

      expect(slot.id).toBeDefined();
      expect(slot.booking_location_id).toBe(location.id);
      expect(slot.start_time.getTime()).toBe(start.getTime());
    });

    it('throws LocationOwnershipError when a different provider tries to add a slot', async () => {
      const ownerProvider = await createTestProvider(testKnex);
      const intruder = await createTestProvider(testKnex);
      const location = await createTestLocation(testKnex, ownerProvider.id);
      const service = makeService();
      const start = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

      await expect(
        service.createSlot(intruder.id, location.id, { start_time: start, end_time: end })
      ).rejects.toThrow(LocationOwnershipError);
    });
  });

  describe('getSlots', () => {
    it('returns all slots for an owned location', async () => {
      const provider = await createTestProvider(testKnex);
      const location = await createTestLocation(testKnex, provider.id);
      await createTestSlot(testKnex, location.id);
      await createTestSlot(testKnex, location.id);
      const service = makeService();

      const slots = await service.getSlots(provider.id, location.id);

      expect(slots.length).toBeGreaterThanOrEqual(2);
      expect(slots.every((s) => s.booking_location_id === location.id)).toBe(true);
    });

    it('throws LocationOwnershipError when a different provider tries to read slots', async () => {
      const ownerProvider = await createTestProvider(testKnex);
      const intruder = await createTestProvider(testKnex);
      const location = await createTestLocation(testKnex, ownerProvider.id);
      const service = makeService();

      await expect(service.getSlots(intruder.id, location.id)).rejects.toThrow(LocationOwnershipError);
    });
  });

  describe('deleteSlot', () => {
    it('deletes a slot when the provider owns the parent location', async () => {
      const provider = await createTestProvider(testKnex);
      const location = await createTestLocation(testKnex, provider.id);
      const slot = await createTestSlot(testKnex, location.id);
      const service = makeService();

      await expect(service.deleteSlot(provider.id, slot.id)).resolves.toBeUndefined();

      const slots = await service.getSlots(provider.id, location.id);
      expect(slots.some((s) => s.id === slot.id)).toBe(false);
    });

    it('throws LocationOwnershipError when a different provider tries to delete a slot', async () => {
      const ownerProvider = await createTestProvider(testKnex);
      const intruder = await createTestProvider(testKnex);
      const location = await createTestLocation(testKnex, ownerProvider.id);
      const slot = await createTestSlot(testKnex, location.id);
      const service = makeService();

      await expect(service.deleteSlot(intruder.id, slot.id)).rejects.toThrow(LocationOwnershipError);
    });
  });
});
