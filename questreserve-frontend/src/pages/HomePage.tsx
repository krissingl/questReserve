import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

/**
 * HomePage — public landing page at /.
 * Populated in Phase 9.
 */
export function HomePage() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center"
      style={{ backgroundColor: 'rgb(var(--background))' }}
    >
      <h1
        className="mb-4 text-4xl font-bold"
        style={{ fontFamily: 'var(--font-heading)', color: 'rgb(var(--primary))' }}
      >
        QuestReserve
      </h1>
      <p
        className="mb-8 text-center text-lg"
        style={{ color: 'rgb(var(--muted-foreground))' }}
      >
        Dungeon booking for the modern adventurer.
      </p>
      <Button asChild>
        <Link to="/login">Sign In</Link>
      </Button>
    </main>
  )
}
