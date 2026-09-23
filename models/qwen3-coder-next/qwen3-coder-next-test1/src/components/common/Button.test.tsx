import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('rendert den Kind-Text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText(/click me/i)).toBeInTheDocument();
  });

  it('ändert den Styles basierend auf variant', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByText(/primary/i).closest('button');
    expect(button).toHaveClass('bg-blue-600');

    render(<Button variant="secondary">Secondary</Button>);
    const button2 = screen.getByText(/secondary/i).closest('button');
    expect(button2).toHaveClass('bg-gray-100');

    render(<Button variant="danger">Danger</Button>);
    const button3 = screen.getByText(/danger/i).closest('button');
    expect(button3).toHaveClass('bg-red-600');

    render(<Button variant="ghost">Ghost</Button>);
    const button4 = screen.getByText(/ghost/i).closest('button');
    expect(button4).toHaveClass('hover:bg-gray-100');
  });

  it('ändert den Styles basierend auf size', () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByText(/small/i).closest('button');
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');

    render(<Button size="lg">Large</Button>);
    const button2 = screen.getByText(/large/i).closest('button');
    expect(button2).toHaveClass('px-6', 'py-3', 'text-lg');
  });

  it('kann disabled sein', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText(/disabled/i).closest('button');
    expect(button).toBeDisabled();
  });

  it('ruft onClick Handler auf', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByText(/click me/i).closest('button');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('zeigt Loading Spinner an', () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByText(/loading/i).closest('button');
    expect(button).toBeInTheDocument();
    // Der Spinner ist ein svg element mit animate-spin klasse
    const spinner = button?.querySelector('svg.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('kann ein Icon rendern', () => {
    const icon = <svg className="icon" data-testid="test-icon">Icon</svg>;
    render(<Button icon={icon}>With Icon</Button>);
    
    expect(screen.getByText(/with icon/i)).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    // Prüfen ob das Icon innerhalb des Buttons ist
    const button = screen.getByText(/with icon/i).closest('button');
    const iconElement = button?.querySelector('.icon');
    expect(iconElement).toBeInTheDocument();
  });
});
