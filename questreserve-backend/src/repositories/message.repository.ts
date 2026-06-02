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
    other_first_name: string;
    other_last_name: string;
  }>> {
    const otherType = userType === 'provider' ? 'customer' : 'provider';

    const query = this.knex('message')
      .join('booking', 'message.booking_id', 'booking.id')
      .join('time_slot', 'booking.time_slot_id', 'time_slot.id')
      .join('booking_location', 'time_slot.booking_location_id', 'booking_location.id')
      .where(userType === 'customer'
        ? { 'booking.end_user_id': userId }
        : { 'booking_location.provider_id': userId }
      );

    if (userType === 'customer') {
      query.join('provider', 'booking_location.provider_id', 'provider.id');
    } else {
      query.join('end_user', 'booking.end_user_id', 'end_user.id');
    }

    const otherFirstNameCol = userType === 'customer' ? 'provider.first_name' : 'end_user.first_name';
    const otherLastNameCol = userType === 'customer' ? 'provider.last_name' : 'end_user.last_name';

    const rows = await query
      .select(
        'booking.id as booking_id',
        'booking_location.name as location_name',
        this.knex.raw('MAX(message.created_at) as last_message_at'),
        this.knex.raw(`COUNT(CASE WHEN message.sender_type = ? AND message.read_at IS NULL THEN 1 END) as unread_count`, [otherType]),
        this.knex.raw(`(array_agg(message.body ORDER BY message.created_at DESC))[1] as last_message_body`),
        this.knex.raw(`MAX(??) as other_first_name`, [otherFirstNameCol]),
        this.knex.raw(`MAX(??) as other_last_name`, [otherLastNameCol]),
      )
      .groupBy('booking.id', 'booking_location.name')
      .orderBy('last_message_at', 'desc');

    return rows.map((r) => ({
      booking_id: r.booking_id,
      location_name: r.location_name,
      last_message_body: r.last_message_body,
      last_message_at: r.last_message_at,
      unread_count: Number(r.unread_count),
      other_first_name: r.other_first_name,
      other_last_name: r.other_last_name,
    }));
  }
}
