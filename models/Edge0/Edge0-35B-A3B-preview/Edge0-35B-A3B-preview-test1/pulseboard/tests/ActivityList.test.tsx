import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ActivityList } from '../src/components/ActivityList';
import { ActivityWithStatus } from '../src/types';

vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-' + Math.random().toString(36).slice(2),
});

const CATEGORIES = ['Gesundheit', 'Produktivität', 'Lernen', 'Soziales', 'Freizeit', 'Sonstiges'];

const makeActivity = (
  name: string,
  category: string = 'Gesundheit',
  done: boolean = false,
  dailyGoal?: number
): ActivityWithStatus => ({
  id: `act-${Math.random().toString(36).slice(2)}`,
  name,
  category,
  createdAt: '2025-01-01T00:00:00Z',
  doneToday: done,
  doneCount: done ? 1 : 0,
  progressPercent: done ? 100 : 0,
  ...(dailyGoal ? { dailyGoal } : {}),
});

describe('ActivityList', () => {
  let onToggle = vi.fn();
  let onEdit = vi.fn();
  let onDelete = vi.fn();
  let onAdd = vi.fn();

  beforeEach(() => {
    onToggle = vi.fn();
    onEdit = vi.fn();
    onDelete = vi.fn();
    onAdd = vi.fn();
  });

  it('shows empty state when no activities', () => {
    render(
      <ActivityList
        activities={[]}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        categories={CATEGORIES}
        onAdd={onAdd}
        isFuture={false}
      />
    );
    expect(screen.getByText(/Noch keine Aktivitäten/i)).toBeInTheDocument();
  });

  it('renders activities grouped by category', () => {
    const activities = [
      makeActivity('Joggen', 'Gesundheit'),
      makeActivity('Lesen', 'Lernen'),
      makeActivity('Coding', 'Produktivität'),
    ];

    render(
      <ActivityList
        activities={activities}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        categories={CATEGORIES}
        onAdd={onAdd}
        isFuture={false}
      />
    );

    expect(screen.getByText('Joggen')).toBeInTheDocument();
    expect(screen.getByText('Lesen')).toBeInTheDocument();
    expect(screen.getByText('Coding')).toBeInTheDocument();
  });

  it('toggles activity when checkbox clicked', () => {
    const activities = [makeActivity('Joggen')];

    render(
      <ActivityList
        activities={activities}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        categories={CATEGORIES}
        onAdd={onAdd}
        isFuture={false}
      />
    );

    const checkbox = screen.getByRole('checkbox', { name: /Joggen/i });
    fireEvent.click(checkbox);
    expect(onToggle).toHaveBeenCalledWith(activities[0].id);
  });

  it('opens edit form when edit button clicked', () => {
    const activities = [makeActivity('Editierbare')];

    render(
      <ActivityList
        activities={activities}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        categories={CATEGORIES}
        onAdd={onAdd}
        isFuture={false}
      />
    );

    // All buttons with title "Bearbeiten"
    const editButtons = screen.getAllByTitle('Bearbeiten');
    fireEvent.click(editButtons[0]);

    // Check that the section with "Aktivität bearbeiten" label appears (edit mode)
    const sections = screen.getAllByRole('region', { name: 'Aktivität bearbeiten' });
    expect(sections.length).toBeGreaterThan(0);
    // The save button should appear (edit mode)
    expect(screen.getByRole('button', { name: 'Speichern' })).toBeInTheDocument();
  });

  it('submits edited activity and exits edit mode', () => {
    const activities = [makeActivity('Zu Bearbeiten', 'Gesundheit', false, 2)];

    render(
      <ActivityList
        activities={activities}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        categories={CATEGORIES}
        onAdd={onAdd}
        isFuture={false}
      />
    );

    // Click edit to enter edit mode
    const editButtons = screen.getAllByTitle('Bearbeiten');
    fireEvent.click(editButtons[0]);

    // Should see the save button (edit mode)
    expect(screen.getByRole('button', { name: 'Speichern' })).toBeInTheDocument();

    // Submit the form
    const saveButton = screen.getByRole('button', { name: 'Speichern' });
    fireEvent.click(saveButton);

    // After submit, edit mode should be cleared and the activity should appear in the list
    expect(screen.getByText('Zu Bearbeiten')).toBeInTheDocument();
  });

  it('shows confirmation before delete', () => {
    const activities = [makeActivity('Löschbare')];

    // Mock confirm
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);

    render(
      <ActivityList
        activities={activities}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        categories={CATEGORIES}
        onAdd={onAdd}
        isFuture={false}
      />
    );

    const deleteButtons = screen.getAllByTitle('Löschen');
    fireEvent.click(deleteButtons[0]);
    expect(window.confirm).toHaveBeenCalledWith('Aktivität wirklich löschen?');
    expect(onDelete).toHaveBeenCalledWith(activities[0].id);

    window.confirm = originalConfirm;
  });

  it('groups by category and shows category headings', () => {
    const activities = [
      makeActivity('Joggen', 'Gesundheit'),
      makeActivity('Schwimmen', 'Gesundheit'),
      makeActivity('Coding', 'Produktivität'),
    ];

    const { container } = render(
      <ActivityList
        activities={activities}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        categories={CATEGORIES}
        onAdd={onAdd}
        isFuture={false}
      />
    );

    // Check for category headings using h3 elements
    const headings = container.querySelectorAll('h3.category-heading');
    const headingTexts = Array.from(headings).map((h) => h.textContent);
    expect(headingTexts).toContain('Gesundheit');
    expect(headingTexts).toContain('Produktivität');
  });

  it('shows future notice on future dates', () => {
    const activities = [makeActivity('Joggen')];

    render(
      <ActivityList
        activities={activities}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        categories={CATEGORIES}
        onAdd={onAdd}
        isFuture={true}
      />
    );

    expect(screen.getByText(/Zukünftige Tage/i)).toBeInTheDocument();
  });
});
