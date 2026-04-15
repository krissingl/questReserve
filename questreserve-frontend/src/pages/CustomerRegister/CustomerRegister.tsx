import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/contexts/AuthContext'
import { registerEndUser, decodeToken, tokenTypeToRole } from '@/api/auth.api'
import {
  registerSchema,
  type RegisterFormValues,
} from '@/utils/schemas/auth.schemas'
import { extractApiError } from '@/utils/api-error'
import { splitDisplayName } from '@/utils/form-helpers'
import { Button } from '@/components/ui/button'

export function CustomerRegister() {
  const { loginWithToken } = useAuth()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setApiError(null)
    try {
      const { first_name, last_name } = splitDisplayName(values.displayName)

      const { token } = await registerEndUser({
        first_name,
        last_name,
        email: values.email,
        password: values.password,
      })

      const payload = decodeToken(token)
      if (!payload) throw new Error('Invalid token received from server')

      loginWithToken(
        token,
        { id: payload.sub, email: values.email, displayName: values.displayName },
        tokenTypeToRole(payload.type),
      )

      navigate('/customer')
    } catch (err: unknown) {
      setApiError(extractApiError(err, 'Registration failed. Please try again.'))
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
          Create Account
        </h1>
        <p
          className="mb-6 text-center text-sm"
          style={{ color: 'rgb(var(--muted-foreground))' }}
        >
          Join the adventure
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
              htmlFor="displayName"
              className="mb-1 block text-sm font-medium"
              style={{ color: 'rgb(var(--foreground))' }}
            >
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              autoComplete="name"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'rgb(var(--background))',
                color: 'rgb(var(--foreground))',
                borderColor: errors.displayName
                  ? 'rgb(var(--destructive))'
                  : 'rgb(var(--border))',
              }}
              {...register('displayName')}
            />
            {errors.displayName && (
              <p
                className="mt-1 text-xs"
                style={{ color: 'rgb(var(--destructive))' }}
              >
                {errors.displayName.message}
              </p>
            )}
          </div>

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

          <div className="mb-4">
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
              style={{ color: 'rgb(var(--foreground))' }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="w-full rounded-md border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'rgb(var(--background))',
                  color: 'rgb(var(--foreground))',
                  borderColor: errors.password
                    ? 'rgb(var(--destructive))'
                    : 'rgb(var(--border))',
                }}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-sm"
                style={{ color: 'rgb(var(--muted-foreground))' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && (
              <p
                className="mt-1 text-xs"
                style={{ color: 'rgb(var(--destructive))' }}
              >
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium"
              style={{ color: 'rgb(var(--foreground))' }}
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'rgb(var(--background))',
                color: 'rgb(var(--foreground))',
                borderColor: errors.confirmPassword
                  ? 'rgb(var(--destructive))'
                  : 'rgb(var(--border))',
              }}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p
                className="mt-1 text-xs"
                style={{ color: 'rgb(var(--destructive))' }}
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        <p
          className="mt-4 text-center text-sm"
          style={{ color: 'rgb(var(--muted-foreground))' }}
        >
          Already have an account?{' '}
          <Link
            to="/customer/login"
            className="font-medium underline-offset-4 hover:underline"
            style={{ color: 'rgb(var(--accent))' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
