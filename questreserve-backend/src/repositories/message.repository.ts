import { Knex } from 'knex';

export interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_type: 'provider' | 'customer';
  body: string;
  created_at: Date;
  read_at: Date | null;
}

export interface InsertMessageData {
  booking_id: string;
  sender_id: string;
  sender_type: 'provider' | 'customer';
  body: string;
}

export class MessageRepository {
  constructor(private readonly knex: Knex) {}

  async insert(data: InsertMessageData): Promise<Message> {
    const [row] = await this.knex<Message>('message')
      .insert(data)
      .returning('*');
    return row;
  }

  async findByBooking(bookingId: string): Promise<Message[]> {
    return this.knex<Message>('message')
      .where({ booking_id: bookingId })
      .orderBy('created_at', 'asc');
  }

  async findById(id: string): Promise<Message | null> {
    const row = await this.knex<Message>('message').where({ id }).first();
    return row ?? null;
  }

  async markRead(id: string): Promise<void> {
    await this.knex<Message>('message')
      .where({ id })
      .update({ read_at: new Date() });
  }

  async findInboxForUser(userId: string, userType: 'provider' | 'customer'): Promise<Array<{
    booking_id: string;
    location_name: string;
    last_message_body: string;
    last_message_at: Date;
    unread_count: number;
  }>> {
    const otherType = userType === 'provider' ? 'customer' : 'provider';

    const rows = await this.knex('message')
      .join('booking', 'message.booking_id', 'booking.id')
      .join('time_slot', 'booking.time_slot_id', 'time_slot.id')
      .join('booking_location', 'time_slot.booking_location_id', 'booking_location.id')
      .where(userType === 'customer'
        ? { 'booking.end_user_id': userId }
        : { 'booking_location.provider_id': userId }
      )
      .select(
        'booking.id as booking_id',
        'booking_location.name as location_name',
        this.knex.raw('MAX(message.created_at) as last_message_at'),
        this.knex.raw(`COUNT(CASE WHEN message.sender_type = ? AND message.read_at IS NULL THEN 1 END) as unread_count`, [otherType]),
        this.knex.raw(`(array_agg(message.body ORDER BY message.created_at DESC))[1] as last_message_body`),
      )
      .groupBy('booking.id', 'booking_location.name')
      .orderBy('last_message_at', 'desc');

    return rows.map((r) => ({
      booking_id: r.booking_id,
      location_name: r.location_name,
      last_message_body: r.last_message_body,
      last_message_at: r.last_message_at,
      unread_count: Number(r.unread_count),
    }));
  }
}
