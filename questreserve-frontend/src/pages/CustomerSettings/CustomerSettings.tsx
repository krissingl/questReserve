export function CustomerSettings() {
  return (
    <main className="p-8">
      <h1
        className="mb-6 text-2xl font-bold"
        style={{ fontFamily: 'var(--font-heading)', color: 'rgb(var(--foreground))' }}
      >
        Settings
      </h1>

      <section
        className="rounded-lg p-6"
        style={{
          backgroundColor: 'rgb(var(--card))',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <h2
          className="mb-2 text-lg font-semibold"
          style={{ fontFamily: 'var(--font-heading)', color: 'rgb(var(--foreground))' }}
        >
          Password
        </h2>
        <p className="text-sm" style={{ color: 'rgb(var(--muted-foreground))' }}>
          Password reset is coming soon. Check back in a future update.
        </p>
      </section>
    </main>
  )
}
