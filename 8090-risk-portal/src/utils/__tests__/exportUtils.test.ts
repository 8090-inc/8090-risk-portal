import { describe, it, expect, beforeEach, vi } from 'vitest';
import { exportRisksToExcel, exportRisksToCSV, exportControlsToExcel, exportControlsToCSV } from '../exportUtils';
import * as XLSX from 'xlsx';

// Mock XLSX
vi.mock('xlsx', () => ({
  utils: {
    json_to_sheet: vi.fn(() => ({})),
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
    sheet_add_aoa: vi.fn()
  },
  writeFile: vi.fn()
}));

// Mock file download
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

const mockCreateElement = vi.fn((tagName: string) => {
  if (tagName === 'a') {
    return {
      href: '',
      download: '',
      setAttribute: vi.fn(),
      click: vi.fn(),
      remove: vi.fn(),
      style: {}
    };
  }
  return document.createElement(tagName);
});

document.createElement = mockCreateElement as any;

// Also mock appendChild and removeChild
document.body.appendChild = vi.fn();
document.body.removeChild = vi.fn();

const mockRisks = [
  {
    id: 'AIR-01',
    risk: 'Test Risk 1',
    riskCategory: 'AI Human Impact Risks' as const,
    riskDescription: 'Test description',
    initialScoring: {
      likelihood: 4 as const,
      impact: 5 as const,
      riskLevel: 20,
      riskLevelCategory: 'Critical' as const
    },
    residualScoring: {
      likelihood: 2 as const,
      impact: 3 as const,
      riskLevel: 6,
      riskLevelCategory: 'Medium' as const
    },
    proposedOversightOwnership: ['Test Owner'],
    proposedSupport: ['Test Support'],
    agreedMitigation: 'Test mitigation',
    notes: 'Test notes',
    relatedControlIds: ['CTRL-01'],
    riskReduction: 14,
    riskReductionPercentage: 70,
    mitigationEffectiveness: 'High' as const,
    exampleMitigations: ''
  }
];

const mockControls = [
  {
    mitigationID: 'CTRL-01',
    mitigationDescription: 'Test Control',
    category: 'Security & Data Privacy' as const,
    implementationStatus: 'Implemented' as const,
    effectiveness: 'High' as const,
    complianceScore: 0.85,
    relatedRiskIds: ['AIR-01'],
    compliance: {
      cfrPart11Annex11: '11.10',
      hipaaSafeguard: 'Technical',
      gdprArticle: 'Article 32',
      euAiActArticle: 'Article 15',
      nist80053: 'AC-2',
      soc2TSC: 'CC6.1'
    }
  }
];

describe('Export Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exportRisksToExcel', () => {
    it('should create Excel workbook with risks data', () => {
      exportRisksToExcel(mockRisks, 'test-risks.xlsx');

      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            'Risk ID': 'AIR-01',
            'Risk': 'Test Risk 1',
            'Category': 'AI Human Impact Risks'
          })
        ])
      );
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalled();
      expect(XLSX.writeFile).toHaveBeenCalledWith(expect.anything(), 'test-risks.xlsx');
    });

    it('should include all risk fields in export', () => {
      exportRisksToExcel(mockRisks, 'test-risks.xlsx');

      const jsonToSheetCall = (XLSX.utils.json_to_sheet as any).mock.calls[0][0];
      const exportedRisk = jsonToSheetCall[0];

      expect(exportedRisk).toHaveProperty('Risk ID', 'AIR-01');
      expect(exportedRisk).toHaveProperty('Risk', 'Test Risk 1');
      expect(exportedRisk).toHaveProperty('Category', 'AI/ML Model Risks');
      expect(exportedRisk).toHaveProperty('Description', 'Test description');
      expect(exportedRisk).toHaveProperty('Initial Likelihood', 4);
      expect(exportedRisk).toHaveProperty('Initial Impact', 5);
      expect(exportedRisk).toHaveProperty('Initial Risk Level', 20);
      expect(exportedRisk).toHaveProperty('Residual Likelihood', 2);
      expect(exportedRisk).toHaveProperty('Residual Impact', 3);
      expect(exportedRisk).toHaveProperty('Residual Risk Level', 6);
      expect(exportedRisk).toHaveProperty('Risk Reduction %', '70%');
      expect(exportedRisk).toHaveProperty('Control Count', 1);
    });

    it('should handle empty risks array', () => {
      exportRisksToExcel([], 'empty-risks.xlsx');

      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith([]);
      expect(XLSX.writeFile).toHaveBeenCalled();
    });
  });

  describe('exportRisksToCSV', () => {
    it('should create CSV with risks data', () => {
      exportRisksToCSV(mockRisks, 'test-risks.csv');

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it('should format CSV correctly', () => {
      let capturedBlob: any = null;
      const originalCreateObjectURL = global.URL.createObjectURL;
      global.URL.createObjectURL = vi.fn((blob: Blob) => {
        capturedBlob = blob;
        return 'blob:mock-url';
      });

      exportRisksToCSV(mockRisks, 'test-risks.csv');

      expect(capturedBlob).toBeTruthy();
      expect(capturedBlob.type).toBe('text/csv;charset=utf-8;');
      
      // Restore original
      global.URL.createObjectURL = originalCreateObjectURL;
    });
  });

  describe('exportControlsToExcel', () => {
    it('should create Excel workbook with controls data', () => {
      exportControlsToExcel(mockControls, 'test-controls.xlsx');

      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            'Control ID': 'CTRL-01',
            'Description': 'Test Control',
            'Category': 'Security & Data Privacy'
          })
        ])
      );
      expect(XLSX.writeFile).toHaveBeenCalledWith(expect.anything(), 'test-controls.xlsx');
    });

    it('should include compliance mappings', () => {
      exportControlsToExcel(mockControls, 'test-controls.xlsx');

      const jsonToSheetCall = (XLSX.utils.json_to_sheet as any).mock.calls[0][0];
      const exportedControl = jsonToSheetCall[0];

      expect(exportedControl).toHaveProperty('CFR Part 11/Annex 11', '11.10');
      expect(exportedControl).toHaveProperty('HIPAA Safeguard', 'Technical');
      expect(exportedControl).toHaveProperty('GDPR Article', 'Article 32');
      expect(exportedControl).toHaveProperty('EU AI Act Article', 'Article 15');
      expect(exportedControl).toHaveProperty('NIST 800-53', 'AC-2');
      expect(exportedControl).toHaveProperty('SOC 2 TSC', 'CC6.1');
    });
  });

  describe('exportControlsToCSV', () => {
    it('should create CSV with controls data', () => {
      exportControlsToCSV(mockControls, 'test-controls.csv');

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });
  });
});