import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ActivityForm } from '../src/components/ActivityForm';
import { Activity } from '../src/types';

vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-' + Math.random().toString(36).slice(2),
});

const CATEGORIES = ['Gesundheit', 'Produktivität', 'Lernen', 'Soziales', 'Freizeit', 'Sonstiges'];

describe('ActivityForm', () => {
  let onSubmit = vi.fn();
  let onCancel = vi.fn();

  beforeEach(() => {
    onSubmit = vi.fn();
    onCancel = vi.fn();
  });

  it('renders form fields', () => {
    render(<ActivityForm onSubmit={onSubmit} categories={CATEGORIES} />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/beschreibung/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/kategorie/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tagesziel/i)).toBeInTheDocument();
  });

  it('submits with valid data', () => {
    render(<ActivityForm onSubmit={onSubmit} categories={CATEGORIES} />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Joggen' } });
    fireEvent.change(screen.getByLabelText(/beschreibung/i), { target: { value: 'Morgens um 7' } });
    fireEvent.change(screen.getByLabelText(/kategorie/i), { target: { value: 'Gesundheit' } });
    fireEvent.change(screen.getByLabelText(/tagesziel/i), { target: { value: '3' } });

    fireEvent.click(screen.getByRole('button', { name: 'Hinzufügen' }));

    expect(onSubmit).toHaveBeenCalledWith('Joggen', 'Morgens um 7', 'Gesundheit', 3);
  });

  it('submits without optional fields', () => {
    render(<ActivityForm onSubmit={onSubmit} categories={CATEGORIES} />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Lesen' } });
    fireEvent.click(screen.getByRole('button', { name: 'Hinzufügen' }));

    // Default category is the first in the array ('Gesundheit')
    expect(onSubmit).toHaveBeenCalledWith('Lesen', undefined, 'Gesundheit', undefined);
  });

  it('shows error for empty name', () => {
    const { container } = render(<ActivityForm onSubmit={onSubmit} categories={CATEGORIES} />);

    fireEvent.click(screen.getByRole('button', { name: 'Hinzufügen' }));

    // Query by class name for the error message
    const errorEl = container.querySelector('.form-error');
    expect(errorEl).toBeInTheDocument();
    expect(errorEl?.textContent).toBe('Bitte einen Namen eingeben');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows error for invalid daily goal', () => {
    const { container } = render(<ActivityForm onSubmit={onSubmit} categories={CATEGORIES} />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/tagesziel/i), { target: { value: '-5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Hinzufügen' }));

    const errorEl = container.querySelector('.form-error');
    expect(errorEl).toBeInTheDocument();
    expect(errorEl?.textContent).toBe('Tagesziel muss eine positive Zahl sein');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('renders with editing data', () => {
    const editing: Activity = {
      id: 'edit-1',
      name: 'Editierbare Aktivität',
      category: 'Produktivität',
      description: 'Eine Beschreibung',
      createdAt: '2025-01-01T00:00:00Z',
    };

    render(
      <ActivityForm
        onSubmit={onSubmit}
        editing={editing}
        onCancel={onCancel}
        categories={CATEGORIES}
      />
    );

    expect(screen.getByLabelText(/name/i)).toHaveValue('Editierbare Aktivität');
    expect(screen.getByLabelText(/beschreibung/i)).toHaveValue('Eine Beschreibung');
    expect(screen.getByLabelText(/kategorie/i)).toHaveValue('Produktivität');
  });

  it('cancels editing when cancel button clicked', () => {
    const editing: Activity = {
      id: 'edit-2',
      name: 'Editierbare Aktivität',
      category: 'Produktivität',
      createdAt: '2025-01-01T00:00:00Z',
    };

    render(
      <ActivityForm
        onSubmit={onSubmit}
        editing={editing}
        onCancel={onCancel}
        categories={CATEGORIES}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Abbrechen' }));
    expect(onCancel).toHaveBeenCalled();
  });
});
