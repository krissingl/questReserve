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
}
