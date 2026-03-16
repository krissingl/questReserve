import knex, { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import dotenv from 'dotenv';
import knexConfig from '../db/knexfile';
import { BookingLocation, Difficulty, EndUser, EndUserRole, Provider, ProviderPlan, ProviderStatus, TimeSlot } from '../types';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export function getTestKnex(): Knex {
  return knex(knexConfig['test']);
}

export async function runMigrations(testKnex: Knex): Promise<void> {
  await testKnex.migrate.latest();
}

export async function rollbackMigrations(testKnex: Knex): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await testKnex.migrate.rollback({ all: true } as any);
}

export async function createTestEndUser(
  testKnex: Knex,
  overrides: Partial<Omit<EndUser, 'id' | 'created_at' | 'updated_at'>> = {}
): Promise<EndUser> {
  const id = uuidv4();
  const data: Omit<EndUser, 'created_at' | 'updated_at'> = {
    id,
    first_name: 'Test',
    last_name: 'User',
    email: `testuser-${id}@test.local`,
    password_hash: '$2b$10$placeholder_hash_for_testing_only_not_valid',
    role: 'REGULAR' as EndUserRole,
    ...overrides,
  };
  const [row] = await testKnex<EndUser>('end_user').insert(data).returning('*');
  return row;
}

export async function createTestProvider(
  testKnex: Knex,
  overrides: Partial<Omit<Provider, 'id' | 'created_at' | 'updated_at'>> = {}
): Promise<Provider> {
  const id = uuidv4();
  const data: Omit<Provider, 'created_at' | 'updated_at'> = {
    id,
    first_name: 'Test',
    last_name: 'Provider',
    email: `testprovider-${id}@test.local`,
    password_hash: '$2b$10$placeholder_hash_for_testing_only_not_valid',
    organization_name: null,
    plan: 'FREE' as ProviderPlan,
    status: 'ACTIVE' as ProviderStatus,
    ...overrides,
  };
  const [row] = await testKnex<Provider>('provider').insert(data).returning('*');
  return row;
}

export async function createTestLocation(
  testKnex: Knex,
  providerId: string,
  overrides: Partial<Omit<BookingLocation, 'id' | 'created_at' | 'updated_at'>> = {}
): Promise<BookingLocation> {
  const id = uuidv4();
  const data: Omit<BookingLocation, 'created_at' | 'updated_at'> = {
    id,
    provider_id: providerId,
    name: 'Test Location',
    description: null,
    difficulty: 'EASY' as Difficulty,
    cancellation_policy: 'No refunds.',
    ...overrides,
  };
  const [row] = await testKnex<BookingLocation>('booking_location').insert(data).returning('*');
  return row;
}

export async function createTestSlot(
  testKnex: Knex,
  locationId: string,
  overrides: Partial<Omit<TimeSlot, 'id' | 'created_at' | 'updated_at'>> = {}
): Promise<TimeSlot> {
  const id = uuidv4();
  const start = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week from now
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);   // 2 hours later
  const data: Omit<TimeSlot, 'created_at' | 'updated_at'> = {
    id,
    booking_location_id: locationId,
    start_time: start,
    end_time: end,
    ...overrides,
  };
  const [row] = await testKnex<TimeSlot>('time_slot').insert(data).returning('*');
  return row;
}
