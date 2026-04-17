import type { Booking } from '@/types/domain'

export function isExpired(booking: Booking): boolean {
  return booking.status === 'BOOKED' && new Date(booking.slot_start_time) < new Date()
}

export function isCancellable(booking: Booking): boolean {
  return booking.status === 'BOOKED' && !isExpired(booking)
}
