import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/contexts/AuthContext'
import {
  loginSchema,
  type LoginFormValues,
} from '@/utils/schemas/auth.schemas'
import { Button } from '@/components/ui/button'

export function ProviderLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginFormValues) => {
    setApiError(null)
    try {
      await login(values.email, values.password, 'provider')
      navigate('/provider')
    } catch {
      setApiError('Invalid email or password. Please try again.')
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: 'rgb(var(--background))' }}
    >
      <div
        className="w-full max-w-sm rounded-lg p-8"
        style={{
          backgroundColor: 'rgb(var(--surface))',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <h1
          className="mb-2 text-center text-2xl font-bold"
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'rgb(var(--foreground))',
          }}
        >
          Dungeon Owner Login
        </h1>
        <p
          className="mb-6 text-center text-sm"
          style={{ color: 'rgb(var(--muted-foreground))' }}
        >
          Sign in to your provider account
        </p>

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

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium"
              style={{ color: 'rgb(var(--foreground))' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'rgb(var(--background))',
                color: 'rgb(var(--foreground))',
                borderColor: errors.email
                  ? 'rgb(var(--destructive))'
                  : 'rgb(var(--border))',
              }}
              {...register('email')}
            />
            {errors.email && (
              <p
                className="mt-1 text-xs"
                style={{ color: 'rgb(var(--destructive))' }}
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
              style={{ color: 'rgb(var(--foreground))' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'rgb(var(--background))',
                color: 'rgb(var(--foreground))',
                borderColor: errors.password
                  ? 'rgb(var(--destructive))'
                  : 'rgb(var(--border))',
              }}
              {...register('password')}
            />
            {errors.password && (
              <p
                className="mt-1 text-xs"
                style={{ color: 'rgb(var(--destructive))' }}
              >
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <p
          className="mt-4 text-center text-sm"
          style={{ color: 'rgb(var(--muted-foreground))' }}
        >
          New provider?{' '}
          <Link
            to="/provider/register"
            className="font-medium underline-offset-4 hover:underline"
            style={{ color: 'rgb(var(--accent))' }}
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  )
}
