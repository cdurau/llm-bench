import { useEffect, useState } from 'react'
import { useNotifications } from '../hooks/useNotifications'
import { validateActivity } from '../lib/storage'
import type { Activity, ActivityInput } from '../types'
import { EditIcon, PlusIcon, TrashIcon } from './icons'

export type FormMode = 'create' | 'edit'

interface ActivityFormProps {
  mode: FormMode
  initial?: Activity
  categories: string[]
  onSubmit: (input: ActivityInput) => void
  onCancel: () => void
  onDelete?: () => void
}

interface FieldState {
  name: string
  description: string
  category: string
  dailyTarget: string // als Text, um leere Eingänge zu erlauben
}

const EMPTY: FieldState = { name: '', description: '', category: '', dailyTarget: '' }

/** Formular zum Erstellen und Bearbeiten von Aktivitäten. */
export function ActivityForm({
  mode,
  initial,
  categories,
  onSubmit,
  onCancel,
  onDelete,
}: ActivityFormProps) {
  const { notify } = useNotifications()
  const [fields, setFields] = useState<FieldState>(EMPTY)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (mode === 'edit' && initial) {
      setFields({
        name: initial.name,
        description: initial.description,
        category: initial.category,
        dailyTarget: initial.dailyTarget > 0 ? String(initial.dailyTarget) : '',
      })
      setError('')
    } else {
      setFields(EMPTY)
      setError('')
    }
  }, [mode, initial])

  function set<K extends keyof FieldState>(key: K, value: FieldState[K]) {
    setFields((f) => ({ ...f, [key]: value }))
    if (error) setError('')
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input: ActivityInput = {
      name: fields.name,
      description: fields.description,
      category: fields.category,
      dailyTarget: fields.dailyTarget === '' ? undefined : Number(fields.dailyTarget),
    }
    const result = validateActivity(input, mode === 'edit' ? { id: initial?.id } : {})
    if (!result.ok) {
      setError(result.error)
      notify(result.error, 'error')
      return
    }
    onSubmit(input)
  }

  const isEdit = mode === 'edit'

  return (
    <form className="activity-form" onSubmit={handleSubmit} noValidate>
      <div className="activity-form__row">
        <label className="field">
          <span className="field__label">Name</span>
          <input
            type="text"
            value={fields.name}
            autoComplete="off"
            onChange={(e) => set('name', e.target.value)}
            aria-required="true"
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? 'activity-form-error' : undefined}
            placeholder="z. B. Sport, Lesen, Wasser trinken"
          />
        </label>

        <label className="field">
          <span className="field__label">Kategorie</span>
          <input
            type="text"
            list="categories"
            value={fields.category}
            onChange={(e) => set('category', e.target.value)}
            aria-required="true"
            aria-invalid={error ? 'true' : undefined}
            placeholder="z. B. Gesundheit"
          />
        </label>
      </div>

      <label className="field">
        <span className="field__label">Beschreibung <span className="field__optional">(optional)</span></span>
        <input
          type="text"
          value={fields.description}
          autoComplete="off"
          onChange={(e) => set('description', e.target.value)}
          placeholder="Was oder warum?"
        />
      </label>

      <div className="activity-form__row">
        <label className="field">
          <span className="field__label">Tagesziel <span className="field__optional">(optional)</span></span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={fields.dailyTarget}
            onChange={(e) => set('dailyTarget', e.target.value)}
            placeholder="0 = kein Ziel"
          />
        </label>

        <div className="activity-form__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Abbrechen
          </button>
          <button type="submit" className="btn btn--primary">
            {isEdit ? <EditIcon /> : <PlusIcon />}
            {isEdit ? 'Speichern' : 'Hinzufügen'}
          </button>
        </div>
      </div>

      {isEdit && onDelete && (
        <button type="button" className="btn btn--danger" onClick={onDelete}>
          <TrashIcon />
          Löschen
        </button>
      )}

      {error && (
        <p className="activity-form__error" id="activity-form-error" role="alert">
          {error}
        </p>
      )}

      <datalist id="categories">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </form>
  )
}
