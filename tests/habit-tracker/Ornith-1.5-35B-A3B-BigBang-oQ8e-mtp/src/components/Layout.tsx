import type { ReactNode } from "react"
import {
  IconCalendar,
  IconChart,
  IconSettings,
} from "./icons"

type Tab = "today" | "week" | "settings"

interface LayoutProps {
  active: Tab
  setActive: (tab: Tab) => void
  children: ReactNode
}

const TABS: Array<{ id: Tab; label: string; icon: typeof IconCalendar }> = [
  { id: "today", label: "Heute", icon: IconCalendar },
  { id: "week", label: "Woche", icon: IconChart },
  { id: "settings", label: "Einstellungen", icon: IconSettings },
]

export default function Layout({ active, setActive, children }: LayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-[calc(1.5rem+var(--safe-bottom))] pt-6">
        <main className="flex-1">{children}</main>
        <nav
          className="fixed inset-x-0 bottom-0 z-10 border-t border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md"
          role="tablist"
          aria-label="Hauptnavigation"
        >
          <div className="mx-auto flex max-w-md items-center justify-around px-2 pb-[var(--safe-bottom)] pt-2">
            {TABS.map(({ id, label, icon: Icon }) => {
              const isActive = active === id
              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${id}`}
                  onClick={() => setActive(id)}
                  className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-xs font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-[var(--accent)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                  style={{ minHeight: 44 }}
                >
                  <Icon
                    className={`h-5 w-5 transition-transform duration-200 ${
                      isActive ? "scale-105" : "scale-100"
                    }`}
                  />
                  {label}
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
