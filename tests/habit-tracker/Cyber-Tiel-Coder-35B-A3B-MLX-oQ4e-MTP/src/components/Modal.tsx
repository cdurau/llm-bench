import { useEffect, type ReactNode } from 'react'
import { CloseIcon } from './icons'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
}

export function Modal({ open, onClose, title, subtitle, children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-[#1c1a17]/40 backdrop-blur-[2px] animate-fade dark:bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="animate-sheet relative w-full max-h-[92svh] overflow-y-auto rounded-t-[28px] border border-line bg-surface px-5 pb-8 pt-5 shadow-[var(--shadow-float)] sm:max-w-md sm:rounded-[28px]"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="display text-2xl text-ink">{title}</h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-muted">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="press grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-surface text-muted hover:text-ink"
          >
            <CloseIcon size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
