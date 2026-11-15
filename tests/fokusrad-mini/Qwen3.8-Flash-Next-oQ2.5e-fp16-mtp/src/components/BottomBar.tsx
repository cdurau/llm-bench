import type { ReactNode } from 'react'

/** Primäraktionen in der Thumb-Zone, frei vom Home-Indikator (Safe Area). */
export default function BottomBar({ children }: { children: ReactNode }) {
  return (
    <div className="safe-bottom sticky bottom-0 z-10 border-t border-line bg-canvas/95 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-md px-4 py-3">{children}</div>
    </div>
  )
}
