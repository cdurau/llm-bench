import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('rendert den Titel wenn angegeben', () => {
    render(<Card title="Test Title">Content</Card>);
    expect(screen.getByText(/test title/i)).toBeInTheDocument();
  });

  it('rendert den Inhalt', () => {
    render(<Card>Test Content</Card>);
    expect(screen.getByText(/test content/i)).toBeInTheDocument();
  });

  it('kann zusätzliche Klassen enthalten', () => {
    render(<Card className="custom-class">Content</Card>);
    const card = screen.getByText(/content/i).parentElement;
    expect(card).toHaveClass('custom-class');
  });
});
