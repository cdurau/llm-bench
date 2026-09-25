import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

export type NotificationType = 'info' | 'success' | 'error'

export interface Notification {
  id: string
  message: string
  type: NotificationType
}

interface NotificationsContextValue {
  notifications: Notification[]
  notify: (message: string, type?: NotificationType) => void
  dismiss: (id: string) => void
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

let counter = 0

const DEFAULT_TTL = 3500

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const dismiss = useCallback((id: string) => {
    setNotifications((list) => list.filter((n) => n.id !== id))
    const timer = timers.current[id]
    if (timer) {
      clearTimeout(timer)
      delete timers.current[id]
    }
  }, [])

  const notify = useCallback((message: string, type: NotificationType = 'info') => {
    const id = `n-${Date.now()}-${counter++}`
    setNotifications((list) => [...list, { id, message, type }])
    timers.current[id] = setTimeout(() => dismiss(id), DEFAULT_TTL)
  }, [dismiss])

  const value = useMemo<NotificationsContextValue>(() => ({ notifications, notify, dismiss }), [
    notifications,
    notify,
    dismiss,
  ])

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  )
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext)
  if (!ctx) {
    throw new Error('useNotifications muss innerhalb eines NotificationsProvider verwendet werden')
  }
  return ctx
}
