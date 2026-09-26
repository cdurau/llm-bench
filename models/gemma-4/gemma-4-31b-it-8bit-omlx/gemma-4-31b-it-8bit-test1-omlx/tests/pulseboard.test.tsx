import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PulseProvider } from '../src/context/PulseContext';
import { PulseBoard } from '../src/components/PulseBoard';
import { storage } from '../src/lib/storage';
import '@testing-library/jest-dom';

// Mock LocalStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <PulseProvider>
      {ui}
    </PulseProvider>
  );
};

describe('PulseBoard Core Functionality', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('allows adding a new activity', async () => {
    renderWithProvider(<PulseBoard />);
    
    const addButton = screen.getByLabelText(/Add Activity/i);
    fireEvent.click(addButton);
    
    const nameInput = screen.getByPlaceholderText(/e.g., Morning Meditation/i);
    fireEvent.change(nameInput, { target: { value: 'Drink Water' } });
    
    const saveButton = screen.getByText(/Save Activity/i);
    fireEvent.click(saveButton);
    
    expect(screen.getByText('Drink Water')).toBeInTheDocument();
  });

  it('allows toggling activity completion for today', () => {
    // Setup: add an activity manually to storage
    const activityId = 'test-id';
    const data = {
      version: 1,
      activities: [{ id: activityId, name: 'Test Activity', category: 'General', createdAt: Date.now() }],
      dailyStatus: {},
    };
    localStorage.setItem('pulseboard_data', JSON.stringify(data));

    renderWithProvider(<PulseBoard />);
    
    const checkbox = screen.getByLabelText(/Toggle completion/i);
    fireEvent.click(checkbox);
    
    expect(checkbox).toHaveClass('bg-olive-600');
    
    fireEvent.click(checkbox);
    expect(checkbox).not.toHaveClass('bg-olive-600');
  });

  it('prevents toggling activities on future dates', () => {
    // Setup: mock date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    vi.setSystemTime(tomorrow);

    const activityId = 'test-id';
    const data = {
      version: 1,
      activities: [{ id: activityId, name: 'Future Task', category: 'General', createdAt: Date.now() }],
      dailyStatus: {},
    };
    localStorage.setItem('pulseboard_data', JSON.stringify(data));

    renderWithProvider(<PulseBoard />);
    
    const checkbox = screen.getByLabelText(/Toggle completion/i);
    fireEvent.click(checkbox);
    
    expect(checkbox).not.toHaveClass('bg-olive-600');
    
    vi.useRealTimers();
  });

  it('handles corrupted storage data gracefully', () => {
    localStorage.setItem('pulseboard_data', 'not-json');
    
    renderWithProvider(<PulseBoard />);
    
    expect(screen.getByText(/No activities defined yet/i)).toBeInTheDocument();
  });

  it('handles version mismatch by resetting data', () => {
    localStorage.setItem('pulseboard_data', JSON.stringify({
      version: 999,
      activities: [],
      dailyStatus: {},
    }));
    
    renderWithProvider(<PulseBoard />);
    
    expect(screen.getByText(/No activities defined yet/i)).toBeInTheDocument();
  });
});
