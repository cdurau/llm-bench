import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddActivityForm } from './AddActivityForm';

// Mock für useApp Context
vi.mock('@/contexts/AppContext', () => ({
  useApp: () => ({
    addActivity: vi.fn(),
    appState: {
      activities: [],
      dailyStatuses: [],
      currentViewDate: '2026-09-23'
    }
  })
}));

describe('AddActivityForm', () => {
  it('renders das Modal', () => {
    render(<AddActivityForm isOpen={true} onClose={() => {}} />);
    expect(screen.getByText(/aktivität hinzufügen/i)).toBeInTheDocument();
  });

  it('kann geschlossen werden', () => {
    const onClose = vi.fn();
    render(<AddActivityForm isOpen={true} onClose={onClose} />);
    
    const closeBtn = screen.getByRole('button', { name: /abbrechen/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
