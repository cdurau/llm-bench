import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  hint?: string
  children?: ReactNode
}

/** Sorgfältig gestalteter Leerzustand — ruhig, mit klarem Hinweis. */
export function EmptyState({ icon, title, hint, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className="mb-5 flex size-16 items-center justify-center rounded-full"
        style={{
          background: 'var(--surface-2)',
          color: 'var(--muted)',
        }}
      >
        {icon}
      </div>
      <h2 className="text-lg font-serif font-semibold" style={{ color: 'var(--ink)', letterSpacing: '-0.01em' }}>
        {title}
      </h2>
      {hint && <p className="mt-2 max-w-xs text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
        {hint}
      </p>}
      {children}
    </div>
  )
}
