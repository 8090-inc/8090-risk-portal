import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders spinner svg', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { container, rerender } = render(<Spinner size="sm" />);
    expect(container.querySelector('svg')).toHaveClass('h-4', 'w-4');

    rerender(<Spinner size="md" />);
    expect(container.querySelector('svg')).toHaveClass('h-8', 'w-8');

    rerender(<Spinner size="lg" />);
    expect(container.querySelector('svg')).toHaveClass('h-12', 'w-12');
  });

  it('applies correct color classes', () => {
    const { container, rerender } = render(<Spinner color="primary" />);
    expect(container.querySelector('svg')).toHaveClass('text-8090-primary');

    rerender(<Spinner color="secondary" />);
    expect(container.querySelector('svg')).toHaveClass('text-8090-secondary');

    rerender(<Spinner color="white" />);
    expect(container.querySelector('svg')).toHaveClass('text-white');

    rerender(<Spinner color="gray" />);
    expect(container.querySelector('svg')).toHaveClass('text-gray-500');
  });

  it('applies animation class', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')).toHaveClass('animate-spin');
  });

  it('applies custom className', () => {
    const { container } = render(<Spinner className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders with default props', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-8', 'w-8'); // default size is md
    expect(svg).toHaveClass('text-8090-primary'); // default color is primary
  });
});