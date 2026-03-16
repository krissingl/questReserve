import { AdminService, ProviderNotFoundError } from './admin.service';
import { ProviderRepository } from '../repositories/provider.repository';
import { AdminBookingView, Provider } from '../types';
import { Knex } from 'knex';

// Minimal stub factory
function makeProvider(overrides: Partial<Provider> = {}): Provider {
  return {
    id: 'prov-1',
    first_name: 'Test',
    last_name: 'Provider',
    email: 'test@test.local',
    password_hash: 'hashed',
    organization_name: null,
    plan: 'FREE',
    status: 'ACTIVE',
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

function makeProviderRepo() {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<ProviderRepository>;
}

// Minimal Knex mock for getPlatformBookings
// The method chains: knex('booking').join(...).join(...).join(...).select(...)
// We need a builder that supports repeated .join() and .select() calls.
// knex.raw() is also called for the provider_name concatenation.
function makeKnexMock(rows: unknown[]) {
  const builder = {
    join: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnValue(Promise.resolve(rows)),
    where: jest.fn().mockReturnThis(),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const knex = jest.fn().mockReturnValue(builder) as any;
  knex.raw = jest.fn().mockReturnValue('raw-expr');
  return { knex, builder };
}

describe('AdminService', () => {
  let providerRepo: jest.Mocked<ProviderRepository>;

  beforeEach(() => {
    providerRepo = makeProviderRepo();
  });

  // ---------------------------------------------------------------------------
  // listProviders
  // ---------------------------------------------------------------------------
  describe('listProviders', () => {
    it('delegates to providerRepo.findAll and returns results with password_hash stripped', async () => {
      const providers = [makeProvider({ id: 'prov-1' }), makeProvider({ id: 'prov-2' })];
      providerRepo.findAll.mockResolvedValue(providers);
      const { knex } = makeKnexMock([]);
      const service = new AdminService(knex as unknown as Knex, providerRepo);

      const result = await service.listProviders();

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password_hash');
      expect(result[1]).not.toHaveProperty('password_hash');
      expect(result[0].id).toBe('prov-1');
    });
  });

  // ---------------------------------------------------------------------------
  // getProvider
  // ---------------------------------------------------------------------------
  describe('getProvider', () => {
    it('throws ProviderNotFoundError when providerRepo.findById returns null', async () => {
      providerRepo.findById.mockResolvedValue(null);
      const { knex } = makeKnexMock([]);
      const service = new AdminService(knex as unknown as Knex, providerRepo);

      await expect(service.getProvider('prov-missing')).rejects.toThrow(ProviderNotFoundError);
    });

    it('returns the provider with password_hash stripped on success', async () => {
      providerRepo.findById.mockResolvedValue(makeProvider());
      const { knex } = makeKnexMock([]);
      const service = new AdminService(knex as unknown as Knex, providerRepo);

      const result = await service.getProvider('prov-1');

      expect(result).not.toHaveProperty('password_hash');
      expect(result.id).toBe('prov-1');
    });
  });

  // ---------------------------------------------------------------------------
  // setProviderStatus
  // ---------------------------------------------------------------------------
  describe('setProviderStatus', () => {
    it('throws ProviderNotFoundError when providerRepo.updateStatus returns null', async () => {
      providerRepo.updateStatus.mockResolvedValue(null);
      const { knex } = makeKnexMock([]);
      const service = new AdminService(knex as unknown as Knex, providerRepo);

      await expect(service.setProviderStatus('prov-missing', 'SUSPENDED')).rejects.toThrow(ProviderNotFoundError);
    });

    it('returns the updated provider with password_hash stripped on success', async () => {
      providerRepo.updateStatus.mockResolvedValue(makeProvider({ status: 'SUSPENDED' }));
      const { knex } = makeKnexMock([]);
      const service = new AdminService(knex as unknown as Knex, providerRepo);

      const result = await service.setProviderStatus('prov-1', 'SUSPENDED');

      expect(result).not.toHaveProperty('password_hash');
      expect(result.status).toBe('SUSPENDED');
    });
  });

  // ---------------------------------------------------------------------------
  // getPlatformBookings
  // ---------------------------------------------------------------------------
  describe('getPlatformBookings', () => {
    it('returns the shaped rows as AdminBookingView[]', async () => {
      const mockRow: AdminBookingView = {
        id: 'booking-1',
        time_slot_id: 'slot-1',
        end_user_id: 'user-1',
        status: 'BOOKED',
        created_at: new Date(),
        updated_at: new Date(),
        start_time: new Date(),
        end_time: new Date(),
        booking_location_id: 'loc-1',
        location_name: 'Test Location',
        provider_id: 'prov-1',
        provider_name: 'Test Provider',
      };
      const { knex } = makeKnexMock([mockRow]);
      const service = new AdminService(knex as unknown as Knex, providerRepo);

      const result = await service.getPlatformBookings();

      expect(result).toHaveLength(1);
      expect(result[0].provider_name).toBe('Test Provider');
    });
  });
});
