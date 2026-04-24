export function About() {
  return (
    <div className="p-8" style={{ backgroundColor: 'rgb(var(--background))' }}>
      <div
        className="mx-auto max-w-2xl rounded-lg p-8"
        style={{ backgroundColor: 'rgb(var(--card))', boxShadow: 'var(--shadow-card)' }}
      >
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: 'rgb(var(--foreground))' }}
        >
          About QuestReserve
        </h1>
        <p className="mt-4 text-sm" style={{ color: 'rgb(var(--foreground))' }}>
          QuestReserve connects adventurers with world-class escape room experiences. Browse
          available locations, reserve time slots, and embark on your next quest.
        </p>
        <p className="mt-3 text-sm" style={{ color: 'rgb(var(--muted-foreground))' }}>
          More information about our team, mission, and partners is coming soon.
        </p>
      </div>
    </div>
  )
}
