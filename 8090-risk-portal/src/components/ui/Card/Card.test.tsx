import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from './Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Card title="Card Title">Content</Card>);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Title').tagName).toBe('H3');
  });

  it('renders subtitle when provided', () => {
    render(<Card subtitle="Card Subtitle">Content</Card>);
    expect(screen.getByText('Card Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Card Subtitle').tagName).toBe('P');
  });

  it('renders both title and subtitle', () => {
    render(<Card title="Title" subtitle="Subtitle">Content</Card>);
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });

  it('applies correct padding classes', () => {
    const { container, rerender } = render(<Card padding="none">Content</Card>);
    expect(container.firstChild).not.toHaveClass('p-4', 'p-6', 'p-8');

    rerender(<Card padding="sm">Content</Card>);
    expect(container.firstChild).toHaveClass('p-4');

    rerender(<Card padding="md">Content</Card>);
    expect(container.firstChild).toHaveClass('p-6');

    rerender(<Card padding="lg">Content</Card>);
    expect(container.firstChild).toHaveClass('p-8');
  });

  it('applies correct shadow classes', () => {
    const { container, rerender } = render(<Card shadow="none">Content</Card>);
    expect(container.firstChild).not.toHaveClass('shadow-sm', 'shadow-md', 'shadow-lg');

    rerender(<Card shadow="sm">Content</Card>);
    expect(container.firstChild).toHaveClass('shadow-sm');

    rerender(<Card shadow="md">Content</Card>);
    expect(container.firstChild).toHaveClass('shadow-md');

    rerender(<Card shadow="lg">Content</Card>);
    expect(container.firstChild).toHaveClass('shadow-lg');
  });

  it('applies hover effect when hover prop is true', () => {
    const { container } = render(<Card hover>Content</Card>);
    expect(container.firstChild).toHaveClass('hover:shadow-md', 'transition-shadow', 'cursor-pointer');
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});