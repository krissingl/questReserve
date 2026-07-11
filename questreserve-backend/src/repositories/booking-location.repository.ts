import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { BaseRepository } from '../infrastructure';
import { BookingLocation, LocationFilters } from '../types';

export class BookingLocationRepository extends BaseRepository<BookingLocation> {
  constructor(knex: Knex) {
    super(knex);
  }

  async findById(id: string): Promise<BookingLocation | null> {
    const row = await this.knex<BookingLocation>('booking_location').where({ id }).first();
    return row ?? null;
  }

  async findAll(filters: LocationFilters = {}): Promise<BookingLocation[]> {
    let query = this.knex<BookingLocation>('booking_location').select('*');

    if (filters.difficulties && filters.difficulties.length > 0) {
      query = query.whereIn('difficulty', filters.difficulties);
    }
    if (filters.levelRangeMin !== undefined) {
      query = query.where('level_range_max', '>=', filters.levelRangeMin);
    }
    if (filters.levelRangeMax !== undefined) {
      query = query.where('level_range_min', '<=', filters.levelRangeMax);
    }
    if (filters.runTimeMax !== undefined) {
      query = query.where('run_time_minutes', '<=', filters.runTimeMax);
    }
    if (filters.setting) {
      query = query.where('setting', filters.setting);
    }
    if (filters.landscapeType) {
      query = query.where('landscape_type', filters.landscapeType);
    }
    if (filters.toneTags && filters.toneTags.length > 0) {
      query = query.whereRaw('tone_tags && ?::text[]', [filters.toneTags]);
    }
    if (filters.partySizeMin !== undefined) {
      query = query.where('party_size_max', '>=', filters.partySizeMin);
    }
    if (filters.partySizeMax !== undefined) {
      query = query.where('party_size_min', '<=', filters.partySizeMax);
    }
    if (filters.primaryFocusMin !== undefined) {
      query = query.where('primary_focus', '>=', filters.primaryFocusMin);
    }
    if (filters.primaryFocusMax !== undefined) {
      query = query.where('primary_focus', '<=', filters.primaryFocusMax);
    }

    return query;
  }

  async findAllByProvider(providerId: string): Promise<BookingLocation[]> {
    return this.knex<BookingLocation>('booking_location')
      .where({ provider_id: providerId })
      .select('*');
  }

  async create(
    data: Omit<BookingLocation, 'id' | 'created_at' | 'updated_at'>
  ): Promise<BookingLocation> {
    const id = uuidv4();
    const [row] = await this.knex<BookingLocation>('booking_location')
      .insert({ id, ...data })
      .returning('*');
    return row;
  }

  async update(
    id: string,
    data: Partial<Omit<BookingLocation, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<BookingLocation | null> {
    const [row] = await this.knex<BookingLocation>('booking_location')
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return row ?? null;
  }

  async updateImageUrl(locationId: string, url: string): Promise<BookingLocation | null> {
    const [row] = await this.knex<BookingLocation>('booking_location')
      .where({ id: locationId })
      .update({ image_url: url, updated_at: new Date() })
      .returning('*');
    return row ?? null;
  }

  async findByIdWithProvider(id: string): Promise<(BookingLocation & { provider_first_name: string; provider_last_name: string; provider_profile_picture_url: string | null }) | null> {
    const row = await this.knex('booking_location')
      .join('provider', 'booking_location.provider_id', 'provider.id')
      .where('booking_location.id', id)
      .select(
        'booking_location.*',
        'provider.first_name as provider_first_name',
        'provider.last_name as provider_last_name',
        'provider.profile_picture_url as provider_profile_picture_url',
      )
      .first();
    return row ?? null;
  }

  async delete(id: string): Promise<void> {
    await this.knex<BookingLocation>('booking_location').where({ id }).delete();
  }
}
