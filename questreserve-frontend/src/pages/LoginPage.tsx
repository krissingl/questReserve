import { CrossRoleLink } from '@/components/CrossRoleLink'
import { Button } from '@/components/ui/button'

export function LoginPage() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-8 px-4"
      style={{ backgroundColor: 'rgb(var(--background))' }}
    >
      <div className="text-center">
        <h1
          className="mb-2 text-4xl font-bold tracking-wide"
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'rgb(var(--foreground))',
          }}
        >
          QuestReserve
        </h1>
        <p
          className="text-sm"
          style={{ color: 'rgb(var(--muted-foreground))' }}
        >
          The dungeon booking platform for adventurers and dungeon owners
        </p>
      </div>

      <div
        className="w-full max-w-sm rounded-lg p-8"
        style={{
          backgroundColor: 'rgb(var(--surface))',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <h2
          className="mb-6 text-center text-lg font-semibold"
          style={{ color: 'rgb(var(--foreground))' }}
        >
          How would you like to sign in?
        </h2>

        <div className="flex flex-col gap-3">
          <Button asChild className="w-full" size="lg">
            <CrossRoleLink to="/customer/login">Customer Login</CrossRoleLink>
          </Button>
          <Button asChild variant="outline" className="w-full" size="lg">
            <CrossRoleLink to="/provider/login">Provider Login</CrossRoleLink>
          </Button>
        </div>

        <div
          className="mt-6 border-t pt-4 text-center text-xs"
          style={{
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--muted-foreground))',
          }}
        >
          New here?{' '}
          <CrossRoleLink
            to="/customer/register"
            className="underline-offset-4 hover:underline"
            style={{ color: 'rgb(var(--accent))' }}
          >
            Register as a customer
          </CrossRoleLink>{' '}
          or{' '}
          <CrossRoleLink
            to="/provider/register"
            className="underline-offset-4 hover:underline"
            style={{ color: 'rgb(var(--accent))' }}
          >
            Become a provider
          </CrossRoleLink>
        </div>
      </div>
    </main>
  )
}
