import type { ReactNode } from 'react'
import type { ThemeMode } from '../types'

const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  className: 'h-5 w-5',
} as const

const OPTIONS: { mode: ThemeMode; label: string; icon: ReactNode }[] = [
  {
    mode: 'light',
    label: 'Helles Erscheinungsbild',
    icon: (
      <svg {...svgProps}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    ),
  },
  {
    mode: 'dark',
    label: 'Dunkles Erscheinungsbild',
    icon: (
      <svg {...svgProps}>
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    ),
  },
  {
    mode: 'system',
    label: 'System Appearance folgen',
    icon: (
      <svg {...svgProps}>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
]

interface ThemeToggleProps {
  mode: ThemeMode
  onChange: (m: ThemeMode) => void
}

export default function ThemeToggle({ mode, onChange }: ThemeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Erscheinungsbild"
      className="flex rounded-full border border-line bg-surface p-1"
    >
      {OPTIONS.map(({ mode: m, label, icon }) => (
        <button
          key={m}
          type="button"
          aria-pressed={mode === m}
          aria-label={label}
          onClick={() => onChange(m)}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors duration-150 active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            mode === m ? 'bg-accent text-accent-ink' : 'text-ink-soft hover:text-ink'
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
