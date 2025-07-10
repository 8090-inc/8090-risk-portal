import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Select } from './Select';

describe('Select', () => {
  const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];

  it('renders select element with options', () => {
    render(<Select options={mockOptions} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('renders placeholder option', () => {
    render(<Select options={mockOptions} placeholder="Choose an option" />);
    expect(screen.getByText('Choose an option')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Select options={mockOptions} label="Select Option" />);
    expect(screen.getByLabelText('Select Option')).toBeInTheDocument();
  });

  it('renders error message when error prop is provided', () => {
    render(<Select options={mockOptions} error="Please select an option" />);
    expect(screen.getByText('Please select an option')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders help text when helpText prop is provided', () => {
    render(<Select options={mockOptions} helpText="Select one option" />);
    expect(screen.getByText('Select one option')).toBeInTheDocument();
  });

  it('does not render help text when error is present', () => {
    render(<Select options={mockOptions} error="Error message" helpText="Help text" />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Help text')).not.toBeInTheDocument();
  });

  it('applies fullWidth class when fullWidth prop is true', () => {
    const { container } = render(<Select options={mockOptions} fullWidth />);
    expect(container.firstChild).toHaveClass('w-full');
    expect(screen.getByRole('combobox')).toHaveClass('w-full');
  });

  it('handles onChange events', () => {
    const handleChange = vi.fn();
    render(<Select options={mockOptions} onChange={handleChange} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option2' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('forwards other select props', () => {
    render(<Select options={mockOptions} name="testSelect" required />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('name', 'testSelect');
    expect(select).toHaveAttribute('required');
  });

  it('generates unique IDs for label association', () => {
    const { container } = render(
      <>
        <Select options={mockOptions} label="First Select" />
        <Select options={mockOptions} label="Second Select" />
      </>
    );
    
    const labels = container.querySelectorAll('label');
    const selects = container.querySelectorAll('select');
    
    expect(labels[0].getAttribute('for')).toBe(selects[0].getAttribute('id'));
    expect(labels[1].getAttribute('for')).toBe(selects[1].getAttribute('id'));
    expect(selects[0].getAttribute('id')).not.toBe(selects[1].getAttribute('id'));
  });

  it('uses provided id when specified', () => {
    render(<Select options={mockOptions} id="custom-select-id" label="Custom Select" />);
    expect(screen.getByLabelText('Custom Select')).toHaveAttribute('id', 'custom-select-id');
  });
});