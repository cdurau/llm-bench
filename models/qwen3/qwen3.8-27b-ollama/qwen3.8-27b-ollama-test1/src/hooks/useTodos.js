// Framework-agnostic store: holds todo state, derives the open count, and
// mirrors everything to localStorage so tasks survive a reload.

import { useCallback, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'klar:items'

function uid() {
   if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID()
   }
   return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function normalize(item) {
    // Be forgiving when reading persisted data so a corrupted or hand-edited
    // localStorage value can never crash the app.
   if (!item || typeof item !== 'object') return null
   const text = typeof item.text === 'string' ? item.text.trim() : ''
   if (!text) return null
   return {
      id: typeof item.id === 'string' && item.id ? item.id : uid(),
      text,
      done: item.done === true,
      createdAt: Number.isFinite(item.createdAt) ? item.createdAt : Date.now(),
   }
}

function loadInitial() {
   try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return parsed.map(normalize).filter(Boolean)
    } catch {
      return []
    }
}

export function useTodos() {
   const [items, setItems] = useState(loadInitial)

    // Persist on every change so the list survives a reload.
   useEffect(() => {
      try {
         localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
       } catch {
          // Ignore quota / serialization errors — the in-memory list still works.
       }
    }, [items])

   const add = useCallback((rawText) => {
      const text = rawText.trim()
      if (!text) return null
      const item = { id: uid(), text, done: false, createdAt: Date.now() }
      setItems((prev) => [item, ...prev])
      return item
   }, [])

   const toggle = useCallback((id) => {
      setItems((prev) =>
         prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it)),
        )
    }, [])

   const edit = useCallback((id, rawText) => {
      const text = rawText.trim()
      setItems((prev) =>
         prev
             .map((it) => (it.id === id ? { ...it, text } : it))
             .filter((it) => it.text.length > 0), // empty edit removes the item
        )
    }, [])

   const remove = useCallback((id) => {
      setItems((prev) => prev.filter((it) => it.id !== id))
    }, [])

   const clearCompleted = useCallback(() => {
      setItems((prev) => prev.filter((it) => !it.done))
    }, [])

   const openCount = useMemo(
      () => items.filter((it) => !it.done).length,
       [items],
    )
   const doneCount = items.length - openCount

   return {
      items,
      add,
      toggle,
      edit,
      remove,
      clearCompleted,
      openCount,
      doneCount,
   }
}
