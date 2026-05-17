import { Link } from 'react-router-dom'

export function SiteFooter() {
  return (
    <footer
      style={{
        flexShrink: 0,
        borderTop: '1px solid rgb(var(--border))',
        backgroundColor: 'rgb(var(--background))',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgb(var(--muted-foreground))' }}>
        © 2026 WizardTowerCorp · Built by PassiveParadigm
      </p>
      <nav style={{ display: 'flex', gap: '1.25rem' }}>
        <Link
          to="/about"
          style={{ fontSize: '0.75rem', color: 'rgb(var(--muted-foreground))', textDecoration: 'none' }}
        >
          About
        </Link>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          style={{ fontSize: '0.75rem', color: 'rgb(var(--muted-foreground))', textDecoration: 'none', cursor: 'pointer' }}
        >
          Contact Us
        </a>
      </nav>
    </footer>
  )
}
