import { useState, useEffect, useRef } from 'react'
import { getMyCustomerProfile, updateMyCustomerProfile, uploadCustomerProfilePicture } from '@/api/customer.api'
import { AvatarIcon } from '@/components/AvatarIcon/AvatarIcon'
import type { CustomerProfile } from '@/api/customer.api'

const inputStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  borderRadius: 'var(--radius)',
  border: '1px solid rgb(var(--border))',
  fontSize: 'var(--text-sm)',
  backgroundColor: 'rgb(var(--background))',
  color: 'rgb(var(--foreground))',
  outline: 'none',
  boxSizing: 'border-box' as const,
}

const labelStyle = {
  display: 'block',
  marginBottom: '0.25rem',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--weight-medium)',
  color: 'rgb(var(--foreground))',
}

const sectionStyle = {
  padding: '1.5rem',
  borderRadius: 'var(--radius)',
  backgroundColor: 'rgb(var(--card))',
  boxShadow: 'var(--shadow-card)',
  marginBottom: '1.5rem',
}

function ProfilePictureSection({
  currentUrl,
  firstName,
  lastName,
  onSuccess,
}: {
  currentUrl: string | null
  firstName: string
  lastName: string
  onSuccess: (updated: CustomerProfile) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    setSuccess(false)
    try {
      const updated = await uploadCustomerProfilePicture(file)
      setSuccess(true)
      onSuccess(updated)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgb(var(--border))' }}>
      {currentUrl ? (
        <img
          src={currentUrl}
          alt="Profile"
          style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgb(var(--border))' }}
        />
      ) : (
        <AvatarIcon firstName={firstName} lastName={lastName} size="lg" />
      )}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          id="customer-profile-pic-input"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius)',
            backgroundColor: 'rgb(var(--accent))',
            color: 'rgb(var(--accent-foreground))',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-semibold)',
            border: 'none',
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.6 : 1,
          }}
        >
          {uploading ? 'Uploading…' : currentUrl ? 'Change Photo' : 'Upload Photo'}
        </button>
        {error && <p style={{ marginTop: '0.4rem', fontSize: 'var(--text-sm)', color: 'rgb(var(--destructive))' }}>{error}</p>}
        {success && <p style={{ marginTop: '0.4rem', fontSize: 'var(--text-sm)', color: 'rgb(34 197 94)' }}>Photo updated.</p>}
      </div>
    </div>
  )
}

function ProfileSection() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [bio, setBio] = useState('')
  const [bioSubmitting, setBioSubmitting] = useState(false)
  const [bioError, setBioError] = useState<string | null>(null)
  const [bioSuccess, setBioSuccess] = useState(false)

  useEffect(() => {
    getMyCustomerProfile()
      .then((p) => {
        setProfile(p)
        setFirstName(p.first_name)
        setLastName(p.last_name)
        setBio(p.bio ?? '')
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  function handlePictureSuccess(updated: CustomerProfile) {
    setProfile(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName.trim()) { setValidationError('First name is required.'); return }
    if (!lastName.trim()) { setValidationError('Last name is required.'); return }
    setValidationError(null)
    setSubmitting(true)
    setError(null)
    setSuccess(false)
    try {
      const updated = await updateMyCustomerProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      })
      setProfile(updated)
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleBioSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBioSubmitting(true)
    setBioError(null)
    setBioSuccess(false)
    try {
      const updated = await updateMyCustomerProfile({ bio: bio.trim() || null })
      setProfile(updated)
      setBio(updated.bio ?? '')
      setBioSuccess(true)
    } catch (err: unknown) {
      setBioError(err instanceof Error ? err.message : 'Failed to update bio.')
    } finally {
      setBioSubmitting(false)
    }
  }

  if (loading) {
    return (
      <p style={{ color: 'rgb(var(--muted-foreground))', fontSize: 'var(--text-sm)' }}>
        Loading profile…
      </p>
    )
  }

  return (
    <>
      {profile && (
        <ProfilePictureSection
          currentUrl={profile.profile_picture_url}
          firstName={profile.first_name}
          lastName={profile.last_name}
          onSuccess={handlePictureSuccess}
        />
      )}

      {profile && (
        <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '0.5rem 1.5rem', fontSize: 'var(--text-sm)', marginBottom: '1.25rem' }}>
          <dt style={{ color: 'rgb(var(--muted-foreground))', fontWeight: 'var(--weight-medium)' }}>Name</dt>
          <dd style={{ color: 'rgb(var(--foreground))', margin: 0 }}>{profile.first_name} {profile.last_name}</dd>
          <dt style={{ color: 'rgb(var(--muted-foreground))', fontWeight: 'var(--weight-medium)' }}>Email</dt>
          <dd style={{ color: 'rgb(var(--foreground))', margin: 0 }}>{profile.email}</dd>
        </dl>
      )}

      <form onSubmit={handleSubmit} style={{ paddingTop: '1.25rem', borderTop: '1px solid rgb(var(--border))' }}>
        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'rgb(var(--foreground))', marginBottom: '0.75rem' }}>
          Update Name
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <label htmlFor="customer-first-name" style={labelStyle}>First Name</label>
            <input
              id="customer-first-name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="customer-last-name" style={labelStyle}>Last Name</label>
            <input
              id="customer-last-name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
        </div>
        {validationError && (
          <p style={{ marginBottom: '0.75rem', fontSize: 'var(--text-sm)', color: 'rgb(var(--destructive))' }}>{validationError}</p>
        )}
        {error && (
          <p style={{ marginBottom: '0.75rem', fontSize: 'var(--text-sm)', color: 'rgb(var(--destructive))' }}>{error}</p>
        )}
        {success && (
          <p style={{ marginBottom: '0.75rem', fontSize: 'var(--text-sm)', color: 'rgb(34 197 94)' }}>Profile updated.</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius)',
            backgroundColor: 'rgb(var(--accent))',
            color: 'rgb(var(--accent-foreground))',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-semibold)',
            border: 'none',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? 'Saving…' : 'Update Profile'}
        </button>
      </form>

      <form onSubmit={handleBioSubmit} style={{ paddingTop: '1.25rem', marginTop: '1.25rem', borderTop: '1px solid rgb(var(--border))' }}>
        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'rgb(var(--foreground))', marginBottom: '0.5rem' }}>
          About
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))', marginBottom: '0.75rem' }}>
          Write a brief bio about yourself or your adventure party. Providers can see this when reviewing your booking.
        </p>
        <textarea
          id="customer-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          maxLength={600}
          placeholder="Tell providers about yourself or your group…"
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius)',
            border: '1px solid rgb(var(--border))',
            fontSize: 'var(--text-sm)',
            backgroundColor: 'rgb(var(--background))',
            color: 'rgb(var(--foreground))',
            resize: 'vertical',
            boxSizing: 'border-box' as const,
            outline: 'none',
            marginBottom: '0.75rem',
          }}
        />
        {bioError && (
          <p style={{ marginBottom: '0.75rem', fontSize: 'var(--text-sm)', color: 'rgb(var(--destructive))' }}>{bioError}</p>
        )}
        {bioSuccess && (
          <p style={{ marginBottom: '0.75rem', fontSize: 'var(--text-sm)', color: 'rgb(34 197 94)' }}>About updated.</p>
        )}
        <button
          type="submit"
          disabled={bioSubmitting}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius)',
            backgroundColor: 'rgb(var(--accent))',
            color: 'rgb(var(--accent-foreground))',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-semibold)',
            border: 'none',
            cursor: bioSubmitting ? 'not-allowed' : 'pointer',
            opacity: bioSubmitting ? 0.6 : 1,
          }}
        >
          {bioSubmitting ? 'Saving…' : 'Save About'}
        </button>
      </form>
    </>
  )
}

export function CustomerSettings() {
  return (
    <main className="p-8">
      <h1
        className="mb-6 text-2xl font-bold"
        style={{ fontFamily: 'var(--font-heading)', color: 'rgb(var(--foreground))' }}
      >
        Settings
      </h1>

      <div style={sectionStyle}>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1rem',
            fontWeight: 'var(--weight-semibold)',
            color: 'rgb(var(--foreground))',
            marginBottom: '1rem',
          }}
        >
          Profile
        </h2>
        <ProfileSection />
      </div>

      <div style={sectionStyle}>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1rem',
            fontWeight: 'var(--weight-semibold)',
            color: 'rgb(var(--foreground))',
            marginBottom: '0.5rem',
          }}
        >
          Password
        </h2>
        <p className="text-sm" style={{ color: 'rgb(var(--muted-foreground))' }}>
          Password reset is coming soon. Check back in a future update.
        </p>
      </div>
    </main>
  )
}
