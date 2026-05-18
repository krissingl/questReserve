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

function GalleryImg({
  img,
  index,
  locationName,
  onOpen,
}: {
  img: LocationImage
  index: number
  locationName: string
  onOpen: (i: number) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      aria-label={`View image ${index + 1} for ${locationName}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        backgroundColor: 'rgb(var(--card))',
        overflow: 'hidden',
      }}
    >
      <img
        src={img.image_url}
        alt={`${locationName} — photo ${index + 1}`}
        loading="lazy"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          transition: 'opacity 0.15s ease',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.85' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '1' }}
      />
    </button>
  )
}

function MosaicGrid({
  images,
  locationName,
  onOpen,
}: {
  images: LocationImage[]
  locationName: string
  onOpen: (i: number) => void
}) {
  const shown = images.slice(0, 5)
  const [main, ...rest] = shown
  const hasMore = images.length > shown.length
  const remaining = images.length - shown.length

  if (shown.length === 1) {
    return (
      <div style={{ position: 'relative', height: '100%', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <GalleryImg img={main} index={0} locationName={locationName} onOpen={onOpen} />
      </div>
    )
  }

  const rightCols = rest.length >= 3 ? 2 : 1
  const rightRows = Math.ceil(rest.length / rightCols)

  return (
    <div style={{ display: 'flex', gap: '0.25rem', height: '100%', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      <div style={{ flex: '0 0 60%', position: 'relative' }}>
        <GalleryImg img={main} index={0} locationName={locationName} onOpen={onOpen} />
      </div>
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: `repeat(${rightCols}, 1fr)`,
          gridTemplateRows: `repeat(${rightRows}, 1fr)`,
          gap: '0.25rem',
        }}
      >
        {rest.map((img, i) => {
          const isLastVisible = i === rest.length - 1 && hasMore
          return (
            <div key={img.id} style={{ position: 'relative' }}>
              <GalleryImg img={img} index={i + 1} locationName={locationName} onOpen={onOpen} />
              {isLastVisible && (
                <button
                  type="button"
                  onClick={() => onOpen(i + 1)}
                  aria-label={`See all ${images.length} photos`}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 1,
                    backgroundColor: 'rgba(0,0,0,0.55)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-semibold)',
                    gap: '0.3rem',
                  }}
                >
                  +{remaining} more
                </button>
              )}
            </div>
          )
        })}
      </div>
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
      <div style={{ height: '100%' }}>
        <MosaicGrid images={images} locationName={locationName} onOpen={setLightboxIndex} />
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
