import { useState, useEffect } from 'react'
import { getMyCustomerProfile, updateMyCustomerProfile } from '@/api/customer.api'
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

function UpdateProfileSection() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    getMyCustomerProfile()
      .then((p) => {
        setProfile(p)
        setFirstName(p.first_name)
        setLastName(p.last_name)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

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
        <UpdateProfileSection />
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
