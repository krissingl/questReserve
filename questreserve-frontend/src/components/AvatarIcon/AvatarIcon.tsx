interface AvatarIconProps {
  firstName: string
  lastName: string
  size?: 'sm' | 'md'
  pictureUrl?: string | null
}

const SIZE_MAP = {
  sm: { dimension: '28px', fontSize: '0.7rem' },
  md: { dimension: '36px', fontSize: '0.9rem' },
}

export function AvatarIcon({ firstName, lastName, size = 'md', pictureUrl }: AvatarIconProps) {
  const { dimension, fontSize } = SIZE_MAP[size]
  const initials = `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`

  if (pictureUrl) {
    return (
      <span
        style={{
          display: 'inline-block',
          width: dimension,
          height: dimension,
          borderRadius: '50%',
          overflow: 'hidden',
          flexShrink: 0,
          verticalAlign: 'middle',
          border: '1px solid rgb(var(--accent))',
        }}
        aria-hidden="true"
      >
        <img
          src={pictureUrl}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </span>
    )
  }

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
        lineHeight: 1,
        flexShrink: 0,
        userSelect: 'none',
        verticalAlign: 'middle',
      }}
      aria-hidden="true"
    >
      <span style={{ display: 'block', lineHeight: 1, paddingTop: '0.05em' }}>
        {initials}
      </span>
    </span>
  )
}
