import { useState } from 'react'
import { SunMoonIcon, SunIcon, MoonIcon, PenIcon, PlusIcon, TrashIcon } from '../components/Icons'
import { PALETTE, getColor, DEFAULT_COLOR } from '../palette'
import type { ThemeMode } from '../types'
import type { Snapshot } from '../store'

interface SettingsViewProps {
  data: Snapshot
  onSetTheme: (mode: ThemeMode) => void
  onAddHabit: (input: { name: string; emoji: string; color: string }) => void
  onUpdateHabit: (id: string, patch: { name: string; emoji: string; color: string }) => void
  onDeleteHabit: (id: string) => void
}

type EditorState = { name: string; emoji: string; color: string }

const EMPTY_FORM: EditorState = { name: '', emoji: '✨', color: DEFAULT_COLOR }

export function SettingsView({
  data,
  onSetTheme,
  onAddHabit,
  onUpdateHabit,
  onDeleteHabit,
}: SettingsViewProps) {
  const theme = data.settings.theme
  const [editorFor, setEditorFor] = useState<string | 'new' | null>(null)
  const [form, setForm] = useState<EditorState>(EMPTY_FORM)

  const startNew = () => {
    setForm({ ...EMPTY_FORM })
    setEditorFor('new')
  }

  const openEditor = (id: string) => {
    const h = data.habits.find((x) => x.id === id)
    if (h) setForm({ name: h.name, emoji: h.emoji, color: h.color })
    setEditorFor(id)
  }

  const save = () => {
    if (editorFor === 'new') {
      const name = form.name.trim()
      if (!name) {
        setEditorFor(null)
        return
      }
      onAddHabit({ name, emoji: form.emoji || '✨', color: form.color })
    } else if (editorFor) {
      onUpdateHabit(editorFor, {
        name: form.name.trim() || 'Unbenannt',
        emoji: form.emoji || '✨',
        color: form.color,
      })
    }
    setEditorFor(null)
  }

  const activeColor = getColor(form.color)

  // Editor (Anlegen oder Bearbeiten)
  const editor = (
    <div className="surface space-y-4 rounded-[24px] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
          {editorFor === 'new' ? 'Neuer Habit' : 'Habit bearbeiten'}
        </h3>
        <button
          type="button"
          onClick={() => setEditorFor(null)}
          className="text-xs"
          style={{ color: 'var(--muted)' }}
        >
          Schließen
        </button>
      </div>

      {/* Vorschau */}
      <div className="flex items-center gap-3">
        <span
          className="flex size-12 items-center justify-center rounded-2xl text-xl"
          style={{ background: activeColor.value, color: '#fff' }}
        >
          <span aria-hidden>{form.emoji || '✨'}</span>
        </span>
        <span className="text-sm" style={{ color: 'var(--muted)' }}>
          So sieht dein Habit aus
        </span>
      </div>

      {/* Name */}
      <label className="block">
        <span className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted)' }}>
          Name
        </span>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="z. B. Wasser trinken"
          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--ink)' }}
        />
      </label>

      {/* Emoji */}
      <label className="block">
        <span className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted)' }}>
          Emoji
        </span>
        <input
          value={form.emoji}
          onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
          placeholder="ein Emoji"
          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--ink)' }}
        />
      </label>

      {/* Farbe */}
      <div>
        <span className="mb-2 block text-xs font-medium" style={{ color: 'var(--muted)' }}>
          Farbe
        </span>
        <div className="flex flex-wrap gap-2">
          {PALETTE.map((c) => {
            const selected = c.value === form.color
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, color: c.value }))}
                aria-pressed={selected}
                className="size-9 rounded-full transition"
                style={{ background: c.value, outline: selected ? '3px solid var(--accent)' : 'none', outlineOffset: 2 }}
                title={c.name}
              />
            )
          })}
        </div>
      </div>

      {/* Aktionen */}
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={save} className="btn btn-primary flex-1">
          {editorFor === 'new' ? 'Anlegen' : 'Speichern'}
        </button>
        {editorFor && editorFor !== 'new' && (
          <button
            type="button"
            onClick={() => onDeleteHabit(editorFor)}
            className="btn rounded-[14px] px-4"
            style={{ color: 'var(--danger)' }}
          >
            <TrashIcon width={18} height={18} />
            Löschen
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="animate-rise space-y-8">
      <header>
        <h1 className="font-serif text-2xl font-semibold" style={{ letterSpacing: '-0.02em' }}>
          Einstellungen
        </h1>
      </header>

      {/* Theme */}
      <section className="surface rounded-[24px] p-5">
        <h2 className="mb-3 text-sm font-medium" style={{ color: 'var(--ink)' }}>
          Erscheinungsbild
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { mode: 'system' as ThemeMode, Icon: SunMoonIcon, label: 'System' },
              { mode: 'light' as ThemeMode, Icon: SunIcon, label: 'Hell' },
              { mode: 'dark' as ThemeMode, Icon: MoonIcon, label: 'Dunkel' },
            ] as const
          ).map(({ mode, Icon, label }) => {
            const active = theme === mode
            return (
              <button
                key={mode}
                type="button"
                onClick={() => onSetTheme(mode)}
                aria-pressed={active}
                className="btn flex-col gap-1.5 rounded-[16px] py-3"
                style={{
                  borderColor: 'var(--border)',
                  background: active ? 'var(--surface-2)' : 'transparent',
                  color: active ? 'var(--ink)' : 'var(--muted)',
                }}
              >
                <Icon width={20} height={20} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Habits */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
            Deine Habits
          </h2>
          {editorFor !== 'new' && (
            <button type="button" onClick={startNew} className="btn gap-1.5 text-sm" style={{ color: 'var(--accent)' }}>
              <PlusIcon width={18} height={18} />
              Neu
            </button>
          )}
        </div>

        {data.habits.length === 0 && (
          <p className="rounded-xl border px-4 py-3 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
            Noch keine Habits angelegt.
          </p>
        )}

        <ul className="space-y-2">
          {data.habits.map((h) => (
            <li
              key={h.id}
              className="flex items-center gap-3 rounded-2xl border p-3"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              <span
                className="flex size-10 items-center justify-center rounded-xl text-lg"
                style={{ background: getColor(h.color).value, color: '#fff' }}
              >
                <span aria-hidden>{h.emoji}</span>
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium" style={{ color: 'var(--ink)' }}>
                {h.name}
              </span>
              <button
                type="button"
                onClick={() => openEditor(h.id)}
                className="btn size-10 rounded-xl"
                aria-label={`${h.name} bearbeiten`}
                style={{ color: 'var(--muted)' }}
              >
                <PenIcon width={18} height={18} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Editor */}
      {editorFor && editor}

      <footer className="pt-2 text-xs" style={{ color: 'var(--muted)' }}>
        Alle Daten werden lokal in deinem Browser gespeichert und funktionieren auch ohne Internet.
      </footer>
    </div>
  )
}
