import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { BaseRepository } from '../infrastructure';
import { Booking } from '../types';

export class BookingRepository extends BaseRepository<Booking> {
  constructor(knex: Knex) {
    super(knex);
  }

  async findById(id: string): Promise<Booking | null> {
    const row = await this.knex<Booking>('booking').where({ id }).first();
    return row ?? null;
  }

  async findAll(): Promise<Booking[]> {
    return this.knex<Booking>('booking').select('*');
  }

  async findAllByEndUser(endUserId: string): Promise<Booking[]> {
    return this.knex<Booking>('booking')
      .where({ end_user_id: endUserId })
      .select('*');
  }

  async findByTimeSlot(timeSlotId: string): Promise<Booking | null> {
    const row = await this.knex<Booking>('booking')
      .where({ time_slot_id: timeSlotId, status: 'BOOKED' })
      .first();
    return row ?? null;
  }

  async create(
    data: Omit<Booking, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Booking> {
    const id = uuidv4();
    const [row] = await this.knex<Booking>('booking')
      .insert({ id, ...data })
      .returning('*');
    return row;
  }

  async update(
    id: string,
    data: Partial<Omit<Booking, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Booking | null> {
    const [row] = await this.knex<Booking>('booking')
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return row ?? null;
  }
}
