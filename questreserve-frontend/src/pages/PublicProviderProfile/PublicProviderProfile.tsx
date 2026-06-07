import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPublicProviderProfile } from '@/api/guest.api'
import type { PublicProviderProfile as PublicProviderProfileData } from '@/api/guest.api'
import { AvatarIcon } from '@/components/AvatarIcon/AvatarIcon'
import { ProfilePictureLightbox } from '@/components/ProfilePictureLightbox/ProfilePictureLightbox'
import { DIFFICULTY_COLOURS } from '@/constants/difficulty'

export function PublicProviderProfile() {
  const { providerId } = useParams<{ providerId: string }>()
  const [profile, setProfile] = useState<PublicProviderProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    if (!providerId) return
    setLoading(true)
    getPublicProviderProfile(providerId)
      .then((data) => {
        setProfile(data)
        setLoading(false)
      })
      .catch((err: unknown) => {
        const status =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { status?: number } }).response?.status
            : undefined
        if (status === 404) {
          setNotFound(true)
        }
        setLoading(false)
      })
  }, [providerId])

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading provider profile…</p>
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'rgb(var(--destructive))' }}>Provider not found.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', width: '85%', minWidth: 'min(700px, 100%)', margin: '0 auto' }}>
      {lightboxOpen && profile.profile_picture_url && (
        <ProfilePictureLightbox
          url={profile.profile_picture_url}
          name={`${profile.first_name} ${profile.last_name}`}
          onClose={() => setLightboxOpen(false)}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
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
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.75rem',
              fontWeight: 'var(--weight-bold)',
              color: 'rgb(var(--foreground))',
              marginBottom: '0.25rem',
            }}
          >
            {profile.first_name} {profile.last_name}
          </h1>
          {profile.organization_name && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))' }}>
              {profile.organization_name}
            </p>
          )}
        </div>
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
        Adventures
      </h2>

      {profile.locations.length === 0 ? (
        <p style={{ color: 'rgb(var(--muted-foreground))', fontSize: 'var(--text-sm)' }}>
          No adventures available at this time.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {profile.locations.map((loc) => (
            <div
              key={loc.id}
              style={{
                borderRadius: 'var(--radius)',
                backgroundColor: 'rgb(var(--card))',
                boxShadow: 'var(--shadow-card)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  height: '160px',
                  backgroundColor: 'rgb(var(--surface))',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {loc.image_url ? (
                  <img
                    src={loc.image_url}
                    alt={loc.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ color: 'rgb(var(--muted-foreground))', fontSize: 'var(--text-sm)' }}>
                    No image
                  </span>
                )}
              </div>
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 'var(--weight-semibold)',
                      color: DIFFICULTY_COLOURS[loc.difficulty],
                      border: `1px solid ${DIFFICULTY_COLOURS[loc.difficulty]}`,
                      borderRadius: 'var(--radius)',
                      padding: '0.1rem 0.5rem',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {loc.difficulty}
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1rem',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'rgb(var(--foreground))',
                    marginBottom: '0.5rem',
                  }}
                >
                  {loc.name}
                </h3>
                {loc.description && (
                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'rgb(var(--muted-foreground))',
                      marginBottom: '0.75rem',
                      lineHeight: 1.5,
                      flex: 1,
                    }}
                  >
                    {loc.description}
                  </p>
                )}
                <div style={{ marginTop: 'auto', paddingTop: loc.description ? 0 : '0.75rem' }}>
                  <Link
                    to={`/locations/${loc.id}`}
                    style={{
                      display: 'inline-block',
                      padding: '0.4rem 1rem',
                      borderRadius: 'var(--radius)',
                      backgroundColor: 'rgb(var(--accent))',
                      color: 'rgb(var(--accent-foreground))',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--weight-semibold)',
                      textDecoration: 'none',
                    }}
                  >
                    Book This Adventure
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius)',
          backgroundColor: 'rgb(var(--card))',
          boxShadow: 'var(--shadow-card)',
          marginTop: '2rem',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.1rem',
            fontWeight: 'var(--weight-semibold)',
            color: 'rgb(var(--foreground))',
            marginBottom: '0.5rem',
          }}
        >
          Reviews
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))', fontStyle: 'italic' }}>
          No reviews yet.
        </p>
      </div>
    </div>
  )
}
