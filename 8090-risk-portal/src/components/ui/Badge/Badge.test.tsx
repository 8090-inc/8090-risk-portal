import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children correctly', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText('Small')).toHaveClass('px-2', 'py-0.5', 'text-xs');

    rerender(<Badge size="md">Medium</Badge>);
    expect(screen.getByText('Medium')).toHaveClass('px-2.5', 'py-0.5', 'text-sm');

    rerender(<Badge size="lg">Large</Badge>);
    expect(screen.getByText('Large')).toHaveClass('px-3', 'py-1', 'text-base');
  });

  it('applies correct variant classes for risk levels', () => {
    const { rerender } = render(<Badge variant="risk-critical">Critical</Badge>);
    expect(screen.getByText('Critical')).toHaveClass('bg-red-100', 'text-red-800');

    rerender(<Badge variant="risk-high">High</Badge>);
    expect(screen.getByText('High')).toHaveClass('bg-orange-100', 'text-orange-800');

    rerender(<Badge variant="risk-medium">Medium</Badge>);
    expect(screen.getByText('Medium')).toHaveClass('bg-yellow-100', 'text-yellow-800');

    rerender(<Badge variant="risk-low">Low</Badge>);
    expect(screen.getByText('Low')).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('applies correct variant classes for status', () => {
    const { rerender } = render(<Badge variant="status-implemented">Implemented</Badge>);
    expect(screen.getByText('Implemented')).toHaveClass('bg-green-100', 'text-green-800');

    rerender(<Badge variant="status-in-progress">In Progress</Badge>);
    expect(screen.getByText('In Progress')).toHaveClass('bg-blue-100', 'text-blue-800');

    rerender(<Badge variant="status-not-implemented">Not Implemented</Badge>);
    expect(screen.getByText('Not Implemented')).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>);
    expect(screen.getByText('Custom')).toHaveClass('custom-class');
  });
});