import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { BaseRepository } from '../infrastructure';
import { BookingLocation } from '../types';

export class BookingLocationRepository extends BaseRepository<BookingLocation> {
  constructor(knex: Knex) {
    super(knex);
  }

  async findById(id: string): Promise<BookingLocation | null> {
    const row = await this.knex<BookingLocation>('booking_location').where({ id }).first();
    return row ?? null;
  }

  async findAll(): Promise<BookingLocation[]> {
    return this.knex<BookingLocation>('booking_location').select('*');
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

  async delete(id: string): Promise<void> {
    await this.knex<BookingLocation>('booking_location').where({ id }).delete();
  }
}
