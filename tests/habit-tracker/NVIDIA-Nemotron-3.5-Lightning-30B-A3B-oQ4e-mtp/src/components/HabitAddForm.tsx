import React, { useState } from 'react'

interface HabitAddFormProps {
  onSubmit: (name: string, emoji: string, color: string) => void
  show: boolean
  setShow: (show: boolean) => void
}

export const HabitAddForm: React.FC<HabitAddFormProps> = ({ onSubmit, show, setShow }) => {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('✓')
  const [color, setColor] = useState('#3b82f6')
  const [loading, setLoading] = useState(false)

  const colorOptions = [
    { value: '#3b82f6', label: 'Blau' },
    { value: '#10b981', label: 'Grün' },
    { value: '#f59e0b', label: 'Orange' },
    { value: '#ef4444', label: 'Rot' },
    { value: '#8b5cf6', label: 'Lila' },
    { value: '#ec4899', label: 'Rosa' },
  ]

  const handleSubmit = () => {
    if (!name.trim()) return
    setLoading(true)
    onSubmit(name.trim(), emoji, color)
    setLoading(false)
    setShow(false)
  }

  const getEmojiClass = (selectedEmoji: string, emoji: string) => {
    return emoji === selectedEmoji ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
  }

  const getColorButtonClass = (selectedColor: string, optionColor: string) => {
    return color === optionColor ? 'border-2 border-white shadow-lg' : 'border-2 border-transparent'
  }

  return (
    <div>
      {show ? (
        <div className="mt-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold text-foreground mb-4">Habit hinzufügen</h3>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="z.B. Sport treiben"
                className="w-full px-3 py-2 rounded-border border border-gray-300 dark:border-gray-600 background-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                data-testid="habit-name"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Emoji</label>
              <div className="flex gap-2">
                {['✓', '💪', '📚', '🍎', '😴', '💧', '🌙'].map((emj: string) => (
                  <button
                    key={emj}
                    className={"p-2 rounded-full transition-all " + getEmojiClass(emoji, emj)}
                    onClick={() => setEmoji(emj)}
                    style={{ minWidth: '32px', minHeight: '32px' }}
                  >
                    {emj}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Farbe</label>
              <div className="grid grid-cols-3 gap-2">
                {colorOptions.map((option: any) => (
                  <button
                    key={option.value}
                    className={"p-2 rounded-full transition-all " + getColorButtonClass(color, option.value)}
                    onClick={() => setColor(option.value)}
                    style={{ width: '40px', height: '40px' }}
                  >
                    <div
                      className={`w-6 h-6 rounded-full ${color === option.value ? 'border-2 border-white' : ''}`}
                      style={{ backgroundColor: option.value }}
                    ></div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setShow(false)}
                className="px-4 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                data-testid="habit-save"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={loading ? 'px-4 py-2 rounded-lg transition-colors opacity-50 cursor-not-allowed' : 'px-4 py-2 rounded-lg transition-colors bg-primary text-white'}
              >
                {loading ? 'Speichern...' : 'Speichern'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}