import { isExpired } from '@/utils/bookingUtils'
import type { Booking } from '@/types/domain'

export function StatusBadge({ booking }: { booking: Booking }) {
  if (isExpired(booking)) {
    return (
      <span
        className="rounded px-2 py-0.5 text-xs font-semibold"
        style={{
          backgroundColor: 'rgb(var(--warning) / 0.18)',
          color: 'rgb(var(--warning))',
        }}
      >
        EXPIRED
      </span>
    )
  }

  const colorMap: Record<string, { bg: string; text: string }> = {
    BOOKED:    { bg: 'rgb(var(--success) / 0.18)', text: 'rgb(var(--success))' },
    CANCELLED: { bg: 'rgb(var(--muted-foreground) / 0.15)', text: 'rgb(var(--muted-foreground))' },
  }
  const colors = colorMap[booking.status] ?? colorMap['CANCELLED']

  return (
    <span
      className="rounded px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {booking.status}
    </span>
  )
}
