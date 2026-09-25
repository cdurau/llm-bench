import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressCard } from './ProgressCard';

describe('ProgressCard', () => {
  it('rendert den Tagesfortschritts-Text', () => {
    render(<ProgressCard completed={5} total={10} percent={50} />);
    expect(screen.getByText(/tagesfortschritt/i)).toBeInTheDocument();
  });

  it('zeigt richtigen Fortschritts-Text', () => {
    render(<ProgressCard completed={3} total={10} percent={30} />);
    expect(screen.getByText(/3 von 10 aktivitäten erledigt/i)).toBeInTheDocument();
  });

  it('zeigt 100% an wenn alle erledigt sind', () => {
    render(<ProgressCard completed={10} total={10} percent={100} />);
    expect(screen.getByText(/100%/i)).toBeInTheDocument();
  });

  it('zeigt "Alle Aufgaben erledigt" wenn fertig', () => {
    render(<ProgressCard completed={10} total={10} percent={100} />);
    expect(screen.getByText(/alle aufgaben erledigt/i)).toBeInTheDocument();
  });
});
