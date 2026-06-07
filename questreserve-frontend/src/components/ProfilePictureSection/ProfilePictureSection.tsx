import { useState, useRef } from 'react'
import { AvatarIcon } from '@/components/AvatarIcon/AvatarIcon'
import { ProfilePictureLightbox } from '@/components/ProfilePictureLightbox/ProfilePictureLightbox'

interface ProfilePictureSectionProps {
  currentUrl: string | null
  firstName: string
  lastName: string
  inputId: string
  uploadFn: (file: File) => Promise<unknown>
  onSuccess: () => void
}

export function ProfilePictureSection({
  currentUrl,
  firstName,
  lastName,
  inputId,
  uploadFn,
  onSuccess,
}: ProfilePictureSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    setSuccess(false)
    try {
      await uploadFn(file)
      setSuccess(true)
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      {lightboxOpen && currentUrl && (
        <ProfilePictureLightbox
          url={currentUrl}
          name={`${firstName} ${lastName}`}
          onClose={() => setLightboxOpen(false)}
        />
      )}
      {currentUrl ? (
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="View profile photo"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '50%' }}
        >
          <img
            src={currentUrl}
            alt="Profile"
            style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgb(var(--border))', display: 'block' }}
          />
        </button>
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
          id={inputId}
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
