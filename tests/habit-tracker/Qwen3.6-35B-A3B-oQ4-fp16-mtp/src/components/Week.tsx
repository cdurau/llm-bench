import { useState, useEffect, useCallback } from 'react'
import {
  getHabits,
  getCompletions,
  getMoods,
  saveMood,
  dateKey,
  type Habit,
  type HabitCompletion,
  type MoodEntry,
} from '../db'

const DAY_NAMES = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez',
]

const MOOD_EMOJIS = ['\u{1F641}', '\u{1F644}', '\u{1F60A}', '\u{1F60A}', '\u{1F60D}']
const MOOD_LABELS = ['Sehr schlecht', 'Schlecht', 'Neutral', 'Gut', 'Sehr gut']

export default function Week() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<HabitCompletion[]>([])
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [moodNote, setMoodNote] = useState('')
  const [showMoodPicker, setShowMoodPicker] = useState(false)

  const load = useCallback(async () => {
    const h = await getHabits()
    setHabits(h)
    const c = await getCompletions()
    setCompletions(c)
    const m = await getMoods()
    setMoods(m)
  }, [])

  useEffect(() => { load() }, [load])

  const weekDays = getWeekDays(selectedDate)

  const completedPerDay = weekDays.map((day) => {
    const key = dateKey(day)
    return {
      date: day,
      key,
      count: completions.filter((c) => c.date === key).length,
    }
  })

  const moodsPerDay = weekDays.map((day) => {
    const key = dateKey(day)
    return {
      date: day,
      key,
      mood: moods.find((m) => m.date === key),
    }
  })

  const selectedKey = dateKey(selectedDate)
  const currentMood = moods.find((m) => m.date === selectedKey)

  const handleMoodSelect = async (value: number) => {
    await saveMood({ date: selectedKey, value, note: moodNote || undefined })
    setShowMoodPicker(false)
    setMoodNote('')
    const updated = await getMoods()
    setMoods(updated)
  }

  return (
    <div className="px-5 pt-10 pb-6">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight leading-tight">Woche</h1>
      </header>

      {/* Week navigation */}
      <WeekNav
        days={weekDays}
        selected={selectedDate}
        onSelect={setSelectedDate}
      />

      {/* Completed per day chart */}
      <div className="mt-8 mb-6">
        <h2 className="text-sm font-medium text-[#8a8a8a] dark:text-[#9a9a9a] uppercase tracking-wide mb-4">
          Erledigte Habits
        </h2>
        <div className="flex items-end gap-2 h-32">
          {completedPerDay.map((day) => {
            const maxCount = habits.length || 1
            const heightPct = habits.length > 0
              ? (day.count / maxCount) * 100
              : 0
            const isToday = dateKey(day.date) === dateKey(new Date())
            return (
              <div key={day.key} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    isToday
                      ? 'bg-[#2d5a3d] dark:bg-[#3d7a54]'
                      : 'bg-[#e8e7e3] dark:bg-[#333333]'
                  }`}
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                />
                <span className="text-[10px] text-[#8a8a8a] dark:text-[#9a9a9a] font-mono">
                  {day.date.getDate()}.
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mood chart */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-[#8a8a8a] dark:text-[#9a9a9a] uppercase tracking-wide mb-4">
          Stimmung
        </h2>
        <div className="flex items-end gap-2 h-24">
          {moodsPerDay.map((day) => {
            return (
              <div key={day.key} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    day.mood
                      ? 'bg-[#8a6d3c] dark:bg-[#b8943c]'
                      : 'bg-[#e8e7e3] dark:bg-[#333333]'
                  }`}
                  style={{
                    height: day.mood
                      ? `${(day.mood.value / 5) * 100}%`
                      : '4%',
                  }}
                />
                <span className="text-[10px] text-[#8a8a8a] dark:text-[#9a9a9a] font-mono">
                  {day.date.getDate()}.
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mood picker for selected day */}
      <div className="border-t border-[#e8e7e3] dark:border-[#333333] pt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">
            {formatDateShort(selectedDate)}
          </span>
          <button
            onClick={() => setShowMoodPicker(!showMoodPicker)}
            className="px-3 py-2 text-sm rounded-lg bg-[#2d5a3d] text-white dark:bg-[#3d7a54] focus:outline-none focus:ring-2 focus:ring-[#2d5a3d] focus:ring-offset-2"
          >
            {currentMood ? 'Stimmung ändern' : 'Stimmung notieren'}
          </button>
        </div>

        {showMoodPicker && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {MOOD_EMOJIS.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => handleMoodSelect(i + 1)}
                  className={`
                    flex-1 h-12 rounded-xl border text-xl flex items-center justify-center
                    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2d5a3d] focus:ring-offset-2
                    ${currentMood?.value === i + 1
                      ? 'border-[#2d5a3d] bg-[#2d5a3d]/10 dark:border-[#3d7a54]'
                      : 'border-[#e8e7e3] dark:border-[#333333] hover:border-[#d0cfc9]'
                    }
                  `}
                  aria-label={MOOD_LABELS[i]}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <textarea
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="Optional: Kurznotiz..."
              className="w-full px-4 py-3 rounded-xl border border-[#e8e7e3] dark:border-[#333333] bg-transparent text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2d5a3d] focus:ring-offset-2"
              rows={2}
            />
          </div>
        )}

        {currentMood && !showMoodPicker && (
          <div className="flex items-center gap-3 py-2">
            <span className="text-2xl">{MOOD_EMOJIS[currentMood.value - 1]}</span>
            <span className="text-sm">{MOOD_LABELS[currentMood.value - 1]}</span>
            {currentMood.note && (
              <span className="text-xs text-[#8a8a8a] dark:text-[#9a9a9a] ml-2">
                — {currentMood.note}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function getWeekDays(reference: Date): Date[] {
  const days: Date[] = []
  const start = new Date(reference)
  start.setDate(start.getDate() - 3)
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    days.push(d)
  }
  return days
}

function formatDateShort(d: Date): string {
  return `${d.getDate()}. ${MONTH_NAMES[d.getMonth()]}`
}

function WeekNav({
  days,
  selected,
  onSelect,
}: {
  days: Date[]
  selected: Date
  onSelect: (d: Date) => void
}) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-2">
      {days.map((day) => {
        const key = dateKey(day)
        const isSelected = dateKey(selected) === key
        const isToday = dateKey(day) === dateKey(new Date())
        return (
          <button
            key={key}
            onClick={() => onSelect(day)}
            className={`
              flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl
              text-xs font-medium transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-[#2d5a3d] focus:ring-offset-2
              ${isSelected
                ? 'bg-[#2d5a3d] text-white dark:bg-[#3d7a54]'
                : isToday
                  ? 'bg-[#e8f0ea] text-[#2d5a3d] dark:bg-[#2d5a3d]/20 dark:text-[#3d7a54]'
                  : 'text-[#8a8a8a] dark:text-[#9a9a9a]'
              }
            `}
          >
            <span className="text-[9px] uppercase tracking-wider">
              {DAY_NAMES[day.getDay()]}
            </span>
            <span>{day.getDate()}</span>
          </button>
        )
      })}
    </div>
  )
}
