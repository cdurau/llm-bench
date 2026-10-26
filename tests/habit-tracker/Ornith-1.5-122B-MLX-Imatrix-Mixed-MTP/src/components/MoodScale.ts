export interface MoodLevel {
  value: number
  emoji: string
  label: string
}

/** Stimmungsskala 1..5 mit Emojis und kurzer deutscher Beschreibung. */
export const MOODS: MoodLevel[] = [
  { value: 5, emoji: '😄', label: 'Herrlich' },
  { value: 4, emoji: '🙂', label: 'Gut' },
  { value: 3, emoji: '😌', label: 'Ausgeglichen' },
  { value: 2, emoji: '🙁', label: 'Müde' },
  { value: 1, emoji: '😞', label: 'Schwer' },
]
