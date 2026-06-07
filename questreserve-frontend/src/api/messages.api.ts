import { apiClient } from './client'

export interface Message {
  id: string
  booking_id: string
  sender_id: string
  sender_type: 'provider' | 'customer'
  body: string
  created_at: string
  read_at: string | null
}

export async function getMessages(bookingId: string): Promise<Message[]> {
  const response = await apiClient.get<Message[]>(`/messages?bookingId=${encodeURIComponent(bookingId)}`)
  return response.data
}

export async function sendMessage(bookingId: string, body: string): Promise<Message> {
  const response = await apiClient.post<Message>('/messages', { bookingId, body })
  return response.data
}

export async function markMessageRead(messageId: string): Promise<void> {
  await apiClient.patch(`/messages/${messageId}/read`)
}

export interface InboxEntry {
  booking_id: string
  location_name: string
  last_message_body: string
  last_message_at: string
  unread_count: number
  other_first_name: string
  other_last_name: string
}

export async function getInbox(): Promise<InboxEntry[]> {
  const response = await apiClient.get<InboxEntry[]>('/messages/inbox')
  return response.data
}
