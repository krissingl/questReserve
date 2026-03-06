import { Knex } from 'knex';
import { AdminBookingView, Provider, ProviderStatus } from '../types';

type SafeProvider = Omit<Provider, 'password_hash'>;

export class ProviderNotFoundError extends Error {
  constructor() {
    super('Provider not found');
    this.name = 'ProviderNotFoundError';
  }
}

// Note: AdminService queries Knex directly rather than through a repository.
// listProviders/getProvider operate on a single table and are candidates for a
// ProviderRepository in a future refactor. The join-based getPlatformBookings
// query spans multiple tables and is intentionally kept here as a service-level
// read-only view. See code review SF-4.
export class AdminService {
  constructor(private readonly knex: Knex) {}

  async listProviders(): Promise<SafeProvider[]> {
    const rows = await this.knex<Provider>('provider').select('*');
    return rows.map(({ password_hash: _ph, ...safe }) => safe);
  }

  async getProvider(providerId: string): Promise<SafeProvider> {
    const provider = await this.knex<Provider>('provider').where({ id: providerId }).first();
    if (!provider) throw new ProviderNotFoundError();
    const { password_hash: _ph, ...safe } = provider;
    return safe;
  }

  async setProviderStatus(providerId: string, status: ProviderStatus): Promise<SafeProvider> {
    const [updated] = await this.knex<Provider>('provider')
      .where({ id: providerId })
      .update({ status, updated_at: new Date() })
      .returning('*');
    if (!updated) throw new ProviderNotFoundError();
    const { password_hash: _ph, ...safe } = updated;
    return safe;
  }

  async getPlatformBookings(): Promise<AdminBookingView[]> {
    const rows = await this.knex('booking')
      .join('time_slot', 'booking.time_slot_id', 'time_slot.id')
      .join('booking_location', 'time_slot.booking_location_id', 'booking_location.id')
      .join('provider', 'booking_location.provider_id', 'provider.id')
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
        'booking_location.name as location_name',
        'provider.id as provider_id',
        this.knex.raw("provider.first_name || ' ' || provider.last_name as provider_name")
      );
    return rows as AdminBookingView[];
  }
}
