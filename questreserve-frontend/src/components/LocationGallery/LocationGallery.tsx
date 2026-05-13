import { useState } from 'react'
import type { LocationImage } from '@/types/domain'

interface LocationGalleryProps {
  images: LocationImage[]
  locationName: string
}

interface LightboxProps {
  images: LocationImage[]
  startIndex: number
  locationName: string
  onClose: () => void
}

function Lightbox({ images, startIndex, locationName, onClose }: LightboxProps) {
  const [index, setIndex] = useState(startIndex)

  function prev() {
    setIndex((i) => (i - 1 + images.length) % images.length)
  }
  function next() {
    setIndex((i) => (i + 1) % images.length)
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') prev()
    else if (e.key === 'ArrowRight') next()
    else if (e.key === 'Escape') onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Image gallery for ${locationName}`}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close gallery"
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'rgba(255,255,255,0.15)',
          border: 'none',
          borderRadius: '50%',
          width: '2.5rem',
          height: '2.5rem',
          color: '#fff',
          fontSize: '1.25rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ✕
      </button>

      {images.length > 1 && (
        <button
          type="button"
          onClick={prev}
          aria-label="Previous image"
          style={{
            position: 'absolute',
            left: '1rem',
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            borderRadius: '50%',
            width: '2.5rem',
            height: '2.5rem',
            color: '#fff',
            fontSize: '1.25rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ‹
        </button>
      )}

      <img
        src={images[index].image_url}
        alt={`${locationName} — image ${index + 1} of ${images.length}`}
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          objectFit: 'contain',
          borderRadius: '4px',
          pointerEvents: 'none',
        }}
      />

      {images.length > 1 && (
        <button
          type="button"
          onClick={next}
          aria-label="Next image"
          style={{
            position: 'absolute',
            right: '1rem',
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            borderRadius: '50%',
            width: '2.5rem',
            height: '2.5rem',
            color: '#fff',
            fontSize: '1.25rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ›
        </button>
      )}

      <span
        style={{
          position: 'absolute',
          bottom: '1rem',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '0.8rem',
        }}
      >
        {index + 1} / {images.length}
      </span>
    </div>
  )
}

export function LocationGallery({ images, locationName }: LocationGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (images.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '200px',
          backgroundColor: 'rgb(var(--card))',
          borderRadius: 'var(--radius)',
          color: 'rgb(var(--muted-foreground))',
          fontSize: 'var(--text-sm)',
        }}
      >
        No images available
      </div>
    )
  }

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '0.5rem',
        }}
      >
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setLightboxIndex(i)}
            aria-label={`View image ${i + 1} of ${images.length} for ${locationName}`}
            style={{
              display: 'block',
              position: 'relative',
              paddingTop: '66.67%',
              overflow: 'hidden',
              borderRadius: 'var(--radius)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: 'rgb(var(--card))',
            }}
          >
            <img
              src={img.image_url}
              alt={`${locationName} — photo ${i + 1}`}
              loading="lazy"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.85' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '1' }}
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          startIndex={lightboxIndex}
          locationName={locationName}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}
