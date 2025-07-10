import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('renders input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Input label="Email Address" />);
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
  });

  it('renders error message when error prop is provided', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders help text when helpText prop is provided', () => {
    render(<Input helpText="Enter your email" />);
    expect(screen.getByText('Enter your email')).toBeInTheDocument();
  });

  it('does not render help text when error is present', () => {
    render(<Input error="Error message" helpText="Help text" />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Help text')).not.toBeInTheDocument();
  });

  it('applies fullWidth class when fullWidth prop is true', () => {
    const { container } = render(<Input fullWidth />);
    expect(container.firstChild).toHaveClass('w-full');
    expect(screen.getByRole('textbox')).toHaveClass('w-full');
  });

  it('handles onChange events', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('forwards other input props', () => {
    render(<Input placeholder="Enter text" type="email" required />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Enter text');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('required');
  });

  it('generates unique IDs for label association', () => {
    const { container } = render(
      <>
        <Input label="First Input" />
        <Input label="Second Input" />
      </>
    );
    
    const labels = container.querySelectorAll('label');
    const inputs = container.querySelectorAll('input');
    
    expect(labels[0].getAttribute('for')).toBe(inputs[0].getAttribute('id'));
    expect(labels[1].getAttribute('for')).toBe(inputs[1].getAttribute('id'));
    expect(inputs[0].getAttribute('id')).not.toBe(inputs[1].getAttribute('id'));
  });

  it('uses provided id when specified', () => {
    render(<Input id="custom-id" label="Custom Input" />);
    expect(screen.getByLabelText('Custom Input')).toHaveAttribute('id', 'custom-id');
  });
});