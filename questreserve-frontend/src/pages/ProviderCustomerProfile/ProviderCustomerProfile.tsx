import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProviderCustomer } from '@/api/provider.api'
import type { ProviderCustomerProfile as ProviderCustomerProfileData } from '@/api/provider.api'
import { AvatarIcon } from '@/components/AvatarIcon/AvatarIcon'
import { ProfilePictureLightbox } from '@/components/ProfilePictureLightbox/ProfilePictureLightbox'
import { ReviewList } from '@/components/ReviewList/ReviewList'
import { ReviewForm } from '@/components/ReviewForm/ReviewForm'

const statusColours: Record<string, { bg: string; text: string }> = {
  BOOKED: { bg: 'rgb(var(--success, 34 197 94) / 0.12)', text: 'rgb(var(--success, 34 197 94))' },
  CANCELLED: { bg: 'rgb(var(--muted))', text: 'rgb(var(--muted-foreground))' },
}

function formatDateRange(start: string, end: string): string {
  const fmt = (s: string) =>
    new Date(s).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  return `${fmt(start)} — ${fmt(end)}`
}

export function ProviderCustomerProfile() {
  const { customerId } = useParams<{ customerId: string }>()
  const [profile, setProfile] = useState<ProviderCustomerProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0)

  useEffect(() => {
    if (!customerId) return
    setLoading(true)
    getProviderCustomer(customerId)
      .then((data) => {
        setProfile(data)
        setLoading(false)
      })
      .catch((err: unknown) => {
        const status =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { status?: number } }).response?.status
            : undefined
        setError(status === 404 ? 'Customer not found.' : 'Failed to load customer profile.')
        setLoading(false)
      })
  }, [customerId])

  return (
    <div style={{ padding: '2rem', width: '85%', minWidth: 'min(700px, 100%)', margin: '0 auto' }}>
      <Link
        to="/provider/bookings"
        style={{
          display: 'inline-block',
          marginBottom: '1.25rem',
          fontSize: 'var(--text-sm)',
          color: 'rgb(var(--muted-foreground))',
          textDecoration: 'none',
        }}
      >
        &larr; Back to Bookings
      </Link>

      {loading && (
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading customer profile…</p>
      )}

      {!loading && error && (
        <p style={{ color: 'rgb(var(--destructive))' }}>{error}</p>
      )}

      {!loading && !error && profile && (
        <>
          {lightboxOpen && profile.profile_picture_url && (
            <ProfilePictureLightbox
              url={profile.profile_picture_url}
              name={`${profile.first_name} ${profile.last_name}`}
              onClose={() => setLightboxOpen(false)}
            />
          )}
          <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span
              role={profile.profile_picture_url ? 'button' : undefined}
              tabIndex={profile.profile_picture_url ? 0 : undefined}
              onClick={profile.profile_picture_url ? () => setLightboxOpen(true) : undefined}
              onKeyDown={profile.profile_picture_url ? (e) => { if (e.key === 'Enter' || e.key === ' ') setLightboxOpen(true) } : undefined}
              style={profile.profile_picture_url ? { cursor: 'pointer' } : undefined}
              aria-label={profile.profile_picture_url ? `View profile photo of ${profile.first_name} ${profile.last_name}` : undefined}
            >
              <AvatarIcon firstName={profile.first_name} lastName={profile.last_name} size="lg" pictureUrl={profile.profile_picture_url} />
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.75rem',
                fontWeight: 'var(--weight-bold)',
                color: 'rgb(var(--foreground))',
                margin: 0,
              }}
            >
              {profile.first_name} {profile.last_name}
            </h1>
          </div>

          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius)',
              backgroundColor: 'rgb(var(--card))',
              boxShadow: 'var(--shadow-card)',
              marginBottom: '2rem',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1rem',
                fontWeight: 'var(--weight-semibold)',
                color: 'rgb(var(--foreground))',
                marginBottom: '0.5rem',
              }}
            >
              About
            </h2>
            {profile.bio ? (
              <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--foreground))', lineHeight: 1.6 }}>
                {profile.bio}
              </p>
            ) : (
              <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))', fontStyle: 'italic' }}>
                No bio yet.
              </p>
            )}
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.1rem',
              fontWeight: 'var(--weight-semibold)',
              color: 'rgb(var(--foreground))',
              marginBottom: '1rem',
            }}
          >
            Booking History
          </h2>

          {profile.bookings.length === 0 ? (
            <p style={{ color: 'rgb(var(--muted-foreground))', fontSize: 'var(--text-sm)', marginBottom: '2rem' }}>
              No bookings with your adventures yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {profile.bookings.map((b) => {
                const colours = statusColours[b.status] ?? statusColours.CANCELLED
                return (
                  <div
                    key={b.id}
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius)',
                      backgroundColor: 'rgb(var(--card))',
                      boxShadow: 'var(--shadow-card)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.4rem' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 'var(--weight-semibold)',
                          color: 'rgb(var(--foreground))',
                          fontSize: 'var(--text-base)',
                        }}
                      >
                        {b.location_name}
                      </span>
                      <span
                        style={{
                          flexShrink: 0,
                          display: 'inline-block',
                          padding: '0.15rem 0.6rem',
                          borderRadius: 'var(--radius-pill)',
                          fontSize: '0.7rem',
                          fontWeight: 'var(--weight-medium)',
                          backgroundColor: colours.bg,
                          color: colours.text,
                        }}
                      >
                        {b.status}
                      </span>
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))', marginBottom: '0.75rem' }}>
                      {formatDateRange(b.start_time, b.end_time)}
                    </p>
                    <Link
                      to={`/provider/messages/${b.id}`}
                      style={{
                        display: 'inline-block',
                        padding: '0.3rem 0.75rem',
                        borderRadius: 'var(--radius)',
                        border: '1px solid rgb(var(--accent) / 0.5)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--weight-medium)',
                        color: 'rgb(var(--accent))',
                        textDecoration: 'none',
                      }}
                    >
                      Message
                    </Link>
                  </div>
                )
              })}
            </div>
          )}

          {(() => {
            const eligibleBooking = [...profile.bookings]
              .filter((b) => b.status === 'BOOKED')
              .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())[0]
            return (
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'rgb(var(--card))',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <h2
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.1rem',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'rgb(var(--foreground))',
                    marginBottom: '1rem',
                  }}
                >
                  Reviews
                </h2>
                <ReviewList
                  targetId={profile.id}
                  targetType="customer"
                  refreshKey={reviewRefreshKey}
                />
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgb(var(--border))', paddingTop: '1.25rem' }}>
                  {eligibleBooking ? (
                    <ReviewForm
                      bookingId={eligibleBooking.id}
                      targetId={profile.id}
                      targetType="customer"
                      onSuccess={() => setReviewRefreshKey((k) => k + 1)}
                    />
                  ) : (
                    <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))', fontStyle: 'italic' }}>
                      No active bookings to review.
                    </p>
                  )}
                </div>
              </div>
            )
          })()}
        </>
      )}
    </div>
  )
}
