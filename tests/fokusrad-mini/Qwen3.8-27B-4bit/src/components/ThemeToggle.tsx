import type { ReactElement } from 'react'
import { Moon, Monitor, Sun } from 'lucide-react'
import type { ThemePreference } from '../types'

interface ThemeToggleProps {
  value: ThemePreference
  onChange: (preference: ThemePreference) => void
  className?: string
}

const OPTIONS: Array<{
  id: ThemePreference
  label: string
  Icon: typeof Sun
}> = [
  { id: 'light', label: 'Helles Design', Icon: Sun },
  { id: 'dark', label: 'Dunkles Design', Icon: Moon },
  { id: 'system', label: 'Systemdesign', Icon: Monitor }
]

/**
 * Sichtbarer Theme-Schalter mit drei Zuständen: Licht / Dunkel / System.
 * Die Auswahl wird von der App in `localStorage` abgelegt.
 */
export function ThemeToggle({ value, onChange, className }: ThemeToggleProps): ReactElement {
  return (
    <div
      role="group"
      aria-label="Farbschema"
      className={`flex items-center rounded-full border p-1 ${className ?? ''}`}
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
    >
      {OPTIONS.map(({ id, label, Icon }) => {
        const selected = value === id
        return (
          <button
            key={id}
            type="button"
            aria-pressed={selected}
            aria-label={label}
            title={label}
            onClick={() => onChange(id)}
            className="press chip flex h-11 w-11 items-center justify-center rounded-full"
            style={{
              backgroundColor: selected ? 'var(--accent)' : 'transparent',
              color: selected ? 'var(--accent-ink)' : 'var(--ink-2)'
            }}
          >
            <Icon size={18} strokeWidth={2} aria-hidden />
          </button>
        )
      })}
    </div>
  )
}
