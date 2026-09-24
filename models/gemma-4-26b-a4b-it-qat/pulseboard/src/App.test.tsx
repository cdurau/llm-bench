import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import { storageService } from './services/storageService';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
vi.spyOn(window, 'confirm').mockImplementation(() => true);

describe('PulseBoard Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render the title', () => {
    render(<App />);
    expect(screen.getByText(/PulseBoard/i)).toBeInTheDocument();
  });

  it('should allow adding an activity', async () => {
    render(<App />);
    
    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test Activity' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Test Category' } });
    
    const saveButton = screen.getByRole('button', { name: /speichern/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Test Activity')).toBeInTheDocument();
    });
  });

  it('should persist activities in localStorage', async () => {
    render(<App />);
    
    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Persistence Test' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Test' } });
    fireEvent.click(screen.getByRole('button', { name: /speichern/i }));

    await waitFor(() => {
      expect(screen.getByText('Persistence Test')).toBeInTheDocument();
    });

    // Reload component (re-render)
    localStorage.clear();
    const { rerender } = render(<App />);
    
    // Re-populate storage to simulate reload
    const testState = {
      version: "1.0.0",
      activities: [{ id: '1', name: 'Persistence Test', category: 'Test' }],
      dailyStatuses: {}
    };
    localStorage.setItem('pulseboard_data', JSON.stringify(testState));
    
    rerender(<App />);
    await waitFor(() => {
      expect(screen.getByText('Persistence Test')).toBeInTheDocument();
    });
  });
});
