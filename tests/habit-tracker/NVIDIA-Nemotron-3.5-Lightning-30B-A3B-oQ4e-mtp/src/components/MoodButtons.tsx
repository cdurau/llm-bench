import React from 'react'

interface MoodButtonsProps {
  selected: number | null
  onSelect: (mood: number) => void
  onClear: () => void
}

export const MoodButtons: React.FC<MoodButtonsProps> = ({ selected, onSelect, onClear }) => {
  const emojis = ['😞', '😕', '😐', '🙂', '😁']

  return (
    <div className="flex gap-2">
      {emojis.map((emoji, index) => (
        <button
          key={index}
          className={`p-3 rounded-lg transition-all ${
            selected === index + 1
              ? 'bg-primary text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          onClick={() => onSelect(index + 1)}
          data-testid={`mood-${index + 1}`}
          aria-pressed={selected === (index + 1).toString()}
          style={{ minWidth: '60px', minHeight: '60px' }}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}