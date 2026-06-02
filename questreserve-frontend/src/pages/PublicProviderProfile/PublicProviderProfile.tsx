import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPublicProviderProfile } from '@/api/guest.api'
import type { PublicProviderProfile as PublicProviderProfileData } from '@/api/guest.api'
import { AvatarIcon } from '@/components/AvatarIcon/AvatarIcon'
import { DIFFICULTY_COLOURS } from '@/constants/difficulty'

export function PublicProviderProfile() {
  const { providerId } = useParams<{ providerId: string }>()
  const [profile, setProfile] = useState<PublicProviderProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <AvatarIcon firstName={profile.first_name} lastName={profile.last_name} size="md" pictureUrl={profile.profile_picture_url} />
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
        <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))', fontStyle: 'italic' }}>
          No bio yet.
        </p>
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
              <div style={{ padding: '1rem' }}>
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
                    }}
                  >
                    {loc.description}
                  </p>
                )}
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
