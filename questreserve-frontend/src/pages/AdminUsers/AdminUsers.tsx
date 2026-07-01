import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  getAdminMe,
  listAdminUsers,
  registerAdminUser,
  updateAdminUser,
  type AdminProfile,
  type AdminRole,
  type AdminUserView,
} from '@/api/admin.api'
import {
  createAdminSchema,
  type CreateAdminFormValues,
} from '@/utils/schemas/admin.schemas'
import { Button } from '@/components/ui/button'

const ROLE_OPTIONS: AdminRole[] = ['PLATFORM_ADMIN', 'CLIENT_SUCCESS', 'SUPERUSER']

function is409(err: unknown): boolean {
  return (
    err !== null &&
    typeof err === 'object' &&
    'response' in err &&
    (err as { response?: { status?: unknown } }).response?.status === 409
  )
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (
    err !== null &&
    typeof err === 'object' &&
    'response' in err &&
    typeof (err as { response?: { data?: { error?: unknown } } }).response?.data?.error === 'string'
  ) {
    return (err as { response: { data: { error: string } } }).response.data.error
  }
  return fallback
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function AdminUsers() {
  const [me, setMe] = useState<AdminProfile | null>(null)
  const [meLoading, setMeLoading] = useState(true)
  const [success, setSuccess] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const [users, setUsers] = useState<AdminUserView[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    getAdminMe()
      .then((data) => { if (!cancelled) { setMe(data); setMeLoading(false) } })
      .catch(() => { if (!cancelled) setMeLoading(false) })
    return () => { cancelled = true }
  }, [])

  const loadUsers = () => {
    setUsersLoading(true)
    setUsersError(null)
    listAdminUsers()
      .then((data) => { setUsers(data); setUsersLoading(false) })
      .catch(() => { setUsersError('Failed to load admin users.'); setUsersLoading(false) })
  }

  useEffect(() => {
    if (me?.role === 'SUPERUSER') loadUsers()
  }, [me])

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
      loadUsers()
    } catch (err: unknown) {
      if (is409(err)) {
        setApiError('This email is already registered.')
      } else {
        setApiError('Something went wrong. Please try again.')
      }
    }
  }

  const handleRoleChange = async (user: AdminUserView, role: AdminRole) => {
    if (role === user.role) return
    setPendingUserId(user.id)
    setRowError(null)
    try {
      const updated = await updateAdminUser(user.id, { role })
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    } catch (err) {
      setRowError({ id: user.id, message: extractErrorMessage(err, 'Failed to update role.') })
    } finally {
      setPendingUserId(null)
    }
  }

  const handleToggleActive = async (user: AdminUserView) => {
    const nextActive = !user.is_active
    const confirmed = window.confirm(
      nextActive ? `Reactivate ${user.email}?` : `Deactivate ${user.email}? They will no longer be able to sign in.`
    )
    if (!confirmed) return

    setPendingUserId(user.id)
    setRowError(null)
    try {
      const updated = await updateAdminUser(user.id, { is_active: nextActive })
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    } catch (err) {
      setRowError({ id: user.id, message: extractErrorMessage(err, 'Failed to update account.') })
    } finally {
      setPendingUserId(null)
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
        Admin Users
      </h1>

      <section className="mb-10">
        <h2
          className="mb-3 text-base font-semibold"
          style={{ color: 'rgb(var(--foreground))' }}
        >
          All Admin Accounts
        </h2>

        {usersLoading && (
          <p style={{ color: 'rgb(var(--muted-foreground))' }}>Loading admin users…</p>
        )}

        {usersError && (
          <p style={{ color: 'rgb(var(--destructive))' }}>{usersError}</p>
        )}

        {!usersLoading && !usersError && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgb(var(--border))' }}>
                  {['Name', 'Email', 'Role', 'Status', 'Since', ''].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '0.5rem 0.75rem',
                        textAlign: 'left',
                        fontWeight: 'var(--weight-semibold)',
                        color: 'rgb(var(--muted-foreground))',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === me.id
                  const isPending = pendingUserId === u.id
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgb(var(--border) / 0.5)' }}>
                      <td style={{ padding: '0.625rem 0.75rem', color: 'rgb(var(--foreground))' }}>
                        {u.first_name} {u.last_name}
                        {isSelf && (
                          <span style={{ marginLeft: '0.4rem', color: 'rgb(var(--muted-foreground))', fontSize: '0.75rem' }}>
                            (you)
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem', color: 'rgb(var(--foreground))' }}>
                        {u.email}
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem' }}>
                        <select
                          value={u.role}
                          disabled={isPending}
                          onChange={(e) => handleRoleChange(u, e.target.value as AdminRole)}
                          className="rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-2"
                          style={{
                            backgroundColor: 'rgb(var(--background))',
                            color: 'rgb(var(--foreground))',
                            borderColor: 'rgb(var(--border))',
                          }}
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem' }}>
                        <span
                          className="rounded px-2 py-0.5 text-xs font-semibold"
                          style={{
                            backgroundColor: u.is_active
                              ? 'rgb(var(--success) / 0.18)'
                              : 'rgb(var(--destructive) / 0.18)',
                            color: u.is_active ? 'rgb(var(--success))' : 'rgb(var(--destructive))',
                          }}
                        >
                          {u.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                        </span>
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem', color: 'rgb(var(--muted-foreground))' }}>
                        {formatDate(u.created_at)}
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem' }}>
                        <button
                          type="button"
                          disabled={isPending || isSelf}
                          onClick={() => handleToggleActive(u)}
                          title={isSelf ? 'You cannot deactivate your own account' : undefined}
                          style={{
                            padding: '0.3rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 'var(--weight-semibold)',
                            border: '1px solid rgb(var(--border))',
                            cursor: isPending || isSelf ? 'not-allowed' : 'pointer',
                            opacity: isPending || isSelf ? 0.5 : 1,
                            backgroundColor: 'rgb(var(--card))',
                            color: u.is_active ? 'rgb(var(--destructive))' : 'rgb(var(--success))',
                          }}
                        >
                          {u.is_active ? 'Deactivate' : 'Reactivate'}
                        </button>
                        {rowError && rowError.id === u.id && (
                          <p className="mt-1 text-xs" style={{ color: 'rgb(var(--destructive))' }}>
                            {rowError.message}
                          </p>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2
          className="mb-4 text-base font-semibold"
          style={{ color: 'rgb(var(--foreground))' }}
        >
          Create Admin Account
        </h2>

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
      </section>
    </main>
  )
}
