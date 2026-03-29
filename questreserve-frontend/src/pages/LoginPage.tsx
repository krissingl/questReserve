import { Button } from '@/components/ui/button'

/**
 * LoginPage — placeholder login page.
 * Real auth form is implemented in Phase 9.
 */
export function LoginPage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: 'rgb(var(--background))' }}
    >
      <div
        className="w-full max-w-sm rounded-lg p-8"
        style={{
          backgroundColor: 'rgb(var(--card))',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <h1
          className="mb-6 text-center text-2xl font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: 'rgb(var(--foreground))' }}
        >
          QuestReserve
        </h1>
        <p
          className="mb-6 text-center text-sm"
          style={{ color: 'rgb(var(--muted-foreground))' }}
        >
          Sign in to your account
        </p>
        <Button className="w-full" disabled>
          Sign In
        </Button>
        <p
          className="mt-4 text-center text-xs"
          style={{ color: 'rgb(var(--muted-foreground))' }}
        >
          Login form coming in Phase 9
        </p>
      </div>
    </main>
  )
}
