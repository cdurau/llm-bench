import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Dashboard } from './Dashboard'
import type { DayStats } from '../store/createStore'

const stats: DayStats = {
  total: 4,
  completed: 2,
  open: 2,
  percent: 50,
  byCategory: [
    { name: 'Gesundheit', total: 2, completed: 1 },
    { name: 'Zeit', total: 2, completed: 1 },
  ],
}

describe('Dashboard', () => {
  it('zeigt die Kernstatistik an', () => {
    render(<Dashboard stats={stats} />)
    expect(screen.getByLabelText('Erledigt')).toHaveTextContent('2')
    expect(screen.getByLabelText('Offen')).toHaveTextContent('2')
    expect(screen.getByLabelText('Gesamt')).toHaveTextContent('4')
  })

  it('zeigt den Fortschrittsbalken mit aria-Werten', () => {
    render(<Dashboard stats={stats} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '50')
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('ordnet Kategorien mit Zählständen', () => {
    render(<Dashboard stats={stats} />)
    expect(screen.getByText('Gesundheit')).toBeInTheDocument()
    expect(screen.getByText('Zeit')).toBeInTheDocument()
    expect(screen.getByText('1/2')).toBeInTheDocument()
  })

  it('zeigt keine Kategorie-Anzeige bei leeren Daten', () => {
    render(<Dashboard stats={{ ...stats, byCategory: [] }} />)
    expect(screen.queryByText('Kategorien')).not.toBeInTheDocument()
  })
})
