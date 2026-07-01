import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { getPlatformBookings, type AdminBookingView, type BookingStatus } from '@/api/admin.api'
import { SortableTh } from '@/components/SortableTh/SortableTh'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const statusColors: Record<BookingStatus, { bg: string; text: string }> = {
  BOOKED:    { bg: 'rgb(var(--success) / 0.18)',     text: 'rgb(var(--success))' },
  CANCELLED: { bg: 'rgb(var(--muted-foreground) / 0.15)', text: 'rgb(var(--muted-foreground))' },
}

function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const colors = statusColors[status] ?? statusColors.CANCELLED
  return (
    <span
      className="rounded px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {status}
    </span>
  )
}

type SortKey = 'location_name' | 'provider_name' | 'start_time' | 'end_time' | 'status' | 'created_at'
type SortDirection = 'asc' | 'desc'

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'location_name', label: 'Location' },
  { key: 'provider_name', label: 'Provider' },
  { key: 'start_time', label: 'Start Time' },
  { key: 'end_time', label: 'End Time' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Created At' },
]

function sortValue(b: AdminBookingView, key: SortKey): string | number {
  switch (key) {
    case 'location_name': return b.location_name.toLowerCase()
    case 'provider_name': return b.provider_name.toLowerCase()
    case 'start_time': return new Date(b.start_time).getTime()
    case 'end_time': return new Date(b.end_time).getTime()
    case 'status': return b.status
    case 'created_at': return new Date(b.created_at).getTime()
  }
}

export function AdminBookings() {
  const [bookings, setBookings] = useState<AdminBookingView[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    getPlatformBookings()
      .then((data) => { if (!cancelled) { setBookings(data); setIsLoading(false) } })
      .catch(() => { if (!cancelled) { setError('Failed to load bookings.'); setIsLoading(false) } })
    return () => { cancelled = true }
  }, [])

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const visibleBookings = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = query
      ? bookings.filter((b) =>
          b.location_name.toLowerCase().includes(query) ||
          b.provider_name.toLowerCase().includes(query) ||
          b.id.toLowerCase().includes(query)
        )
      : bookings

    const sorted = [...filtered].sort((a, b) => {
      const aVal = sortValue(a, sortKey)
      const bVal = sortValue(b, sortKey)
      let cmp: number
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal
      } else {
        cmp = String(aVal).localeCompare(String(bVal))
      }
      return sortDirection === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [bookings, search, sortKey, sortDirection])

  return (
    <main className="p-8">
      <h1
        className="mb-6 text-2xl font-bold"
        style={{ fontFamily: 'var(--font-heading)', color: 'rgb(var(--foreground))' }}
      >
        Bookings
      </h1>

      <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '1.5rem' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgb(var(--muted-foreground))',
          }}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bookings by location, provider, or booking ID…"
          className="w-full rounded-md border py-2 pr-3 text-sm focus:outline-none focus:ring-2"
          style={{
            paddingLeft: '2.25rem',
            backgroundColor: 'rgb(var(--background))',
            color: 'rgb(var(--foreground))',
            borderColor: 'rgb(var(--border))',
          }}
        />
      </div>

      {isLoading && (
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading bookings…</p>
      )}

      {error && (
        <p style={{ color: 'rgb(var(--destructive))' }}>{error}</p>
      )}

      {!isLoading && !error && bookings.length === 0 && (
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>No bookings found.</p>
      )}

      {!isLoading && !error && bookings.length > 0 && visibleBookings.length === 0 && (
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>No bookings match your search.</p>
      )}

      {!isLoading && !error && visibleBookings.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgb(var(--border))' }}>
                <th
                  style={{
                    padding: '0.5rem 0.75rem',
                    textAlign: 'left',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'rgb(var(--muted-foreground))',
                  }}
                >
                  Booking ID
                </th>
                {COLUMNS.map((col) => (
                  <SortableTh
                    key={col.key}
                    label={col.label}
                    active={sortKey === col.key}
                    direction={sortDirection}
                    onClick={() => handleSort(col.key)}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleBookings.map((b) => (
                <tr
                  key={b.id}
                  style={{ borderBottom: '1px solid rgb(var(--border) / 0.5)' }}
                >
                  <td
                    style={{
                      padding: '0.625rem 0.75rem',
                      color: 'rgb(var(--muted-foreground))',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                    }}
                    title={b.id}
                  >
                    {b.id.slice(0, 8)}…
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem', color: 'rgb(var(--foreground))' }}>
                    {b.location_name}
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem', color: 'rgb(var(--foreground))' }}>
                    {b.provider_name}
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem', color: 'rgb(var(--foreground))' }}>
                    {formatDateTime(b.start_time)}
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem', color: 'rgb(var(--foreground))' }}>
                    {formatDateTime(b.end_time)}
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem' }}>
                    <BookingStatusBadge status={b.status} />
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem', color: 'rgb(var(--muted-foreground))' }}>
                    {formatDateTime(b.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
