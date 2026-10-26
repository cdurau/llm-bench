import { MOODS } from './MoodScale'

interface MoodPickerProps {
  value: number | null
  onSelect: (value: number) => void
}

/**
 * Auswahl der Stimmung von 1 bis 5 über Emojis.
 * Touch-Ziele sind mindestens 44 px hoch.
 */
export function MoodPicker({ value, onSelect }: MoodPickerProps) {
  return (
    <div className="flex items-center gap-2" role="group" aria-label="Stimmung wählen">
      {MOODS.map((m) => {
        const active = value === m.value
        return (
          <button
            key={m.value}
            type="button"
            onClick={() => onSelect(m.value)}
            aria-pressed={active}
            title={m.label}
            className="btn flex-1 rounded-[20px] text-2xl"
            style={{
              background: active ? 'var(--surface-2)' : 'transparent',
              minHeight: 48,
            }}
          >
            <span aria-hidden>{m.emoji}</span>
            <span className="sr-only">{m.label}</span>
          </button>
        )
      })}
    </div>
  )
}
