import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { BaseRepository } from '../infrastructure';
import { Booking, BookingStatus, EndUser } from '../types';

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
    return this.knex('booking')
      .join('time_slot', 'booking.time_slot_id', 'time_slot.id')
      .join('booking_location', 'time_slot.booking_location_id', 'booking_location.id')
      .where({ 'booking.end_user_id': endUserId })
      .select(
        'booking.id',
        'booking.time_slot_id',
        'booking.end_user_id',
        'booking.status',
        'booking.created_at',
        'booking.updated_at',
        'booking_location.name as location_name',
        'booking_location.id as booking_location_id',
        'time_slot.start_time as slot_start_time',
        'time_slot.end_time as slot_end_time',
      ) as Promise<Booking[]>;
  }

  async findByTimeSlot(timeSlotId: string): Promise<Booking | null> {
    const row = await this.knex<Booking>('booking')
      .where({ time_slot_id: timeSlotId, status: 'BOOKED' })
      .first();
    return row ?? null;
  }

  async findBookedByTimeSlots(slotIds: string[]): Promise<Booking[]> {
    if (slotIds.length === 0) return [];
    return this.knex<Booking>('booking')
      .whereIn('time_slot_id', slotIds)
      .where({ status: 'BOOKED' })
      .select('*');
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

  async delete(id: string): Promise<void> {
    await this.knex<Booking>('booking').where({ id }).delete();
  }

  async findCustomerById(customerId: string): Promise<EndUser | null> {
    const row = await this.knex<EndUser>('end_user').where({ id: customerId }).first();
    return row ?? null;
  }

  async updateCustomer(
    customerId: string,
    data: Partial<Pick<EndUser, 'first_name' | 'last_name' | 'bio' | 'profile_picture_url'>>
  ): Promise<EndUser | null> {
    const [row] = await this.knex<EndUser>('end_user')
      .where({ id: customerId })
      .update({ ...data, updated_at: new Date() })
      .returning(['id', 'first_name', 'last_name', 'email', 'profile_picture_url', 'bio']);
    return row ?? null;
  }

  async findByCustomerAndProvider(customerId: string, providerId: string): Promise<Array<{
    id: string;
    location_name: string;
    start_time: Date;
    end_time: Date;
    status: BookingStatus;
  }>> {
    return this.knex('booking')
      .join('time_slot', 'booking.time_slot_id', 'time_slot.id')
      .join('booking_location', 'time_slot.booking_location_id', 'booking_location.id')
      .where({ 'booking.end_user_id': customerId, 'booking_location.provider_id': providerId })
      .select(
        'booking.id',
        'booking_location.name as location_name',
        'time_slot.start_time',
        'time_slot.end_time',
        'booking.status',
      );
  }

  async findByIdWithProvider(bookingId: string): Promise<(Booking & { provider_id: string }) | null> {
    const row = await this.knex('booking')
      .join('time_slot', 'booking.time_slot_id', 'time_slot.id')
      .join('booking_location', 'time_slot.booking_location_id', 'booking_location.id')
      .where({ 'booking.id': bookingId })
      .select(
        'booking.id',
        'booking.time_slot_id',
        'booking.end_user_id',
        'booking.status',
        'booking.created_at',
        'booking.updated_at',
        'booking_location.provider_id',
      )
      .first();
    return row ?? null;
  }
}
