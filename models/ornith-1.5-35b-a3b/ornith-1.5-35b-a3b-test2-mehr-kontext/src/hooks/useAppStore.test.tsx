import { describe, expect, it } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAppStore } from '../hooks/useAppStore'
import { getCompletedCount } from '../store/createStore'
import { STORAGE_KEY } from '../types'

describe('useAppStore (React-Integration, localStorage)', () => {
  it('startet mit einem leeren Zustand', () => {
    const { result } = renderHook(() => useAppStore())
    expect(result.getState().data.activities).toEqual({})
  })

  it('erstellt, bearbeitet und löscht über den Hook', () => {
    const { result } = renderHook(() => useAppStore())

    act(() => {
      result.addActivity({ name: 'Sport', category: 'G', dailyTarget: 1 })
    })
    expect(Object.keys(result.getState().data.activities).length).toBe(1)

    const id = Object.keys(result.getState().data.activities)[0]
    act(() => {
      result.editActivity(id, { name: 'Fitness', category: 'Gesundheit', dailyTarget: 2 })
    })
    expect(result.getState().data.activities[id].name).toBe('Fitness')

    act(() => {
      result.deleteActivity(id)
    })
    expect(result.getState().data.activities[id]).toBeUndefined()
  })

  it('speichert den Tagesstatus und überlebt einen Reload', () => {
    const { result, rerender } = renderHook(() => useAppStore())
    const date = result.getState().selectedDate

    act(() => {
      result.addActivity({ name: 'Wasser', category: 'G', dailyTarget: 0 })
    })
    const id = Object.keys(result.getState().data.activities)[0]

    act(() => {
      result.toggleComplete(id, date)
    })
    expect(getCompletedCount(result.getState().data, id, date)).toBe(1)

    // Reload: neuer Hook-Lesevorgang aus dem gleichen localStorage.
    rerender()
    expect(getCompletedCount(result.getState().data, id, date)).toBe(1)
  })

  it('erholt sich von beschädigten localStorage-Daten', () => {
    localStorage.setItem(STORAGE_KEY, '{ corrupt data')
    const { result } = renderHook(() => useAppStore())
    expect(result.getState().data.activities).toEqual({})
  })

  it('wählt einen Tag aus', () => {
    const { result } = renderHook(() => useAppStore())
    act(() => {
      result.setSelectedDate('2026-01-15')
    })
    expect(result.getState().selectedDate).toBe('2026-01-15')
  })
})
