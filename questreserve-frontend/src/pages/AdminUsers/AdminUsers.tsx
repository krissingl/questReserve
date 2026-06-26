import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getAdminMe, registerAdminUser, type AdminProfile } from '@/api/admin.api'
import {
  createAdminSchema,
  type CreateAdminFormValues,
} from '@/utils/schemas/admin.schemas'
import { Button } from '@/components/ui/button'

const ROLE_OPTIONS = ['PLATFORM_ADMIN', 'CLIENT_SUCCESS', 'SUPERUSER'] as const

function is409(err: unknown): boolean {
  return (
    err !== null &&
    typeof err === 'object' &&
    'response' in err &&
    (err as { response?: { status?: unknown } }).response?.status === 409
  )
}

export function AdminUsers() {
  const [me, setMe] = useState<AdminProfile | null>(null)
  const [meLoading, setMeLoading] = useState(true)
  const [success, setSuccess] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getAdminMe()
      .then((data) => { if (!cancelled) { setMe(data); setMeLoading(false) } })
      .catch(() => { if (!cancelled) setMeLoading(false) })
    return () => { cancelled = true }
  }, [])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAdminFormValues>({
    resolver: zodResolver(createAdminSchema),
  })

  const onSubmit = async (values: CreateAdminFormValues) => {
    setApiError(null)
    setSuccess(null)
    try {
      await registerAdminUser(values)
      setSuccess(`Admin account created for ${values.email}.`)
      reset()
    } catch (err: unknown) {
      if (is409(err)) {
        setApiError('This email is already registered.')
      } else {
        setApiError('Something went wrong. Please try again.')
      }
    }
  }

  if (meLoading) {
    return (
      <main className="p-8">
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading…</p>
      </main>
    )
  }

  if (!me || me.role !== 'SUPERUSER') {
    return (
      <main className="p-8">
        <h1
          className="mb-4 text-2xl font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: 'rgb(var(--foreground))' }}
        >
          Admin Users
        </h1>
        <p style={{ color: 'rgb(var(--muted-foreground))' }}>
          This section is restricted to Superusers.
        </p>
      </main>
    )
  }

  return (
    <main className="p-8">
      <h1
        className="mb-6 text-2xl font-bold"
        style={{ fontFamily: 'var(--font-heading)', color: 'rgb(var(--foreground))' }}
      >
        Create Admin Account
      </h1>

      {success && (
        <div
          className="mb-4 rounded-md px-4 py-3 text-sm"
          role="status"
          style={{
            backgroundColor: 'rgb(var(--success) / 0.15)',
            color: 'rgb(var(--success))',
            border: '1px solid rgb(var(--success) / 0.4)',
          }}
        >
          {success}
        </div>
      )}

      {apiError && (
        <div
          className="mb-4 rounded-md px-4 py-3 text-sm"
          role="alert"
          style={{
            backgroundColor: 'rgb(var(--destructive) / 0.15)',
            color: 'rgb(var(--destructive-foreground))',
            border: '1px solid rgb(var(--destructive) / 0.4)',
          }}
        >
          {apiError}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        {(
          [
            { id: 'first_name', label: 'First Name', type: 'text', autoComplete: 'given-name' },
            { id: 'last_name', label: 'Last Name', type: 'text', autoComplete: 'family-name' },
            { id: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
            { id: 'password', label: 'Password', type: 'password', autoComplete: 'new-password' },
          ] as const
        ).map(({ id, label, type, autoComplete }) => (
          <div key={id}>
            <label
              htmlFor={id}
              className="mb-1 block text-sm font-medium"
              style={{ color: 'rgb(var(--foreground))' }}
            >
              {label}
            </label>
            <input
              id={id}
              type={type}
              autoComplete={autoComplete}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'rgb(var(--background))',
                color: 'rgb(var(--foreground))',
                borderColor: errors[id]
                  ? 'rgb(var(--destructive))'
                  : 'rgb(var(--border))',
              }}
              {...register(id)}
            />
            {errors[id] && (
              <p className="mt-1 text-xs" style={{ color: 'rgb(var(--destructive))' }}>
                {errors[id]?.message}
              </p>
            )}
          </div>
        ))}

        <div>
          <label
            htmlFor="role"
            className="mb-1 block text-sm font-medium"
            style={{ color: 'rgb(var(--foreground))' }}
          >
            Role
          </label>
          <select
            id="role"
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'rgb(var(--background))',
              color: 'rgb(var(--foreground))',
              borderColor: errors.role ? 'rgb(var(--destructive))' : 'rgb(var(--border))',
            }}
            {...register('role')}
          >
            <option value="">Select a role…</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {errors.role && (
            <p className="mt-1 text-xs" style={{ color: 'rgb(var(--destructive))' }}>
              {errors.role.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? 'Creating…' : 'Create Account'}
        </Button>
      </form>
    </main>
  )
}
