import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { STORAGE_KEY } from './lib/storage';
import { setClock } from './lib/clock';

/** Fester "heute": Sonntag, 27. September 2026, 12 Uhr. */
beforeEach(() => {
  setClock(new Date(2026, 8, 27, 12));
});

async function openAddDialog(user: ReturnType<typeof userEvent.setup>) {
  // Es gibt (im leeren Zustand) 1–2 Buttons mit diesem Namen; den letzten nehmen.
  const buttons = screen.getAllByRole('button', { name: 'Aktivität hinzufügen' });
  await user.click(buttons[buttons.length - 1]);
  return screen.getByRole('dialog');
}

interface AddOptions {
  name: string;
  category?: string;
  target?: string; // String, weil Eingabefeld
  description?: string;
}

async function addActivity(
  user: ReturnType<typeof userEvent.setup>,
  options: AddOptions,
) {
  const dialog = await openAddDialog(user);
  await user.type(within(dialog).getByLabelText('Name'), options.name);
  if (options.category !== undefined) {
    await user.type(within(dialog).getByLabelText('Kategorie'), options.category);
  }
  if (options.target !== undefined) {
    await user.type(within(dialog).getByLabelText('Tagesziel'), options.target);
  }
  if (options.description !== undefined) {
    await user.type(within(dialog).getByLabelText('Beschreibung'), options.description);
  }
  await user.click(within(dialog).getByRole('button', { name: 'Speichern' }));
}

function dialogIsOpen() {
  return screen.queryByRole('dialog') !== null;
}

describe('App: Darstellung', () => {
  it('zeigt leeren Zustand mit Einladung, Datum und Wortmarke', () => {
    render(<App />);
    expect(screen.getByText('PulseBoard')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Sonntag, 27. September',
    );
    expect(screen.getByText('Noch keine Aktivitäten')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aktivität hinzufügen' })).toBeInTheDocument();
  });
});

describe('App: Aktivitäten verwalten', () => {
  it('Erstellen: Formular erzeugt Zeile mit Zähl-Chip bei Tagesziel > 1', async () => {
    const user = userEvent.setup();
    render(<App />);

    await addActivity(user, { name: 'Morgens laufen', category: 'Gesundheit', target: '3' });

    expect(dialogIsOpen()).toBe(false);
    expect(screen.getByText('Morgens laufen')).toBeInTheDocument();
    expect(screen.getByText('0/3')).toBeInTheDocument();
    // Kategorie-Vorschlag kommt aus dem Datalist-Bezug (Test auf Anwesenheit der Zeile reicht)
    expect(screen.getByRole('button', { name: '„Morgens laufen“ bearbeiten' })).toBeInTheDocument();
  });

  it('Erstellen: ohne Tagesziel wird einmal abgehackt (kein Chip)', async () => {
    const user = userEvent.setup();
    render(<App />);

    await addActivity(user, { name: 'E-Mails aufräumen' });

    expect(screen.getByText('E-Mails aufräumen')).toBeInTheDocument();
    expect(screen.queryByText(/0\/1/)).not.toBeInTheDocument();
  });

  it('Bearbeiten: Name und Ziel werden aktualisiert', async () => {
    const user = userEvent.setup();
    render(<App />);
    await addActivity(user, { name: 'Wasser trinken', target: '8' });

    await user.click(screen.getByRole('button', { name: '„Wasser trinken“ bearbeiten' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { level: 2 })).toHaveTextContent(
      'Aktivität bearbeiten',
    );

    const nameField = within(dialog).getByLabelText('Name');
    await user.clear(nameField);
    await user.type(nameField, '8 Gläser Wasser');
    await user.click(within(dialog).getByRole('button', { name: 'Speichern' }));

    expect(dialogIsOpen()).toBe(false);
    expect(screen.getByText('8 Gläser Wasser')).toBeInTheDocument();
    expect(screen.getByText('0/8')).toBeInTheDocument();
  });

  it('Löschen: Zeile verschwindet, leere Liste zeigt Empty State wieder', async () => {
    const user = userEvent.setup();
    render(<App />);
    await addActivity(user, { name: 'Temporär' });

    await user.click(screen.getByRole('button', { name: '„Temporär“ löschen' }));

    expect(screen.queryByText('Temporär')).not.toBeInTheDocument();
    expect(screen.getByText('Noch keine Aktivitäten')).toBeInTheDocument();
  });

  it('Formular-Validierung: leerer Name → Fehler, Dialog bleibt offen', async () => {
    const user = userEvent.setup();
    render(<App />);

    const dialog = await openAddDialog(user);
    await user.click(within(dialog).getByRole('button', { name: 'Speichern' }));

    expect(dialogIsOpen()).toBe(true);
    expect(screen.getByText('Gib der Aktivität einen Namen.')).toBeInTheDocument();
    expect(screen.queryByText('Noch keine Aktivitäten')).not.toBeInTheDocument();
  });
});

describe('App: Tagesstatus & Persistenz', () => {
  it('Abhaken überlebt einen Reload (gleicher localStorage)', async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await addActivity(user, { name: 'E-Mails aufräumen' });

    await user.click(screen.getByRole('button', { name: '„E-Mails aufräumen“ abhaken' }));
    expect(screen.getByRole('button', { name: '„E-Mails aufräumen“ abhaken' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    first.unmount();
    render(<App />);

    const check = screen.getByRole('button', {
      name: '„E-Mails aufräumen“ wieder offen machen',
    });
    expect(check).toHaveAttribute('aria-pressed', 'true');
  });

  it('Ziel 3: drei Klicks = erledigt, vierter Klick setzt zurück', async () => {
    const user = userEvent.setup();
    render(<App />);
    await addActivity(user, { name: 'Laufen', target: '3' });

    const check = () =>
      screen.getByRole('button', {
        name: /Fortschritt für „Laufen“/,
      });

    await user.click(check());
    expect(screen.getByText('1/3')).toBeInTheDocument();
    await user.click(check());
    await user.click(check());

    const doneButton = screen.getByRole('button', {
      name: '„Laufen“ ist erledigt – auf 0 zurücksetzen',
    });
    expect(doneButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('3/3')).toBeInTheDocument();

    await user.click(doneButton);
    expect(screen.getByText('0/3')).toBeInTheDocument();
  });

  it('Tastatur: Space auf dem Toggle-Button häkt ab', async () => {
    const user = userEvent.setup();
    render(<App />);
    await addActivity(user, { name: 'Atmen üben' });

    const check = screen.getByRole('button', { name: '„Atmen üben“ abhaken' });
    check.focus();
    await user.keyboard(' ');

    expect(
      screen.getByRole('button', { name: '„Atmen üben“ wieder offen machen' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('App: Datumswechsel', () => {
  it('Status bleibt pro Tag erhalten, Navigation via Hash', async () => {
    const user = userEvent.setup();
    render(<App />);
    await addActivity(user, { name: 'Journal schreiben' });

    await user.click(screen.getByRole('button', { name: '„Journal schreiben“ abhaken' }));

    // weiter nach vorn (zukünftiger Tag)
    await user.click(screen.getByRole('button', { name: 'Nächster Tag' }));
    expect(window.location.hash).toBe('#/2026-09-28');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Montag, 28. September',
    );
    expect(screen.getByText('künftiger Tag')).toBeInTheDocument();

    // künftiger Tag: Toggle gesperrt
    const futureCheck = screen.getByRole('button', { name: '„Journal schreiben“ abhaken' });
    expect(futureCheck).toBeDisabled();

    // zurück zu heute: Status ist erhalten
    await user.click(screen.getByRole('button', { name: 'Heute' }));
    expect(window.location.hash).toBe('#/2026-09-27');
    expect(
      screen.getByRole('button', { name: '„Journal schreiben“ wieder offen machen' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('Reload auf gespeicherter Hash stellt den Tag wieder her', async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await addActivity(user, { name: 'Spaziergang' });
    await user.click(screen.getByRole('button', { name: 'Nächster Tag' }));
    expect(window.location.hash).toBe('#/2026-09-28');

    first.unmount();
    render(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Montag, 28. September',
    );
    expect(screen.getByText('künftiger Tag')).toBeInTheDocument();
  });
});

describe('App: Beschädigte gespeicherte Daten', () => {
  it('kaputtes JSON → Banner, leere App, trotzdem nutzbar', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(STORAGE_KEY, '{{ kein JSON');

    render(<App />);

    // Kein Crash, Hinweosbanner, Empty State
    expect(
      screen.getByText(/Gespeicherte Daten konnten nicht gelesen werden/),
    ).toBeInTheDocument();
    expect(screen.getByText('Noch keine Aktivitäten')).toBeInTheDocument();

    // App bleibt nutzbar; nach erster Speicherung verschwindet das Banner
    await addActivity(user, { name: 'Neuanfang' });
    expect(screen.getByText('Neuanfang')).toBeInTheDocument();
    expect(
      screen.queryByText(/Gespeicherte Daten konnten nicht gelesen werden/),
    ).not.toBeInTheDocument();
  });

  it('Banner lässt sich manuell ausblenden', () => {
    window.localStorage.setItem(STORAGE_KEY, 'null');
    render(<App />);
    const banner = screen.getByText(/Gespeicherte Daten konnten nicht gelesen werden/);
    expect(banner).toBeInTheDocument();
    const dismiss = screen.getByRole('button', { name: 'Hinweis ausblenden' });
    dismiss.click();
    expect(
      screen.queryByText(/Gespeicherte Daten konnten nicht gelesen werden/),
    ).not.toBeInTheDocument();
  });
});

describe('App: Dashboard', () => {
  it('Stats + Kategorie-Übersicht reagieren auf Abhaken', async () => {
    const user = userEvent.setup();
    render(<App />);
    await addActivity(user, { name: 'Meditation', category: 'Gesundheit' });
    await addActivity(user, { name: 'Bücher lesen', category: 'Privat' });

    // 0 % im Anfangszustand
    const stats = screen.getByRole('region', { name: 'Tagesübersicht' });
    expect(within(stats).getByText('0 %')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '„Meditation“ abhaken' }));

    expect(within(stats).getByText('50 %')).toBeInTheDocument();
    expect(within(stats).getByText('1')).toBeInTheDocument();

    // Kategorie-Übersicht: Meditation erledigt, Bücher nicht
    const cat = screen.getByRole('region', { name: 'Übersicht nach Kategorie' });
    expect(within(cat).getByText('1/1')).toBeInTheDocument();
    expect(within(cat).getByText('0/1')).toBeInTheDocument();
  });

  it('bei allem erledigt erscheint die Bestätigung', async () => {
    const user = userEvent.setup();
    render(<App />);
    await addActivity(user, { name: 'Letzte Aktivität' });
    await user.click(screen.getByRole('button', { name: '„Letzte Aktivität“ abhaken' }));
    expect(screen.getByText('Alles für diesen Tag erledigt.')).toBeInTheDocument();
  });
});
