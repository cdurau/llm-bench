import {} from 'react'

interface HeaderProps {
  title: string
  darkMode: boolean
  onToggleDarkMode: () => void
}

export default function Header({ title, darkMode, onToggleDarkMode }: HeaderProps) {
  return (
    <header className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
        {title}
      </h1>
      <button
        onClick={onToggleDarkMode}
        className="icon-btn"
        aria-label="Dark mode toggle"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    </header>
  )
}
