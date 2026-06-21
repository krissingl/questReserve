import { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LocationSurvey, type SurveyState } from '@/components/LocationSurvey/LocationSurvey'
import { createLocation } from '@/api/provider.api'
import type { CreateLocationPayload } from '@/api/provider.api'

const MAX_GALLERY_IMAGES = 15

function NewCoverImageSection() {
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  function handleChooseCover() {
    coverInputRef.current?.click()
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setSelectedFileName(file.name)
  }

  return (
    <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgb(var(--border))' }}>
      <h3
        style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--weight-semibold)',
          color: 'rgb(var(--foreground))',
          marginBottom: '0.75rem',
        }}
      >
        Cover Image{' '}
        <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'rgb(var(--muted-foreground))' }}>
          (optional)
        </span>
      </h3>

      <input
        ref={coverInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleCoverChange}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleChooseCover}
          style={{
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius)',
            border: '1px solid rgb(var(--border))',
            backgroundColor: 'transparent',
            color: 'rgb(var(--foreground))',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-medium)',
            cursor: 'pointer',
          }}
        >
          Choose Cover Image
        </button>
        {selectedFileName && (
          <span style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))' }}>
            {selectedFileName}
          </span>
        )}
      </div>
      <p style={{ marginTop: '0.4rem', fontSize: '0.72rem', color: 'rgb(var(--muted-foreground))' }}>
        Image selection is a preview only — upload will be available in a future update.
      </p>
    </div>
  )
}

function NewGallerySection() {
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [pendingFileNames, setPendingFileNames] = useState<string[]>([])

  const canAddMore = pendingFileNames.length < MAX_GALLERY_IMAGES

  function handleAddClick() {
    if (!canAddMore) return
    galleryInputRef.current?.click()
  }

  function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file && pendingFileNames.length < MAX_GALLERY_IMAGES) {
      setPendingFileNames((prev) => [...prev, file.name])
    }
    if (galleryInputRef.current) galleryInputRef.current.value = ''
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <h3
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-semibold)',
            color: 'rgb(var(--foreground))',
            margin: 0,
          }}
        >
          Gallery Images{' '}
          <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'rgb(var(--muted-foreground))' }}>
            (optional, {pendingFileNames.length}/{MAX_GALLERY_IMAGES})
          </span>
        </h3>
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleGalleryChange}
        />
        <button
          type="button"
          onClick={handleAddClick}
          disabled={!canAddMore}
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius)',
            border: '1px solid rgb(var(--border))',
            backgroundColor: canAddMore ? 'transparent' : 'rgb(var(--muted))',
            color: canAddMore ? 'rgb(var(--foreground))' : 'rgb(var(--muted-foreground))',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-medium)',
            cursor: canAddMore ? 'pointer' : 'not-allowed',
          }}
        >
          + Add Image
        </button>
      </div>

      {pendingFileNames.length === 0 && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))', marginBottom: '0.75rem' }}>
          No gallery images selected.
        </p>
      )}

      {pendingFileNames.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '0.5rem',
            marginBottom: '0.75rem',
          }}
        >
          {pendingFileNames.map((name, i) => (
            <div
              key={i}
              style={{
                borderRadius: 'var(--radius)',
                aspectRatio: '4 / 3',
                backgroundColor: 'rgb(var(--background))',
                border: '1px dashed rgb(var(--border))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
              }}
            >
              <span style={{ fontSize: '0.7rem', color: 'rgb(var(--muted-foreground))', textAlign: 'center', wordBreak: 'break-all' }}>
                {name}
              </span>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: '0.72rem', color: 'rgb(var(--muted-foreground))' }}>
        Image uploads are a preview only — upload will be available in a future update.
      </p>
    </div>
  )
}

export function ProviderLocationNew() {
  const navigate = useNavigate()
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [surveyState, setSurveyState] = useState<SurveyState>({})

  function handleChange(updates: Partial<SurveyState>) {
    setSurveyState((prev) => ({ ...prev, ...updates }))
  }

  async function handleSubmit() {
    if (!surveyState.name?.trim() || !surveyState.difficulty) {
      setApiError('Name and Difficulty are required. Please complete Step 1.')
      return
    }
    setApiError(null)
    setIsSubmitting(true)
    try {
      const payload: CreateLocationPayload = {
        ...surveyState,
        name: surveyState.name.trim(),
        description: surveyState.description || undefined,
        difficulty: surveyState.difficulty,
        cancellation_policy: surveyState.cancellation_policy ?? '',
      }
      const location = await createLocation(payload)
      navigate(`/provider/locations/${location.id}`)
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to create adventure. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', minWidth: 'min(700px, 100%)', margin: '0 auto', width: '85%' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/provider/dashboard"
          style={{
            fontSize: 'var(--text-sm)',
            color: 'rgb(var(--muted-foreground))',
            textDecoration: 'none',
          }}
        >
          ← Back to Dashboard
        </Link>
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.75rem',
          fontWeight: 'var(--weight-bold)',
          color: 'rgb(var(--foreground))',
          marginBottom: '1.5rem',
        }}
      >
        Add New Adventure
      </h1>

      <div
        style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius)',
          backgroundColor: 'rgb(var(--card))',
          boxShadow: 'var(--shadow-card)',
          marginBottom: '1.5rem',
        }}
      >
        <LocationSurvey
          formState={surveyState}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel="Publish Location"
          apiError={apiError}
          isSubmitting={isSubmitting}
        />
      </div>

      <div
        style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius)',
          backgroundColor: 'rgb(var(--card))',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1rem',
            fontWeight: 'var(--weight-semibold)',
            color: 'rgb(var(--foreground))',
            marginBottom: '1.25rem',
          }}
        >
          Images
        </h2>
        <NewCoverImageSection />
        <NewGallerySection />
      </div>
    </div>
  )
}
