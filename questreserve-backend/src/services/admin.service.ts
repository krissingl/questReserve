import { Knex } from 'knex';
import { Booking, BookingStatus, Provider, ProviderStatus } from '../types';

export class ProviderNotFoundError extends Error {
  constructor() {
    super('Provider not found');
    this.name = 'ProviderNotFoundError';
  }
}

export interface AdminBookingView {
  id: string;
  time_slot_id: string;
  end_user_id: string;
  status: BookingStatus;
  created_at: Date;
  updated_at: Date;
  start_time: Date;
  end_time: Date;
  booking_location_id: string;
  location_name: string;
  provider_id: string;
  provider_name: string;
}

export class AdminService {
  constructor(private readonly knex: Knex) {}

  async listProviders(): Promise<Provider[]> {
    return this.knex<Provider>('provider').select('*');
  }

  async getProvider(providerId: string): Promise<Provider> {
    const provider = await this.knex<Provider>('provider').where({ id: providerId }).first();
    if (!provider) throw new ProviderNotFoundError();
    return provider;
  }

  async setProviderStatus(providerId: string, status: ProviderStatus): Promise<Provider> {
    const existing = await this.knex<Provider>('provider').where({ id: providerId }).first();
    if (!existing) throw new ProviderNotFoundError();

    const [updated] = await this.knex<Provider>('provider')
      .where({ id: providerId })
      .update({ status, updated_at: new Date() })
      .returning('*');
    return updated;
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
