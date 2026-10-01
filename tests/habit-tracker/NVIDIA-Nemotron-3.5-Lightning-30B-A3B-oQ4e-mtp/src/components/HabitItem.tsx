import React from 'react'

interface HabitItemProps {
  habit: {
    id: string
    name: string
    emoji: string
    color: string
    streakCurrent: number
    streakLongest: number
    completedToday: boolean
  }
  onToggle: () => void
}

export const HabitItem: React.FC<HabitItemProps> = ({ habit, onToggle }) => {
  const bgClass = habit.color.startsWith('#')
    ? `bg-${habit.color.replace('#', '')}`
    : `bg-${habit.color}`

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 prefers-reduced-motion:none"
      style={{ minHeight: '120px' }}
      data-testid="habit-item"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          bgClass
        } mt-1 flex-shrink-0`} style={{ backgroundColor: habit.color }}>
          {habit.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 dark:text-gray-100">{habit.name}</div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span className="mr-2" aria-pressed={habit.completedToday.toString()}>
              ✓
            </span>
            <button
              className="habit-toggle rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              onClick={onToggle}
              aria-pressed={habit.completedToday.toString()}
              data-testid="habit-toggle"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2h-5m-1.414-9.414a2 2 0 112.828 2.828L15 9.828"
                />
              </svg>
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">Aktuelle Serie:</span> {habit.streakCurrent} Tage
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">Längste Serie:</span> {habit.streakLongest} Tage
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}