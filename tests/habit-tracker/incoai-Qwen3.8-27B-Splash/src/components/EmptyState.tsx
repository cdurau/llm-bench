import type { CSSProperties, ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  text: string
  action?: ReactNode
  index?: number
}

/** Ruhiger Karten-Leerzustand mit dezentem Mark-Motiv. */
export function EmptyState({ title, text, action, index = 0 }: EmptyStateProps) {
  return (
    <div
      className="rise rounded-card border border-line bg-surface px-6 py-12 text-center shadow-soft"
      style={{ '--index': index } as CSSProperties}
    >
      <div
        className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-card border border-line bg-canvas"
        aria-hidden="true"
      >
        <svg width="30" height="30" viewBox="0 0 64 64" fill="none">
          <path
            d="M11 36.5h11.5l5.5-13 7.5 19 5.5-6.5H53"
            stroke="var(--color-faint)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="font-serif text-[19px] font-semibold tracking-[-0.01em] text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-[28ch] text-sm leading-relaxed text-muted">{text}</p>
      {action ? <div className="mt-7 flex justify-center">{action}</div> : null}
    </div>
  )
}
