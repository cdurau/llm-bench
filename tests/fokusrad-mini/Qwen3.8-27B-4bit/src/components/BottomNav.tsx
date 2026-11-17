import type { ReactElement } from 'react'
import { History } from 'lucide-react'
import { WheelGlyph } from './WheelGlyph'

export type MainTab = 'home' | 'archive'

interface BottomNavProps {
  active: MainTab
  onNavigate: (tab: MainTab) => void
}

/**
 * Untere Tab-Navigation (Fokusrad / Verlauf) – bewusst in der
 * Thumb-Zone, 56 px hoch plus Safe-Area-Unterrand, zwei große Ziele.
 */
export function BottomNav({ active, onNavigate }: BottomNavProps): ReactElement {
  const base =
    'press tab flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[12px] font-semibold'

  return (
    <nav
      aria-label="Hauptnavigation"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md"
    >
      <div
        className="grid grid-cols-2 border-t"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--surface) 92%, transparent)',
          borderColor: 'var(--line)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
      >
        <button
          type="button"
          aria-current={active === 'home' ? 'page' : undefined}
          onClick={() => onNavigate('home')}
          className={base}
          style={{ color: active === 'home' ? 'var(--accent)' : 'var(--ink-2)' }}
        >
          <WheelGlyph size={22} />
          Fokusrad
        </button>
        <button
          type="button"
          aria-current={active === 'archive' ? 'page' : undefined}
          onClick={() => onNavigate('archive')}
          className={base}
          style={{ color: active === 'archive' ? 'var(--accent)' : 'var(--ink-2)' }}
        >
          <History size={20} strokeWidth={2.2} aria-hidden />
          Verlauf
        </button>
      </div>
    </nav>
  )
}
