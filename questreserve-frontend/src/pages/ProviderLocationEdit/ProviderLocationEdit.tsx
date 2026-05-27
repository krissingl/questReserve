import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useMyLocation } from '@/hooks/useMyLocation'
import { LocationForm } from '@/components/LocationForm/LocationForm'
import { updateLocation } from '@/api/provider.api'
import type { LocationFormValues } from '@/components/LocationForm/LocationForm'

export function ProviderLocationEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: location, isLoading, error: fetchError } = useMyLocation(id ?? '')
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
      setApiError(err instanceof Error ? err.message : 'Failed to update location. Please try again.')
    }
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
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
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
        }}
      >
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
    </div>
  )
}
