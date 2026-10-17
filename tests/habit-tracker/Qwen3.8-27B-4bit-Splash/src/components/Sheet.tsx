import { useEffect, useRef, type ReactNode } from 'react'

interface SheetProps {
  title: string
  onClose: () => void
  children: ReactNode
}

/** Bottom Sheet: sanft von unten, Esc schließt, Fokus kommt zurück. */
export function Sheet({ title, onClose, children }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    const previouslyFocused = document.activeElement as HTMLElement | null
    panelRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previouslyFocused?.focus()
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Schließen"
        tabIndex={-1}
        onClick={onClose}
        className="sheet-backdrop absolute inset-0 h-full w-full bg-ink/30"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="sheet-panel absolute inset-x-0 bottom-0 mx-auto w-full max-w-[440px] rounded-t-2xl border-t border-line bg-surface px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+20px)]"
      >
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-line" aria-hidden="true" />
        <h2 className="font-serif text-[22px] leading-tight tracking-[-0.01em]">{title}</h2>
        {children}
      </div>
    </div>
  )
}
