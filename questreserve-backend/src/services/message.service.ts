import { Knex } from 'knex';
import { MessageRepository, Message, InsertMessageData } from '../repositories/message.repository';
import { Booking } from '../types';
import { TokenType } from '../utils/jwt';

export class BookingNotFoundError extends Error {
  constructor() {
    super('Booking not found');
    this.name = 'BookingNotFoundError';
  }
}

export class MessageNotFoundError extends Error {
  constructor() {
    super('Message not found');
    this.name = 'MessageNotFoundError';
  }
}

export class AccessDeniedError extends Error {
  constructor() {
    super('Access denied: you are not a party to this booking');
    this.name = 'AccessDeniedError';
  }
}

export class CannotMarkOwnMessageReadError extends Error {
  constructor() {
    super('Cannot mark your own message as read');
    this.name = 'CannotMarkOwnMessageReadError';
  }
}

function tokenTypeToSenderType(type: TokenType): 'provider' | 'customer' {
  return type === 'provider' ? 'provider' : 'customer';
}

export class MessageService {
  constructor(
    private readonly messageRepo: MessageRepository,
    private readonly knex: Knex
  ) {}

  private async getBookingWithProvider(bookingId: string): Promise<(Booking & { provider_id: string }) | null> {
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

  private async assertPartyAccess(bookingId: string, userId: string, userType: TokenType): Promise<void> {
    const booking = await this.getBookingWithProvider(bookingId);
    if (!booking) throw new BookingNotFoundError();
    const isParty =
      userType === 'provider'
        ? booking.provider_id === userId
        : booking.end_user_id === userId;
    if (!isParty) throw new AccessDeniedError();
  }

  async sendMessage(
    bookingId: string,
    body: string,
    senderId: string,
    senderTokenType: TokenType
  ): Promise<Message> {
    await this.assertPartyAccess(bookingId, senderId, senderTokenType);
    const senderType = tokenTypeToSenderType(senderTokenType);
    const data: InsertMessageData = { booking_id: bookingId, sender_id: senderId, sender_type: senderType, body };
    const message = await this.messageRepo.insert(data);

    // TODO: trigger email/push notification

    return message;
  }

  async getMessages(
    bookingId: string,
    requesterId: string,
    requesterTokenType: TokenType
  ): Promise<Message[]> {
    await this.assertPartyAccess(bookingId, requesterId, requesterTokenType);
    return this.messageRepo.findByBooking(bookingId);
  }

  async markRead(
    messageId: string,
    requesterId: string,
    requesterTokenType: TokenType
  ): Promise<void> {
    const message = await this.messageRepo.findById(messageId);
    if (!message) throw new MessageNotFoundError();
    await this.assertPartyAccess(message.booking_id, requesterId, requesterTokenType);
    const requesterSenderType = tokenTypeToSenderType(requesterTokenType);
    if (message.sender_type === requesterSenderType && message.sender_id === requesterId) {
      throw new CannotMarkOwnMessageReadError();
    }
    await this.messageRepo.markRead(messageId);
  }

  async getInbox(
    userId: string,
    userTokenType: TokenType
  ): Promise<Array<{
    booking_id: string;
    location_name: string;
    last_message_body: string;
    last_message_at: Date;
    unread_count: number;
    other_first_name: string;
    other_last_name: string;
  }>> {
    const userType = tokenTypeToSenderType(userTokenType);
    return this.messageRepo.findInboxForUser(userId, userType);
  }
}
