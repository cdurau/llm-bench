import { formatDate, shiftBadge } from '../utils'
import type { FocusWheel } from '../types'

interface ArchiveListProps {
  wheels: FocusWheel[]
  onOpen: (id: string) => void
}

export default function ArchiveList({ wheels, onOpen }: ArchiveListProps) {
  return (
    <ul className="space-y-3">
      {wheels.map((w) => (
        <li key={w.id}>
          <button
            type="button"
            onClick={() => onOpen(w.id)}
            className="card w-full text-left transition-[transform,background-color] duration-150 ease-out active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent hover:bg-surface-2"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="text-xs text-ink-soft tabular-nums">{formatDate(w.completedAt)}</span>
              <span className="chip shrink-0">
                {w.startMood}
                <span aria-hidden="true">→</span>
                {w.endMood}
                <span className="text-accent">{shiftBadge(w.startMood, w.endMood)}</span>
              </span>
            </span>
            <span className="mt-2 block text-[16px] leading-snug text-ink line-clamp-2">
              {w.initialThought}
            </span>
            <span className="mt-1 block text-sm leading-snug text-ink-soft line-clamp-1">
              Ziel: {w.targetThought}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
