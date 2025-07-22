import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsView } from '../SettingsView';
import { useRiskStore, useControlStore } from '../../store';

// Mock the stores
vi.mock('../../store', () => ({
  useRiskStore: vi.fn(),
  useControlStore: vi.fn()
}));

// Mock the export utilities
vi.mock('../../utils/exportUtils', () => ({
  exportRisksToExcel: vi.fn(),
  exportRisksToCSV: vi.fn()
}));

vi.mock('../../utils/pdfExport', () => ({
  exportRisksToPDF: vi.fn()
}));

// Mock components
vi.mock('../../components/data/DataUpload', () => ({
  DataUpload: ({ onDataImport, onClose }: { onDataImport: (data: { risks: unknown[]; controls: unknown[] }) => void; onClose: () => void }) => (
    <div data-testid="data-upload-modal">
      <button onClick={() => onDataImport({ risks: [], controls: [] })}>Import</button>
      <button onClick={onClose}>Close</button>
    </div>
  )
}));

const mockRisks = [
  { id: 'AIR-01', risk: 'Test Risk 1' },
  { id: 'AIR-02', risk: 'Test Risk 2' }
];

const mockControls = [
  { mitigationID: 'CTRL-01', mitigationDescription: 'Test Control 1' },
  { mitigationID: 'CTRL-02', mitigationDescription: 'Test Control 2' }
];

describe('SettingsView', () => {
  const mockLoadRisks = vi.fn();
  const mockLoadControls = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useRiskStore as jest.MockedFunction<typeof useRiskStore>).mockReturnValue({
      risks: mockRisks,
      loadRisks: mockLoadRisks
    });
    
    (useControlStore as jest.MockedFunction<typeof useControlStore>).mockReturnValue({
      controls: mockControls,
      loadControls: mockLoadControls
    });

    // Reset localStorage
    localStorage.clear();
  });

  it('renders settings page with all sections', () => {
    render(<SettingsView />);
    
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText(/Manage data imports/)).toBeInTheDocument();
    expect(screen.getByText('Data Import')).toBeInTheDocument();
    expect(screen.getByText('Data Export')).toBeInTheDocument();
    expect(screen.getByText('System Configuration')).toBeInTheDocument();
  });

  it('displays data status with record counts', () => {
    render(<SettingsView />);
    
    // Should render DataStatus component which shows risk and control counts
    expect(screen.getByText('Data Status')).toBeInTheDocument();
  });

  it('opens data upload modal when upload button clicked', () => {
    render(<SettingsView />);
    
    const uploadButton = screen.getByRole('button', { name: /upload excel file/i });
    fireEvent.click(uploadButton);
    
    expect(screen.getByTestId('data-upload-modal')).toBeInTheDocument();
  });

  it('closes data upload modal', () => {
    render(<SettingsView />);
    
    const uploadButton = screen.getByRole('button', { name: /upload excel file/i });
    fireEvent.click(uploadButton);
    
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    expect(screen.queryByTestId('data-upload-modal')).not.toBeInTheDocument();
  });

  it('handles data import', async () => {
    render(<SettingsView />);
    
    const uploadButton = screen.getByRole('button', { name: /upload excel file/i });
    fireEvent.click(uploadButton);
    
    const importButton = screen.getByText('Import');
    fireEvent.click(importButton);
    
    await waitFor(() => {
      expect(mockLoadRisks).toHaveBeenCalled();
      expect(mockLoadControls).toHaveBeenCalled();
    });
  });

  it('handles refresh data', async () => {
    render(<SettingsView />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh data/i });
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(mockLoadRisks).toHaveBeenCalled();
      expect(mockLoadControls).toHaveBeenCalled();
    });
  });

  it('handles export to Excel', async () => {
    const { exportRisksToExcel } = await import('../../utils/exportUtils');
    render(<SettingsView />);
    
    const exportButton = screen.getByRole('button', { name: /export to excel/i });
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(exportRisksToExcel).toHaveBeenCalledWith(
        mockRisks,
        expect.stringContaining('ai-risk-portal-export')
      );
    });
  });

  it('handles export to PDF', async () => {
    const { exportRisksToPDF } = await import('../../utils/pdfExport');
    render(<SettingsView />);
    
    const exportButton = screen.getByRole('button', { name: /export to pdf/i });
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(exportRisksToPDF).toHaveBeenCalledWith(mockRisks, mockControls);
    });
  });

  it('handles export to CSV', async () => {
    const { exportRisksToCSV } = await import('../../utils/exportUtils');
    render(<SettingsView />);
    
    const exportButton = screen.getByRole('button', { name: /export to csv/i });
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(exportRisksToCSV).toHaveBeenCalledWith(
        mockRisks,
        expect.stringContaining('risks-export')
      );
    });
  });

  it('displays system configuration info', () => {
    render(<SettingsView />);
    
    expect(screen.getByText(/Currently using local Excel data/)).toBeInTheDocument();
    expect(screen.getByText(/Data refreshes when the application loads/)).toBeInTheDocument();
    expect(screen.getByText(/8090 AI Risk Portal v1.0.0/)).toBeInTheDocument();
  });

  it('disables export buttons while exporting', async () => {
    render(<SettingsView />);
    
    const exportButton = screen.getByRole('button', { name: /export to excel/i });
    
    // Initially enabled
    expect(exportButton).not.toBeDisabled();
    
    // Click to start export
    fireEvent.click(exportButton);
    
    // Should be disabled during export
    expect(exportButton).toBeDisabled();
  });
});