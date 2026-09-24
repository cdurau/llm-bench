import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DayNavigator } from './DayNavigator'
import { todayKey } from '../lib/date'

describe('DayNavigator', () => {
  it('wechselt zum vorherigen Tag', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<DayNavigator selectedDate="2026-09-24" onSelectDate={onSelect} />)
    await user.click(screen.getByRole('button', { name: /vorheriger tag/i }))
    expect(onSelect).toHaveBeenCalledWith('2026-09-23')
  })

  it('wechselt zum nächster Tag', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<DayNavigator selectedDate="2026-09-24" onSelectDate={onSelect} />)
    await user.click(screen.getByRole('button', { name: /nächster tag/i }))
    expect(onSelect).toHaveBeenCalledWith('2026-09-25')
  })

  it('springt zu heute', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<DayNavigator selectedDate="2026-01-01" onSelectDate={onSelect} />)
    await user.click(screen.getByRole('button', { name: /heute/i }))
    expect(onSelect).toHaveBeenCalledWith(todayKey())
  })

  it('zeigt die Navigation mit Knöpfen und Untertitel an', () => {
    render(<DayNavigator selectedDate="2026-09-24" onSelectDate={vi.fn()} />)
    expect(screen.getByRole('button', { name: /vorheriger tag/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /nächster tag/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /heute/i })).toBeInTheDocument()
    expect(screen.getByText(/tagesfortschritt|zukünftiger tag/i)).toBeInTheDocument()
  })
})
