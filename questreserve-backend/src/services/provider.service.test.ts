import {
  ProviderService,
  LocationNotFoundError,
  LocationOwnershipError,
  SlotNotFoundError,
} from './provider.service';
import { BookingLocationRepository } from '../repositories/booking-location.repository';
import { TimeSlotRepository } from '../repositories/time-slot.repository';
import { BookingLocation, TimeSlot } from '../types';
import { Knex } from 'knex';

// Minimal stub factory helpers
function makeLocation(overrides: Partial<BookingLocation> = {}): BookingLocation {
  return {
    id: 'loc-1',
    provider_id: 'prov-a',
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
  return {
    id: 'slot-1',
    booking_location_id: 'loc-1',
    start_time: new Date('2030-01-01T10:00:00Z'),
    end_time: new Date('2030-01-01T12:00:00Z'),
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

function makeRepositories() {
  const locationRepo = {
    findById: jest.fn(),
    findAll: jest.fn(),
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

  // knex is only used by getBookings, which is not under test here.
  const mockKnex = {} as Knex;

  return { locationRepo, slotRepo, mockKnex };
}

describe('ProviderService', () => {
  let locationRepo: jest.Mocked<BookingLocationRepository>;
  let slotRepo: jest.Mocked<TimeSlotRepository>;
  let service: ProviderService;

  beforeEach(() => {
    const repos = makeRepositories();
    locationRepo = repos.locationRepo;
    slotRepo = repos.slotRepo;
    service = new ProviderService(locationRepo, slotRepo, repos.mockKnex);
  });

  // ---------------------------------------------------------------------------
  // createLocation
  // ---------------------------------------------------------------------------
  describe('createLocation', () => {
    it('delegates to locationRepo.create and returns the result', async () => {
      const location = makeLocation();
      locationRepo.create.mockResolvedValue(location);

      const result = await service.createLocation('prov-a', {
        name: 'Test Location',
        difficulty: 'EASY',
        cancellation_policy: 'No refunds.',
      });

      expect(result).toEqual(location);
      expect(locationRepo.create).toHaveBeenCalledWith({
        provider_id: 'prov-a',
        name: 'Test Location',
        description: null,
        difficulty: 'EASY',
        cancellation_policy: 'No refunds.',
      });
    });
  });

  // ---------------------------------------------------------------------------
  // getLocation
  // ---------------------------------------------------------------------------
  describe('getLocation', () => {
    it('throws LocationNotFoundError when the location does not exist', async () => {
      locationRepo.findById.mockResolvedValue(null);

      await expect(service.getLocation('prov-a', 'loc-missing')).rejects.toThrow(LocationNotFoundError);
    });

    it('throws LocationOwnershipError when the location belongs to a different provider', async () => {
      locationRepo.findById.mockResolvedValue(makeLocation({ provider_id: 'prov-b' }));

      await expect(service.getLocation('prov-a', 'loc-1')).rejects.toThrow(LocationOwnershipError);
    });

    it('returns the location on success', async () => {
      const location = makeLocation({ provider_id: 'prov-a' });
      locationRepo.findById.mockResolvedValue(location);

      const result = await service.getLocation('prov-a', 'loc-1');

      expect(result).toEqual(location);
    });
  });

  // ---------------------------------------------------------------------------
  // updateLocation
  // ---------------------------------------------------------------------------
  describe('updateLocation', () => {
    it('throws LocationNotFoundError via assertLocationOwnership when location does not exist', async () => {
      locationRepo.findById.mockResolvedValue(null);

      await expect(service.updateLocation('prov-a', 'loc-missing', { name: 'New Name' })).rejects.toThrow(
        LocationNotFoundError
      );
    });

    it('throws LocationOwnershipError via assertLocationOwnership when ownership fails', async () => {
      locationRepo.findById.mockResolvedValue(makeLocation({ provider_id: 'prov-b' }));

      await expect(service.updateLocation('prov-a', 'loc-1', { name: 'New Name' })).rejects.toThrow(
        LocationOwnershipError
      );
    });

    it('returns the updated location on success', async () => {
      const original = makeLocation({ provider_id: 'prov-a' });
      const updated = makeLocation({ provider_id: 'prov-a', name: 'New Name' });
      locationRepo.findById.mockResolvedValue(original);
      locationRepo.update.mockResolvedValue(updated);

      const result = await service.updateLocation('prov-a', 'loc-1', { name: 'New Name' });

      expect(result).toEqual(updated);
    });
  });

  // ---------------------------------------------------------------------------
  // createSlot
  // ---------------------------------------------------------------------------
  describe('createSlot', () => {
    it('throws when the ownership check fails (location not found)', async () => {
      locationRepo.findById.mockResolvedValue(null);

      await expect(
        service.createSlot('prov-a', 'loc-1', {
          start_time: new Date('2030-01-01T10:00:00Z'),
          end_time: new Date('2030-01-01T12:00:00Z'),
        })
      ).rejects.toThrow(LocationNotFoundError);
    });

    it('delegates to slotRepo.create on success', async () => {
      const location = makeLocation({ provider_id: 'prov-a' });
      const slot = makeSlot();
      locationRepo.findById.mockResolvedValue(location);
      slotRepo.create.mockResolvedValue(slot);

      const input = { start_time: new Date('2030-01-01T10:00:00Z'), end_time: new Date('2030-01-01T12:00:00Z') };
      const result = await service.createSlot('prov-a', 'loc-1', input);

      expect(result).toEqual(slot);
      expect(slotRepo.create).toHaveBeenCalledWith({
        booking_location_id: 'loc-1',
        start_time: input.start_time,
        end_time: input.end_time,
      });
    });
  });

  // ---------------------------------------------------------------------------
  // getSlots
  // ---------------------------------------------------------------------------
  describe('getSlots', () => {
    it('throws when the ownership check gates the slot list query', async () => {
      locationRepo.findById.mockResolvedValue(makeLocation({ provider_id: 'prov-b' }));

      await expect(service.getSlots('prov-a', 'loc-1')).rejects.toThrow(LocationOwnershipError);
    });

    it('returns the slot list on success', async () => {
      const location = makeLocation({ provider_id: 'prov-a' });
      const slots = [makeSlot(), makeSlot({ id: 'slot-2' })];
      locationRepo.findById.mockResolvedValue(location);
      slotRepo.findAllByLocation.mockResolvedValue(slots);

      const result = await service.getSlots('prov-a', 'loc-1');

      expect(result).toEqual(slots);
    });
  });

  // ---------------------------------------------------------------------------
  // updateSlot
  // ---------------------------------------------------------------------------
  describe('updateSlot', () => {
    it('throws SlotNotFoundError when the slot does not exist', async () => {
      slotRepo.findById.mockResolvedValue(null);

      await expect(
        service.updateSlot('prov-a', 'slot-missing', { start_time: new Date() })
      ).rejects.toThrow(SlotNotFoundError);
    });

    it('throws LocationOwnershipError when the slot belongs to a location owned by a different provider', async () => {
      slotRepo.findById.mockResolvedValue(makeSlot({ booking_location_id: 'loc-1' }));
      locationRepo.findById.mockResolvedValue(makeLocation({ provider_id: 'prov-b' }));

      await expect(
        service.updateSlot('prov-a', 'slot-1', { start_time: new Date() })
      ).rejects.toThrow(LocationOwnershipError);
    });

    it('returns the updated slot on success', async () => {
      const slot = makeSlot({ booking_location_id: 'loc-1' });
      const location = makeLocation({ provider_id: 'prov-a' });
      const newTime = new Date('2030-06-01T10:00:00Z');
      const updatedSlot = makeSlot({ start_time: newTime });
      slotRepo.findById.mockResolvedValue(slot);
      locationRepo.findById.mockResolvedValue(location);
      slotRepo.update.mockResolvedValue(updatedSlot);

      const result = await service.updateSlot('prov-a', 'slot-1', { start_time: newTime });

      expect(result).toEqual(updatedSlot);
    });
  });

  // ---------------------------------------------------------------------------
  // deleteSlot
  // ---------------------------------------------------------------------------
  describe('deleteSlot', () => {
    it('throws on ownership failure', async () => {
      slotRepo.findById.mockResolvedValue(makeSlot({ booking_location_id: 'loc-1' }));
      locationRepo.findById.mockResolvedValue(makeLocation({ provider_id: 'prov-b' }));

      await expect(service.deleteSlot('prov-a', 'slot-1')).rejects.toThrow(LocationOwnershipError);
    });

    it('calls slotRepo.delete on success', async () => {
      const slot = makeSlot({ booking_location_id: 'loc-1' });
      const location = makeLocation({ provider_id: 'prov-a' });
      slotRepo.findById.mockResolvedValue(slot);
      locationRepo.findById.mockResolvedValue(location);
      slotRepo.delete.mockResolvedValue(undefined);

      await service.deleteSlot('prov-a', 'slot-1');

      expect(slotRepo.delete).toHaveBeenCalledWith('slot-1');
    });
  });
});
