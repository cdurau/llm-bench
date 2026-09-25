// Theme store. The active theme is reflected on <html data-theme> and mirrored
// to localStorage so it survives a reload. An inline script in index.html applies
// it before first paint; this hook keeps React in sync with that.

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'klar:theme'
const THEME_META = { light: '#EEEEEC', dark: '#12130F' }

function systemTheme() {
   return window.matchMedia('(prefers-color-scheme: dark)').matches
       ? 'dark'
       : 'light'
}

function readStoredTheme() {
   try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'light' || stored === 'dark') return stored
   } catch {
      /* ignore */
   }
   return systemTheme()
}

export function useTheme() {
    // The inline script already set the attribute, so read the same source to
    // avoid a first-render mismatch.
   const [theme, setTheme] = useState(readStoredTheme)

    // Keep <html>, the theme-color meta, and localStorage in sync with React.
   useEffect(() => {
      document.documentElement.setAttribute('data-theme', theme)
      const meta = document.getElementById('meta-theme-color')
      if (meta) meta.setAttribute('content', THEME_META[theme] || THEME_META.light)
      try {
         localStorage.setItem(STORAGE_KEY, theme)
      } catch {
         /* ignore */
      }
   }, [theme])

    // Follow the OS only until the user makes their own choice.
   useEffect(() => {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const onChange = () => {
         try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored === 'light' || stored === 'dark') return
            setTheme(mq.matches ? 'dark' : 'light')
         } catch {
            /* ignore */
         }
      }
      mq.addEventListener?.('change', onChange)
      return () => mq.removeEventListener?.('change', onChange)
    }, [])

   const toggle = useCallback(() => {
      setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
   }, [])

   const nextSystem = useCallback(() => {
      setTheme(systemTheme())
      try {
         localStorage.removeItem(STORAGE_KEY)
      } catch {
         /* ignore */
      }
   }, [])

   return { theme, toggle, nextSystem }
}
