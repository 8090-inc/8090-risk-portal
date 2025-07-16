import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataUpload } from '../DataUpload';

describe('DataUpload Component', () => {
  const mockOnDataImport = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <DataUpload 
        onDataImport={mockOnDataImport}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Import Excel Data')).toBeInTheDocument();
    expect(screen.getByText(/Drag and drop your Excel file here/)).toBeInTheDocument();
  });

  it('calls onClose when X button is clicked', () => {
    render(
      <DataUpload 
        onDataImport={mockOnDataImport}
        onClose={mockOnClose}
      />
    );
    
    // The X button is the first button in the document (in the header)
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons[0]; // X button
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(
      <DataUpload 
        onDataImport={mockOnDataImport}
        onClose={mockOnClose}
      />
    );
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows file info when file is selected', () => {
    render(
      <DataUpload 
        onDataImport={mockOnDataImport}
        onClose={mockOnClose}
      />
    );
    
    const file = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const input = screen.getByLabelText('browse');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    // File name should be displayed
    expect(screen.getByText('test.xlsx')).toBeInTheDocument();
  });
});