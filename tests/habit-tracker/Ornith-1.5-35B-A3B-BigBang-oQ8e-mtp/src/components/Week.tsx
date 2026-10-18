import { useMemo } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import { useData } from "../hooks/useData"
import { useDarkMode } from "../hooks/useDarkMode"
import { weekdayShort } from "../lib/date"
import EmptyState from "./EmptyState"
import { IconChart } from "./icons"

export default function Week() {
  const { completions, moods } = useData()
  const { appearance } = useDarkMode()
  const isDark =
    appearance === "dark" ||
    (appearance === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  const accent = isDark ? "#f5f5f0" : "#111111"
  const muted = isDark ? "#9a9a96" : "#787774"
  const success = isDark ? "#6fbf7b" : "#3a7d44"

  const keys = useMemo(() => {
    const out: string[] = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      out.push(`${y}-${m}-${day}`)
    }
    return out
  }, [])

  const completedByDay = useMemo(() => {
    const set = new Set(completions.map((c) => `${c.habitId}::${c.date}`))
    const counts = new Map<string, number>()
    for (const key of keys) counts.set(key, 0)
    for (const c of completions) {
      if (set.has(`${c.habitId}::${c.date}`)) {
        counts.set(c.date, (counts.get(c.date) ?? 0) + 1)
      }
    }
    return counts
  }, [completions, keys])

  const moodByDay = useMemo(() => {
    const map = new Map<string, number>()
    for (const m of moods) map.set(m.date, m.value)
    return map
  }, [moods])

  const chartData = keys.map((key) => ({
    day: weekdayShort(key),
    done: completedByDay.get(key) ?? 0,
    mood: moodByDay.get(key) ?? 0,
  }))

  const anyData = chartData.some((d) => d.done > 0) || moods.length > 0

  function MoodTooltip({ active, payload }: any) {
    if (!active || !payload || payload.length === 0) return null
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs shadow-sm">
        <div className="font-medium">Stimmung</div>
        <div style={{ color: success }}>
          {"😀".repeat(payload[0].value)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6" id="panel-week" role="tabpanel">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Woche</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Letzte 7 Tage</p>
      </header>

      {!anyData ? (
        <EmptyState
          title="Noch keine Daten"
          description="Erledige in den nächsten Tagen deine Habits und trage deine Stimmung ein. Die Woche füllt sich dann hier."
          icon={<IconChart className="h-10 w-10" />}
        />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <h2 className="mb-3 text-sm font-semibold tracking-tight">
              Erledigte Habits pro Tag
            </h2>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: muted, fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: muted, fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                      fontSize: 12,
                      color: "var(--text)",
                    }}
                  />
                  <Bar dataKey="done" name="Habits" fill={accent} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <h2 className="mb-3 text-sm font-semibold tracking-tight">Stimmungsverlauf</h2>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: muted, fontSize: 12 }}
                  />
                  <YAxis
                    domain={[1, 5]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: muted, fontSize: 12 }}
                    ticks={[1, 2, 3, 4, 5]}
                  />
                  <Tooltip content={<MoodTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke={success}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: success, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
