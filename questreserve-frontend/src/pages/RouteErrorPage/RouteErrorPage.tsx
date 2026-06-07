import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'

export function RouteErrorPage() {
  const error = useRouteError()

  let message = 'Something went wrong.'
  let status: number | null = null

  if (isRouteErrorResponse(error)) {
    status = error.status
    if (error.status === 404) {
      message = 'Page not found.'
    } else if (error.statusText) {
      message = error.statusText
    }
  } else if (error instanceof Error) {
    message = error.message
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
        backgroundColor: 'rgb(var(--background))',
        color: 'rgb(var(--foreground))',
        fontFamily: 'var(--font-body)',
        textAlign: 'center',
      }}
    >
      {status && (
        <p style={{ fontSize: '3rem', fontWeight: 'var(--weight-bold)', margin: 0 }}>{status}</p>
      )}
      <p style={{ fontSize: '1.125rem', color: 'rgb(var(--muted-foreground))', margin: 0 }}>{message}</p>
      <Link
        to="/locations"
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1.25rem',
          borderRadius: 'var(--radius)',
          backgroundColor: 'rgb(var(--accent))',
          color: 'rgb(var(--accent-foreground))',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--weight-semibold)',
          textDecoration: 'none',
        }}
      >
        Browse Adventures
      </Link>
    </div>
  )
}
