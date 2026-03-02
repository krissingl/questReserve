import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { BaseRepository } from '../infrastructure';
import { TimeSlot } from '../types';

export class TimeSlotRepository extends BaseRepository<TimeSlot> {
  constructor(knex: Knex) {
    super(knex);
  }

  async findById(id: string): Promise<TimeSlot | null> {
    const row = await this.knex<TimeSlot>('time_slot').where({ id }).first();
    return row ?? null;
  }

  async findAll(): Promise<TimeSlot[]> {
    return this.knex<TimeSlot>('time_slot').select('*');
  }

  async findAllByLocation(locationId: string): Promise<TimeSlot[]> {
    return this.knex<TimeSlot>('time_slot')
      .where({ booking_location_id: locationId })
      .select('*');
  }

  async create(
    data: Omit<TimeSlot, 'id' | 'created_at' | 'updated_at'>
  ): Promise<TimeSlot> {
    const id = uuidv4();
    const [row] = await this.knex<TimeSlot>('time_slot')
      .insert({ id, ...data })
      .returning('*');
    return row;
  }

  async update(
    id: string,
    data: Partial<Omit<TimeSlot, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<TimeSlot | null> {
    const [row] = await this.knex<TimeSlot>('time_slot')
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return row ?? null;
  }

  async delete(id: string): Promise<void> {
    await this.knex<TimeSlot>('time_slot').where({ id }).delete();
  }
}
