import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryStats } from './CategoryStats';

describe('CategoryStats', () => {
  it('zeigt "Noch keine Aktivitäten" wenn keine Stats vorhanden sind', () => {
    render(<CategoryStats stats={{}} />);
    expect(screen.getByText(/noch keine aktivitäten mit kategorien/i)).toBeInTheDocument();
  });

  it('rendert Kategorien', () => {
    const stats = {
      'Work': { completed: 5, total: 10 },
      'Health': { completed: 3, total: 5 }
    };
    render(<CategoryStats stats={stats} />);
    expect(screen.getByText(/work/i)).toBeInTheDocument();
    expect(screen.getByText(/health/i)).toBeInTheDocument();
  });

  it('zeigt richtigen Fortschritt in %', () => {
    const stats = {
      'Work': { completed: 5, total: 10 }
    };
    render(<CategoryStats stats={stats} />);
    expect(screen.getByText(/5\/10/i)).toBeInTheDocument();
    expect(screen.getByText(/\(50%\)/i)).toBeInTheDocument();
  });
});
