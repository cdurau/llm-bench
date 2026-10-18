import { useState } from "react"

interface MoodPickerProps {
  value?: number
  note?: string
  onSave: (value: number, note: string) => void
  onClose: () => void
}

const FACES = [
  { value: 1, emoji: "😣", label: "Schlecht" },
  { value: 2, emoji: "😕", label: "Mässig" },
  { value: 3, emoji: "🙂", label: "Okay" },
  { value: 4, emoji: "😄", label: "Gut" },
  { value: 5, emoji: "😊", label: "Sehr gut" },
]

export default function MoodPicker({ value, note, onSave, onClose }: MoodPickerProps) {
  const [picked, setPicked] = useState(value ?? 0)
  const [text, setText] = useState(note ?? "")

  function save() {
    if (!picked) return
    onSave(picked, text.trim())
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight">Stimmung heute</h3>
        <button
          onClick={onClose}
          aria-label="Schließen"
          className="rounded-lg px-2 py-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--text)]"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          ✕
        </button>
      </div>

      <div className="mb-5 flex justify-between" role="radiogroup" aria-label="Stimmung">
        {FACES.map((f) => {
          const active = picked === f.value
          return (
            <button
              key={f.value}
              role="radio"
              aria-checked={active}
              aria-label={f.label}
              onClick={() => setPicked(f.value)}
              className="flex flex-col items-center gap-1 transition-transform active:scale-90"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <span
                className={`text-3xl transition-transform duration-200 ${active ? "scale-115" : "opacity-50"}`}
              >
                {f.emoji}
              </span>
              <span className="text-xs text-[var(--text-muted)]">{f.value}</span>
            </button>
          )
        })}
      </div>

      <div className="mb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Optionale Notiz…"
          aria-label="Kurznotiz zur Stimmung"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex h-12 flex-1 items-center justify-center rounded-xl border border-[var(--border-strong)] text-sm font-medium transition-colors hover:bg-[var(--accent-soft)]"
          style={{ minHeight: 44 }}
        >
          Abbrechen
        </button>
        <button
          onClick={save}
          disabled={!picked}
          className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          style={{ minHeight: 44 }}
        >
          Speichern
        </button>
      </div>
    </div>
  )
}
