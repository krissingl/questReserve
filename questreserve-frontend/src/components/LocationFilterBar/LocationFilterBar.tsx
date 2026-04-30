const DIFFICULTY_OPTIONS = ['EASY', 'MEDIUM', 'HARD', 'LEGENDARY'] as const

interface LocationFilterBarProps {
  difficulty: string
  onChange: (difficulty: string) => void
}

export function LocationFilterBar({ difficulty, onChange }: LocationFilterBarProps) {
  const options: Array<{ label: string; value: string }> = [
    { label: 'All', value: '' },
    ...DIFFICULTY_OPTIONS.map((d) => ({ label: d, value: d })),
  ]

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = difficulty === option.value
        return (
          <button
            key={option.value === '' ? 'all' : option.value}
            type="button"
            onClick={() => onChange(option.value)}
            style={{
              backgroundColor: isActive
                ? 'rgb(var(--accent))'
                : 'transparent',
              color: isActive
                ? 'rgb(var(--accent-foreground))'
                : 'rgb(var(--foreground))',
              border: `1px solid ${isActive ? 'rgb(var(--accent))' : 'rgb(var(--border))'}`,
              borderRadius: 'var(--radius-pill)',
              padding: '0.25rem 0.75rem',
              fontSize: 'var(--text-sm)',
              fontWeight: isActive ? 'var(--weight-semibold)' : 'var(--weight-regular)',
              cursor: 'pointer',
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
