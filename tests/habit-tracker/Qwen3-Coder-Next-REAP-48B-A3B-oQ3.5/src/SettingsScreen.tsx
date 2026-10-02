import { useState, useEffect } from 'react'
import * as db from './db'

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const loadTheme = async () => {
      const theme = await db.getThemePreference()
      setDarkMode(theme.darkMode)
    }
    loadTheme()
  }, [])

  const toggleTheme = async () => {
    const newMode = !darkMode
    await db.setThemePreference(newMode)
    setDarkMode(newMode)
  }

  return (
    <div className="py-6">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-lg opacity-70">Customize your app experience</p>
      </header>

      <div className="space-y-6">
        {/* Theme Toggle */}
        <div className="bg-surface dark:bg-surface-dark rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Dark Mode</h2>
              <p className="text-sm opacity-70">Follow system or switch manually</p>
            </div>
            <button
              data-testid="theme-toggle"
              onClick={toggleTheme}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                darkMode ? 'bg-accent' : 'border-border dark:border-border-dark'
              }`}
              aria-pressed={darkMode}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-surface dark:bg-surface-dark rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">App Info</h2>
          <p className="text-sm opacity-70">Rhythm v1.0.0</p>
          <p className="text-sm opacity-70 mt-2">A Habit & Stimmungs Tracker PWA</p>
        </div>

        {/* Reset Data */}
        <div className="bg-surface dark:bg-surface-dark rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Data Management</h2>
          <button className="px-6 py-3 bg-red-500 text-white rounded-xl shadow-lg active:scale-95 transition-transform">
            Reset All Data
          </button>
          <p className="text-xs opacity-50 mt-3">
            Warning: This will delete all your habits, logs, and moods permanently
          </p>
        </div>
      </div>
    </div>
  )
}
