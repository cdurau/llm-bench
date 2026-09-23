import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityItem } from './ActivityItem';

// Mock für useApp Context
vi.mock('@/contexts/AppContext', () => ({
  useApp: () => ({
    toggleActivityStatus: vi.fn(),
    setActivityValue: vi.fn(),
    appState: {
      activities: [],
      dailyStatuses: [],
      currentViewDate: '2026-09-23'
    }
  })
}));

describe('ActivityItem', () => {
  const mockActivity = {
    id: 'test-123',
    name: 'Test Activity',
    category: 'Work',
    description: 'Test Description',
    dailyTarget: 10,
    createdAt: new Date().toISOString()
  };

  it('rendert den Aktivitätsnamen', () => {
    render(<ActivityItem activity={mockActivity as any} date="2026-09-23" />);
    expect(screen.getByText(/test activity/i)).toBeInTheDocument();
  });

  it('rendert die Beschreibung wenn vorhanden', () => {
    render(<ActivityItem activity={mockActivity as any} date="2026-09-23" />);
    expect(screen.getByText(/test description/i)).toBeInTheDocument();
  });

  it('rendert die Kategorie wenn vorhanden', () => {
    render(<ActivityItem activity={mockActivity as any} date="2026-09-23" />);
    expect(screen.getByText(/work/i)).toBeInTheDocument();
  });

  it('rendert den daily target wenn vorhanden', () => {
    render(<ActivityItem activity={mockActivity as any} date="2026-09-23" />);
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('zeigt "Noch nicht erreichbar" für Zukunft', () => {
    render(<ActivityItem activity={mockActivity as any} date="2026-09-25" />);
    expect(screen.getByText(/zukunft/i)).toBeInTheDocument();
  });
});
