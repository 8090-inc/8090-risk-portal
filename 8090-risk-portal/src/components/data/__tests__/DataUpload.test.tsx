import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataUpload } from '../DataUpload';

describe('DataUpload Component', () => {
  const mockOnDataImport = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
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

  it('calls onClose when close button is clicked', () => {
    render(
      <DataUpload 
        onDataImport={mockOnDataImport}
        onClose={mockOnClose}
      />
    );
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
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