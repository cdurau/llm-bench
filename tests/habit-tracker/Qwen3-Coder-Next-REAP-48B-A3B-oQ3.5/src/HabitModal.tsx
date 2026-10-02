import type { Habit } from './types'

interface HabitModalProps {
  show: boolean
  onClose: () => void
  habit: Partial<Habit>
  onSave: () => void
  onChange: (field: 'name' | 'color', value: string) => void
}

const habitColors = [
  'bg-rose-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-fuchsia-500',
  'bg-pink-500',
]

export function HabitModal({ show, onClose, habit, onSave, onChange }: HabitModalProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
        <h2 className="text-2xl font-bold mb-6">Add New Habit</h2>

        <div className="mb-6">
          <label className="block mb-2 opacity-80">Name</label>
          <input
            data-testid="habit-name"
            type="text"
            value={habit.name}
            onChange={(e) => onChange('name', e.target.value)}
            className="w-full px-4 py-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Habit name"
            autoFocus
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 opacity-80">Color</label>
          <div className="flex flex-wrap gap-2">
            {habitColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onChange('color', color)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  habit.color === color ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface dark:ring-offset-surface-dark' : ''
                } ${color}`}
                aria-label="Color selection button"
              >
                {habit.color === color && <span className="text-white">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-surface dark:bg-surface-dark rounded-xl hover:bg-surface dark:hover:bg-surface-dark"
          >
            Cancel
          </button>
          <button
            data-testid="habit-save"
            onClick={onSave}
            disabled={!habit.name}
            className="px-6 py-3 bg-accent dark:bg-accent-dark text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
