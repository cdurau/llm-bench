import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  const icon = <svg className="icon">Icon</svg>;

  it('rendert das Icon', () => {
    render(<EmptyState icon={icon} title="Empty" />);
    expect(screen.getByText(/Icon/i)).toBeInTheDocument();
  });

  it('rendert den Titel', () => {
    render(<EmptyState icon={icon} title="Empty" />);
    expect(screen.getByText(/empty/i)).toBeInTheDocument();
  });

  it('rendert die Beschreibung wenn angegeben', () => {
    render(<EmptyState icon={icon} title="Empty" description="No items" />);
    expect(screen.getByText(/no items/i)).toBeInTheDocument();
  });

  it('rendert die Action wenn angegeben', () => {
    const action = <button>Button</button>;
    render(<EmptyState icon={icon} title="Empty" action={action} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
