interface AvatarIconProps {
  firstName: string
  lastName: string
  size?: 'sm' | 'md'
}

const SIZE_MAP = {
  sm: { dimension: '28px', fontSize: '0.7rem' },
  md: { dimension: '36px', fontSize: '0.9rem' },
}

export function AvatarIcon({ firstName, lastName, size = 'md' }: AvatarIconProps) {
  const { dimension, fontSize } = SIZE_MAP[size]
  const initials = `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dimension,
        height: dimension,
        borderRadius: '50%',
        backgroundColor: 'rgb(var(--background))',
        border: '1px solid rgb(var(--accent))',
        color: 'rgb(var(--accent))',
        fontFamily: 'var(--font-heading)',
        fontSize,
        fontWeight: 'var(--weight-bold)',
        letterSpacing: '0.04em',
        flexShrink: 0,
        userSelect: 'none',
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}
