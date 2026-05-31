import { useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useMyLocation } from '@/hooks/useMyLocation'
import { useProviderLocationImages } from '@/hooks/useProviderLocationImages'
import { LocationForm } from '@/components/LocationForm/LocationForm'
import { updateLocation, deleteProviderLocationImage } from '@/api/provider.api'
import type { LocationFormValues } from '@/components/LocationForm/LocationForm'
import type { LocationImage } from '@/types/domain'

const MAX_GALLERY_IMAGES = 15

interface CoverImageSectionProps {
  currentImageUrl: string | null
}

function CoverImageSection({ currentImageUrl }: CoverImageSectionProps) {
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
        Cover Image
      </h3>

      {currentImageUrl && (
        <div
          style={{
            width: '100%',
            maxWidth: '320px',
            aspectRatio: '16 / 9',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            marginBottom: '0.75rem',
            backgroundColor: 'rgb(var(--background))',
          }}
        >
          <img
            src={currentImageUrl}
            alt="Current cover"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

      {!currentImageUrl && (
        <div
          style={{
            width: '100%',
            maxWidth: '320px',
            aspectRatio: '16 / 9',
            borderRadius: 'var(--radius)',
            backgroundColor: 'rgb(var(--background))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem',
            color: 'rgb(var(--muted-foreground))',
            fontSize: 'var(--text-sm)',
          }}
        >
          No cover image
        </div>
      )}

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

interface GalleryImageCardProps {
  image: LocationImage
  locationId: string
  onRemoved: () => void
}

function GalleryImageCard({ image, locationId, onRemoved }: GalleryImageCardProps) {
  const [removing, setRemoving] = useState(false)
  const [removeError, setRemoveError] = useState<string | null>(null)

  async function handleRemove() {
    if (!window.confirm('Remove this gallery image?')) return
    setRemoving(true)
    setRemoveError(null)
    try {
      await deleteProviderLocationImage(locationId, image.id)
      onRemoved()
    } catch {
      setRemoving(false)
      setRemoveError('Failed to remove image. Please try again.')
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        aspectRatio: '4 / 3',
        backgroundColor: 'rgb(var(--background))',
      }}
    >
      <img
        src={image.image_url}
        alt="Gallery"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      <button
        type="button"
        onClick={handleRemove}
        disabled={removing}
        style={{
          position: 'absolute',
          top: '0.4rem',
          right: '0.4rem',
          padding: '0.2rem 0.5rem',
          borderRadius: 'var(--radius)',
          backgroundColor: 'rgb(var(--destructive) / 0.85)',
          color: 'rgb(var(--primary-foreground, 255 255 255))',
          border: 'none',
          fontSize: '0.7rem',
          fontWeight: 'var(--weight-semibold)',
          cursor: removing ? 'not-allowed' : 'pointer',
          opacity: removing ? 0.6 : 1,
        }}
      >
        {removing ? '…' : 'Remove'}
      </button>
      {removeError && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '0.25rem 0.4rem',
            backgroundColor: 'rgb(var(--destructive) / 0.9)',
            color: 'rgb(var(--primary-foreground, 255 255 255))',
            fontSize: '0.65rem',
            textAlign: 'center',
          }}
        >
          {removeError}
        </div>
      )}
    </div>
  )
}

function GallerySection({
  locationId,
  images,
  onImagesChanged,
}: {
  locationId: string
  images: LocationImage[]
  onImagesChanged: () => void
}) {
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [pendingFileNames, setPendingFileNames] = useState<string[]>([])

  const totalCount = images.length + pendingFileNames.length
  const canAddMore = totalCount < MAX_GALLERY_IMAGES

  function handleAddClick() {
    if (!canAddMore) return
    galleryInputRef.current?.click()
  }

  function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file && totalCount < MAX_GALLERY_IMAGES) {
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
            ({totalCount}/{MAX_GALLERY_IMAGES})
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

      {images.length === 0 && pendingFileNames.length === 0 && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'rgb(var(--muted-foreground))', marginBottom: '0.75rem' }}>
          No gallery images yet.
        </p>
      )}

      {(images.length > 0 || pendingFileNames.length > 0) && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '0.5rem',
            marginBottom: '0.75rem',
          }}
        >
          {images.map((img) => (
            <GalleryImageCard
              key={img.id}
              image={img}
              locationId={locationId}
              onRemoved={onImagesChanged}
            />
          ))}
          {pendingFileNames.map((name, i) => (
            <div
              key={`pending-${i}`}
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

export function ProviderLocationEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: location, isLoading, error: fetchError } = useMyLocation(id ?? '')
  const { data: galleryImages, isLoading: imagesLoading, refetch: refetchImages } = useProviderLocationImages(id ?? '')
  const [apiError, setApiError] = useState<string | null>(null)

  async function handleSubmit(values: LocationFormValues) {
    if (!id) return
    setApiError(null)
    try {
      await updateLocation(id, {
        name: values.name,
        description: values.description || undefined,
        difficulty: values.difficulty,
        cancellation_policy: values.cancellation_policy,
      })
      navigate(`/provider/locations/${id}`)
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to update adventure. Please try again.')
    }
  }

  if (!id) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'rgb(var(--destructive))' }}>Invalid adventure ID.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading adventure…</p>
      </div>
    )
  }

  if (fetchError || !location) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'rgb(var(--destructive))' }}>
          Failed to load adventure. Please go back and try again.
        </p>
        <Link
          to="/provider/dashboard"
          style={{
            display: 'inline-block',
            marginTop: '1rem',
            color: 'rgb(var(--accent))',
            textDecoration: 'none',
            fontSize: 'var(--text-sm)',
          }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', minWidth: 'min(700px, 100%)', margin: '0 auto', width: '85%' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to={`/provider/locations/${id}`}
          style={{
            fontSize: 'var(--text-sm)',
            color: 'rgb(var(--muted-foreground))',
            textDecoration: 'none',
          }}
        >
          ← Back to Adventure
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
        Edit Adventure
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
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1rem',
            fontWeight: 'var(--weight-semibold)',
            color: 'rgb(var(--foreground))',
            marginBottom: '1.25rem',
          }}
        >
          Adventure Details
        </h2>
        <LocationForm
          defaultValues={{
            name: location.name,
            description: location.description ?? '',
            difficulty: location.difficulty,
            cancellation_policy: location.cancellation_policy,
          }}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          apiError={apiError}
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

        <CoverImageSection currentImageUrl={location.image_url} />

        {!imagesLoading && (
          <GallerySection
            locationId={id}
            images={galleryImages}
            onImagesChanged={refetchImages}
          />
        )}
      </div>
    </div>
  )
}
