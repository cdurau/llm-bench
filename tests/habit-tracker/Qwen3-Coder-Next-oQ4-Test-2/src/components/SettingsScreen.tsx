import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getAllHabits, addHabit, deleteHabit, getTheme, setTheme, MOOD_EMOJIS, MOOD_COLORS } from '../db'
import type { Habit, Theme } from '../db'
import './App.css'

export default function SettingsScreen() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  
  // Add Habit Modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState(MOOD_EMOJIS[0])
  const [selectedColor, setSelectedColor] = useState('green')
  
  // Theme
  const [theme, setThemeState] = useState<Theme>('system')
  const [isDark, setIsDark] = useState(false)
  
  const [searchParams] = useSearchParams()
  
  // Open modal if ?openModal=true
  useEffect(() => {
    if (searchParams.get('openModal') === 'true') {
      setShowAddModal(true)
    }
  }, [searchParams])
  
  // Theme toggle cycles: system -> dark -> light -> system
  const handleThemeToggle = async () => {
    const nextTheme = theme === 'system' ? 'dark' : theme === 'dark' ? 'light' : 'system'
    await handleThemeChange(nextTheme)
  }
  
  // Habits laden
  const loadHabits = useCallback(async () => {
    try {
      const loadedHabits = await getAllHabits()
      setHabits(loadedHabits)
    } catch (error) {
      console.error('Fehler beim Laden der Habits:', error)
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    loadHabits()
    
    // Theme laden
    const loadTheme = async () => {
      const savedTheme = await getTheme()
      setThemeState(savedTheme)
      updateTheme(savedTheme)
    }
    loadTheme()
    
    // System theme ändern
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const updateThemeFromSystem = () => {
      if (theme === 'system') {
        updateTheme('system')
      }
    }
    mediaQuery.addEventListener('change', updateThemeFromSystem)
    
    return () => mediaQuery.removeEventListener('change', updateThemeFromSystem)
  }, [theme, loadHabits])
  
  // Theme anpassen
  const updateTheme = useCallback((t: Theme) => {
    const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = t === 'dark' || (t === 'system' && systemIsDark)
    setIsDark(dark)
    
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])
  
  const handleThemeChange = async (newTheme: Theme) => {
    await setTheme(newTheme)
    setThemeState(newTheme)
    updateTheme(newTheme)
  }
  
  // Habit hinzufügen
  const handleAddHabit = async () => {
    if (!newHabitName.trim()) return
    
    try {
      await addHabit({
        name: newHabitName,
        emoji: selectedEmoji,
        color: selectedColor
      })
      setNewHabitName('')
      setShowAddModal(false)
      await loadHabits()
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error)
    }
  }
  
  // Habit löschen
  const handleDeleteHabit = async (id: string) => {
    if (!confirm('Möchtest du dieses Habit wirklich löschen?')) return
    
    try {
      await deleteHabit(id)
      await loadHabits()
    } catch (error) {
      console.error('Fehler beim Löschen:', error)
    }
  }
  
  // Farbe auswählen
  const colorOptions = [
    { name: 'red', emoji: '🔴' },
    { name: 'blue', emoji: '🔵' },
    { name: 'green', emoji: '🟢' },
    { name: 'yellow', emoji: '🟡' }
  ]
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-text-secondary">Laden...</div>
      </div>
    )
  }
  
  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Einstellungen</h2>
      
      {/* Theme Toggle */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Darstellung</h3>
        <div className="rounded-3xl bg-surface p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Dark Mode</span>
            <button
              data-testid="theme-toggle"
              type="button"
              onClick={handleThemeToggle}
              className={`relative z-50 w-14 h-8 rounded-full p-1 transition-all duration-300 ${
                isDark ? 'bg-accent' : 'bg-border'
              }`}
            >
              <div 
                className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
                  isDark ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleThemeChange('light')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                theme === 'light' ? 'bg-accent text-white' : 'bg-border text-text'
              }`}
            >
              Hell
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                theme === 'dark' ? 'bg-accent text-white' : 'bg-border text-text'
              }`}
            >
              Dunkel
            </button>
            <button
              onClick={() => handleThemeChange('system')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                theme === 'system' ? 'bg-accent text-white' : 'bg-border text-text'
              }`}
            >
              System
            </button>
          </div>
        </div>
      </section>
      
      {/* Habits verwalten */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Habits verwalten</h3>
        
        <div className="rounded-3xl bg-surface p-4 min-h-[200px]">
          {habits.length === 0 ? (
            <div className="empty-state">
              <p className="text-text-secondary">Noch keine Habits</p>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-surface-hover"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{habit.emoji}</span>
                    <span className="font-medium">{habit.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                    aria-label="Habit löschen"
                    title="Löschen"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <button
            data-testid="habit-add"
            onClick={() => setShowAddModal(true)}
            className="w-full mt-4 btn btn-primary"
          >
            + neues Habit
          </button>
        </div>
      </section>
      
      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-3xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">Neues Habit</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  data-testid="habit-name"
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="z.B. Wasser trinken"
                  className="w-full p-3 rounded-2xl border border-border"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Emoji</label>
                <div className="flex gap-2 justify-center">
                  {MOOD_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`text-3xl p-2 rounded-2xl transition-all ${
                        selectedEmoji === emoji ? 'bg-border ring-2 ring-accent' : 'hover:bg-surface-hover'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Farbe</label>
                <div className="flex gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        selectedColor === color.name ? 'ring-2 ring-offset-2 ring-accent' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: MOOD_COLORS[colorOptions.indexOf(color)] }}
                      title={color.name}
                    >
                      {color.emoji}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-2xl font-medium hover:bg-border"
                >
                  Abbrechen
                </button>
                <button
                  data-testid="habit-save"
                  onClick={handleAddHabit}
                  className="flex-1 py-3 rounded-2xl font-medium bg-accent text-white"
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
