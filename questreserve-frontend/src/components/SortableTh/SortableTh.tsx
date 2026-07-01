import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'

interface SortableThProps {
  label: string
  active: boolean
  direction: 'asc' | 'desc'
  onClick: () => void
}

export function SortableTh({ label, active, direction, onClick }: SortableThProps) {
  return (
    <th
      style={{
        padding: '0.5rem 0.75rem',
        textAlign: 'left',
        fontWeight: 'var(--weight-semibold)',
        color: 'rgb(var(--muted-foreground))',
      }}
    >
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1"
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          font: 'inherit',
          color: active ? 'rgb(var(--foreground))' : 'inherit',
          cursor: 'pointer',
        }}
      >
        {label}
        {active ? (
          direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
        ) : (
          <ChevronsUpDown size={14} style={{ opacity: 0.5 }} />
        )}
      </button>
    </th>
  )
}
