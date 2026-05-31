import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DIFFICULTY_OPTIONS } from '@/types/domain'

const locationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'LEGENDARY'], {
    errorMap: () => ({ message: 'Please select a difficulty' }),
  }),
  cancellation_policy: z.string().min(1, 'Cancellation policy is required'),
})

export type LocationFormValues = z.infer<typeof locationSchema>

interface LocationFormProps {
  defaultValues?: Partial<LocationFormValues>
  onSubmit: (values: LocationFormValues) => Promise<void>
  submitLabel?: string
  apiError?: string | null
}

const inputStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  borderRadius: 'var(--radius)',
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

const errorStyle = {
  marginTop: '0.25rem',
  fontSize: '0.75rem',
  color: 'rgb(var(--destructive))',
}

export function LocationForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
  apiError,
}: LocationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      difficulty: defaultValues?.difficulty ?? undefined,
      cancellation_policy: defaultValues?.cancellation_policy ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {apiError && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius)',
            backgroundColor: 'rgb(var(--destructive) / 0.1)',
            color: 'rgb(var(--destructive))',
            fontSize: 'var(--text-sm)',
          }}
          role="alert"
        >
          {apiError}
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="loc-name" style={labelStyle}>
          Name
        </label>
        <input
          id="loc-name"
          type="text"
          style={{
            ...inputStyle,
            border: `1px solid ${errors.name ? 'rgb(var(--destructive))' : 'rgb(var(--border))'}`,
          }}
          {...register('name')}
        />
        {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="loc-description" style={labelStyle}>
          Description{' '}
          <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'rgb(var(--muted-foreground))' }}>
            (optional)
          </span>
        </label>
        <textarea
          id="loc-description"
          rows={4}
          style={{
            ...inputStyle,
            border: `1px solid rgb(var(--border))`,
            resize: 'vertical',
          }}
          {...register('description')}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="loc-difficulty" style={labelStyle}>
          Difficulty
        </label>
        <select
          id="loc-difficulty"
          style={{
            ...inputStyle,
            border: `1px solid ${errors.difficulty ? 'rgb(var(--destructive))' : 'rgb(var(--border))'}`,
          }}
          {...register('difficulty')}
        >
          <option value="">Select difficulty…</option>
          {DIFFICULTY_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        {errors.difficulty && <p style={errorStyle}>{errors.difficulty.message}</p>}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="loc-cancellation-policy" style={labelStyle}>
          Cancellation Policy
        </label>
        <textarea
          id="loc-cancellation-policy"
          rows={4}
          style={{
            ...inputStyle,
            border: `1px solid ${errors.cancellation_policy ? 'rgb(var(--destructive))' : 'rgb(var(--border))'}`,
            resize: 'vertical',
          }}
          {...register('cancellation_policy')}
        />
        {errors.cancellation_policy && (
          <p style={errorStyle}>{errors.cancellation_policy.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          padding: '0.6rem 1.5rem',
          borderRadius: 'var(--radius)',
          backgroundColor: 'rgb(var(--accent))',
          color: 'rgb(var(--accent-foreground))',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--weight-semibold)',
          border: 'none',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          opacity: isSubmitting ? 0.6 : 1,
        }}
      >
        {isSubmitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
