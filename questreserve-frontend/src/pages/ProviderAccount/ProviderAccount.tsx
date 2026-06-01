import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { updateMyProfile, changePassword } from '@/api/provider.api'
import type { ProviderLayoutContext } from '@/layouts/ProviderLayout'

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

function UpdateEmailForm({ currentEmail, onSuccess }: { currentEmail: string; onSuccess: () => void }) {
  const [email, setEmail] = useState(currentEmail)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (email.trim() === currentEmail) { setError('Email is unchanged.'); return }
    setSubmitting(true)
    setError(null)
    setSuccess(false)
    try {
      await updateMyProfile({ email: email.trim() })
      setSuccess(true)
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update email.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1rem',
          fontWeight: 'var(--weight-semibold)',
          color: 'rgb(var(--foreground))',
          marginBottom: '1rem',
        }}
      >
        Update Email
      </h2>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="account-email" style={labelStyle}>New Email Address</label>
        <input
          id="account-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
      </div>
      {error && (
        <p style={{ marginBottom: '0.75rem', fontSize: 'var(--text-sm)', color: 'rgb(var(--destructive))' }}>
          {error}
        </p>
      )}
      {success && (
        <p style={{ marginBottom: '0.75rem', fontSize: 'var(--text-sm)', color: 'rgb(var(--success, 34 197 94))' }}>
          Email updated successfully.
        </p>
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
        {submitting ? 'Saving…' : 'Save Email'}
      </button>
    </form>
  )
}

function ChangePasswordSection() {
  const [open, setOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleOpen() {
    setOpen(true)
    setSuccess(false)
    setError(null)
  }

  function handleCancel() {
    setOpen(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError(null)
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError('New Password and Confirm New Password do not match.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await changePassword({ currentPassword, newPassword })
      setSuccess(true)
      setOpen(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to change password.')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleButtonStyle = {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    fontSize: 'var(--text-sm)',
    color: 'rgb(var(--muted-foreground))',
    position: 'absolute' as const,
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
  }

  return (
    <div>
      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1rem',
          fontWeight: 'var(--weight-semibold)',
          color: 'rgb(var(--foreground))',
          marginBottom: '1rem',
        }}
      >
        Password
      </h2>
      {success && !open && (
        <p style={{ marginBottom: '0.75rem', fontSize: 'var(--text-sm)', color: 'rgb(34 197 94)' }}>
          Password changed successfully.
        </p>
      )}
      {!open ? (
        <button
          type="button"
          onClick={handleOpen}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius)',
            backgroundColor: 'rgb(var(--accent))',
            color: 'rgb(var(--accent-foreground))',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-semibold)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Change Password
        </button>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="current-password" style={labelStyle}>Current Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="current-password"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                style={{ ...inputStyle, paddingRight: '3.5rem' }}
              />
              <button type="button" onClick={() => setShowCurrent((v) => !v)} style={toggleButtonStyle} aria-label={showCurrent ? 'Hide' : 'Show'}>
                {showCurrent ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="new-password" style={labelStyle}>New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="new-password"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                style={{ ...inputStyle, paddingRight: '3.5rem' }}
              />
              <button type="button" onClick={() => setShowNew((v) => !v)} style={toggleButtonStyle} aria-label={showNew ? 'Hide' : 'Show'}>
                {showNew ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="confirm-new-password" style={labelStyle}>Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirm-new-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ ...inputStyle, paddingRight: '3.5rem' }}
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)} style={toggleButtonStyle} aria-label={showConfirm ? 'Hide' : 'Show'}>
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          {error && (
            <p style={{ marginBottom: '0.75rem', fontSize: 'var(--text-sm)', color: 'rgb(var(--destructive))' }}>
              {error}
            </p>
          )}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
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
              {submitting ? 'Saving…' : 'Save Password'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: 'var(--radius)',
                backgroundColor: 'transparent',
                color: 'rgb(var(--muted-foreground))',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-regular)',
                border: '1px solid rgb(var(--border))',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

const sectionStyle = {
  padding: '1.5rem',
  borderRadius: 'var(--radius)',
  backgroundColor: 'rgb(var(--card))',
  boxShadow: 'var(--shadow-card)',
  marginBottom: '1.5rem',
}

export function ProviderAccount() {
  const { profile, profileLoading, profileError, refetchProfile } = useOutletContext<ProviderLayoutContext>()

  if (profileLoading) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading account…</p>
      </div>
    )
  }

  if (profileError || !profile) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'rgb(var(--destructive))' }}>Failed to load account details. Please try again.</p>
        <button
          type="button"
          onClick={refetchProfile}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius)',
            backgroundColor: 'rgb(var(--accent))',
            color: 'rgb(var(--accent-foreground))',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-semibold)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', width: '85%', minWidth: 'min(700px, 100%)', margin: '0 auto' }}>
      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.75rem',
          fontWeight: 'var(--weight-bold)',
          color: 'rgb(var(--foreground))',
          marginBottom: '1.75rem',
        }}
      >
        My Account
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
          Account Details
        </h2>
        <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '0.5rem 1.5rem', fontSize: 'var(--text-sm)' }}>
          <dt style={{ color: 'rgb(var(--muted-foreground))', fontWeight: 'var(--weight-medium)' }}>Name</dt>
          <dd style={{ color: 'rgb(var(--foreground))', margin: 0 }}>
            {profile.first_name} {profile.last_name}
          </dd>
          <dt style={{ color: 'rgb(var(--muted-foreground))', fontWeight: 'var(--weight-medium)' }}>Email</dt>
          <dd style={{ color: 'rgb(var(--foreground))', margin: 0 }}>{profile.email}</dd>
          {profile.organization_name && (
            <>
              <dt style={{ color: 'rgb(var(--muted-foreground))', fontWeight: 'var(--weight-medium)' }}>Organization</dt>
              <dd style={{ color: 'rgb(var(--foreground))', margin: 0 }}>{profile.organization_name}</dd>
            </>
          )}
        </dl>

        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgb(var(--border))', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 'var(--weight-medium)', color: 'rgb(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Plan</span>
            <span
              style={{
                display: 'inline-block',
                padding: '0.2rem 0.7rem',
                borderRadius: 'var(--radius)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-semibold)',
                backgroundColor: 'rgb(var(--card))',
                border: '1px solid rgb(var(--accent))',
                color: 'rgb(var(--accent))',
                letterSpacing: '0.04em',
              }}
            >
              {profile.plan}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 'var(--weight-medium)', color: 'rgb(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</span>
            <span
              style={{
                display: 'inline-block',
                padding: '0.2rem 0.7rem',
                borderRadius: 'var(--radius)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-semibold)',
                backgroundColor: 'rgb(var(--card))',
                border: profile.status === 'ACTIVE' ? '1px solid rgb(var(--accent))' : '1px solid rgb(180 83 9)',
                color: profile.status === 'ACTIVE' ? 'rgb(var(--accent))' : 'rgb(180 83 9)',
                letterSpacing: '0.04em',
              }}
            >
              {profile.status}
            </span>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgb(var(--border))' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '0.35rem 0.9rem',
              borderRadius: 'var(--radius)',
              border: '1px solid rgb(var(--border))',
              fontSize: 'var(--text-sm)',
              color: 'rgb(var(--muted-foreground))',
              cursor: 'not-allowed',
              userSelect: 'none',
            }}
          >
            Update Profile
          </span>
          <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'rgb(var(--muted-foreground))' }}>
            Profile editing (name, organization) is coming in a future update.
          </p>
        </div>
      </div>

      <div style={sectionStyle}>
        <UpdateEmailForm currentEmail={profile.email} onSuccess={refetchProfile} />
      </div>

      <div style={sectionStyle}>
        <ChangePasswordSection />
      </div>
    </div>
  )
}
