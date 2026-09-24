import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActivityForm } from './ActivityForm'
import { NotificationsProvider } from '../hooks/useNotifications'

function renderForm(mode: 'create' | 'edit' = 'create', initial?: Parameters<typeof ActivityForm>[1]) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  render(
    <NotificationsProvider>
      <ActivityForm
        mode={mode}
        initial={initial}
        categories={['Gesundheit', 'Zeit']}
        onSubmit={onSubmit}
        onCancel={onCancel}
        onDelete={vi.fn()}
      />
    </NotificationsProvider>,
  )
  return { onSubmit, onCancel }
}

describe('ActivityForm', () => {
  it('übermittelt eine gültige neue Aktivität', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm('create')

    await user.type(within(screen.getByLabelText(/name/i)).querySelector('input')!, 'Sport')
    await user.type(within(screen.getByLabelText(/kategorie/i)).querySelector('input')!, 'Gesundheit')
    await user.click(screen.getByRole('button', { name: /hinzufügen/i }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      name: 'Sport',
      category: 'Gesundheit',
    })
  })

  it('zeigt eine Fehlermeldung bei leerem Namen an', async () => {
    const user = userEvent.setup()
    renderForm('create')

    await user.type(within(screen.getByLabelText(/kategorie/i)).querySelector('input')!, 'G')
    await user.click(screen.getByRole('button', { name: /hinzufügen/i }))

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(/name/i)
  })

  it('befühlt sich im Bearbeitungsmodus mit Bestandsdaten', () => {
    const initial = {
      id: 'a1',
      name: 'Lesen',
      description: 'Abends',
      category: 'Zeit',
      dailyTarget: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
    }
    renderForm('edit', initial)
    expect(screen.getByLabelText(/name/i).querySelector('input')).toHaveValue('Lesen')
    expect(screen.getByRole('button', { name: /speichern/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /löschen/i })).toBeInTheDocument()
  })
})
