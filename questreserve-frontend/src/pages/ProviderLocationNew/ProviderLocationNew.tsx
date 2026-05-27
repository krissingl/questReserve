import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LocationForm } from '@/components/LocationForm/LocationForm'
import { createLocation } from '@/api/provider.api'
import type { LocationFormValues } from '@/components/LocationForm/LocationForm'

export function ProviderLocationNew() {
  const navigate = useNavigate()
  const [apiError, setApiError] = useState<string | null>(null)

  async function handleSubmit(values: LocationFormValues) {
    setApiError(null)
    try {
      const location = await createLocation({
        name: values.name,
        description: values.description || undefined,
        difficulty: values.difficulty,
        cancellation_policy: values.cancellation_policy,
      })
      navigate(`/provider/locations/${location.id}`)
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to create location. Please try again.')
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
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
        Add New Location
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
          onSubmit={handleSubmit}
          submitLabel="Create Location"
          apiError={apiError}
        />
      </div>
    </div>
  )
}
