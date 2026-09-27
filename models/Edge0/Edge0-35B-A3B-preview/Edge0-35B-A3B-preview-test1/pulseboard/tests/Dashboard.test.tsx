import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard } from '../src/components/Dashboard';
import { ActivityWithStatus } from '../src/types';

const makeActivity = (done: boolean): ActivityWithStatus => ({
  id: `act-${Math.random()}`,
  name: 'Test',
  category: 'Test',
  createdAt: '',
  doneToday: done,
  doneCount: done ? 1 : 0,
  progressPercent: done ? 100 : 0,
});

describe('Dashboard', () => {
  it('shows 0 stats when no activities', () => {
    render(<Dashboard activities={[]} date={new Date()} />);
    // Check progress bar renders with 0
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('calculates correct stats', () => {
    const activities = [
      makeActivity(true),
      makeActivity(true),
      makeActivity(false),
    ];

    render(<Dashboard activities={activities} date={new Date()} />);

    expect(screen.getByText('Erledigt')).toBeInTheDocument();
    expect(screen.getByText('Offen')).toBeInTheDocument();
    // 2 out of 3 = 67%
    expect(screen.getByText(/67%/)).toBeInTheDocument();
  });

  it('shows date display', () => {
    const today = new Date(2025, 0, 15);
    render(<Dashboard activities={[]} date={today} />);

    expect(screen.getByText(/15\. Januar 2025/)).toBeInTheDocument();
  });

  it('shows "Heute" for today\'s date', () => {
    render(<Dashboard activities={[]} date={new Date()} />);
    expect(screen.getByText(/Heute/)).toBeInTheDocument();
  });
});
