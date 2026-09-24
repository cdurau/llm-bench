import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../App'
import { NotificationsProvider } from '../hooks/useNotifications'
import { STORAGE_KEY } from '../types'

function renderApp() {
  render(
    <NotificationsProvider>
      <App />
    </NotificationsProvider>,
  )
}

async function addActivity(user: Awaited<ReturnType<typeof userEvent.setup>>, name: string, category: string) {
  await user.click(screen.getByRole('button', { name: /neue aktivität/i }))
  // Formular innerhalb des Panels bedienen.
  const nameInput = document.querySelector('input[aria-required="true"]') as HTMLInputElement
  await user.type(nameInput, name)
  const catInput = Array.from(document.querySelectorAll('input[list="categories"]')).pop() as HTMLInputElement
  await user.type(catInput, category)
  await user.click(screen.getByRole('button', { name: /hinzufügen/i }))
}

describe('App — End-to-End', () => {
  it('legt eine Aktivität an und zeigt sie an', async () => {
    const user = userEvent.setup()
    renderApp()
    await addActivity(user, 'Sport', 'Gesundheit')

    expect(screen.getByRole('listitem', { name: /sport/i })).toBeInTheDocument()
    expect(screen.getByText('Gesamt')).toHaveTextContent('1')
  })

  it('markiert eine Aktivität als erledigt und aktualisiert das Dashboard', async () => {
    const user = userEvent.setup()
    renderApp()
    await addActivity(user, 'Wasser trinken', 'Gesundheit')

    const item = screen.getByRole('listitem', { name: /wasser/i })
    const check = within(item).getByRole('button')
    expect(check).toHaveAttribute('aria-pressed', 'false')

    await user.click(check)
    expect(check).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Erledigt')).toHaveTextContent('1')
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })

  it('speichert Änderungen im localStorage', async () => {
    const user = userEvent.setup()
    renderApp()
    await addActivity(user, 'Lesen', 'Zeit')
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(Object.keys(stored.activities).length).toBe(1)
  })

  it('erlaubt das Ansehen eines zukünftigen Tags, markiert ihn aber nicht', async () => {
    const user = userEvent.setup()
    renderApp()
    await addActivity(user, 'Sport', 'Gesundheit')

    // Zum nächsten Tag navigieren.
    await user.click(screen.getByRole('button', { name: /nächster tag/i }))
    expect(screen.getByText(/zukünftiger tag/i)).toBeInTheDocument()

    const check = within(screen.getByRole('listitem', { name: /sport/i })).getByRole('button')
    expect(check).toBeDisabled()
  })

  it('zeigt einen leeren State ohne Aktivitäten', () => {
    renderApp()
    expect(screen.getByRole('region', { name: 'Keine Einträge' })).toBeInTheDocument()
    expect(screen.getByText(/erste aktivität anlegen/i)).toBeInTheDocument()
  })

  it('stürzt bei beschädigten Daten nicht ab', () => {
    localStorage.setItem(STORAGE_KEY, '[[[')
    expect(() => renderApp()).not.toThrow()
    expect(screen.getByRole('region', { name: 'Keine Einträge' })).toBeInTheDocument()
  })
})
