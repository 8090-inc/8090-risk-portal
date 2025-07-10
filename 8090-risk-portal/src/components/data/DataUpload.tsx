import React, { useState, useCallback } from 'react';
import { FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import * as XLSX from 'xlsx';
import type { Risk, Control } from '../../types';

interface DataUploadProps {
  onDataImport: (data: { risks: Risk[], controls: Control[] }) => void;
  onClose: () => void;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  data?: {
    risks: Risk[];
    controls: Control[];
  };
}

export const DataUpload: React.FC<DataUploadProps> = ({ onDataImport, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateExcelData = async (file: File): Promise<ValidationResult> => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      const errors: string[] = [];
      const warnings: string[] = [];

      // Check for required sheets
      const requiredSheets = ['Risk Map', 'Controls Mapping', 'Scoring Result Index'];
      const missingSheets = requiredSheets.filter(sheet => !workbook.SheetNames.includes(sheet));
      
      if (missingSheets.length > 0) {
        errors.push(`Missing required sheets: ${missingSheets.join(', ')}`);
        return { valid: false, errors, warnings };
      }

      // Parse Risk Map sheet
      const riskSheet = workbook.Sheets['Risk Map'];
      const riskData = XLSX.utils.sheet_to_json(riskSheet, { header: 1 }) as any[][];
      
      if (riskData.length < 2) {
        errors.push('Risk Map sheet is empty');
        return { valid: false, errors, warnings };
      }

      // Validate Risk Map columns
      const expectedRiskColumns = [
        'Risk Category', 'Risk', 'Risk Description', 'Likelihood', 'Impact',
        'Risk Level', 'Risk Level Category', 'Example Mitigations',
        'Agreed workable mitigation', 'Proposed Oversight Ownership',
        'Proposed Support', 'Notes', 'Likelihood (Residual)', 'Impact (Residual)',
        'Risk Level (Residual)', 'Risk Level Category (Residual)'
      ];

      const riskHeaders = riskData[0] as string[];
      const missingRiskColumns = expectedRiskColumns.filter((col, idx) => 
        idx < riskHeaders.length && riskHeaders[idx] !== col && col !== 'Example Mitigations'
      );

      if (missingRiskColumns.length > 0) {
        warnings.push(`Risk Map has different column names: ${missingRiskColumns.join(', ')}`);
      }

      // Parse Controls sheet
      const controlsSheet = workbook.Sheets['Controls Mapping'];
      const controlsData = XLSX.utils.sheet_to_json(controlsSheet, { header: 1 }) as any[][];
      
      if (controlsData.length < 2) {
        errors.push('Controls Mapping sheet is empty');
        return { valid: false, errors, warnings };
      }

      // Convert to our data format
      const risks: Risk[] = [];
      const controls: Control[] = [];

      // Process risks (skip header row)
      for (let i = 1; i < riskData.length; i++) {
        const row = riskData[i];
        if (!row || row.length === 0) continue;

        const initialRiskLevel = Number(row[5]) || 0;
        const residualRiskLevel = Number(row[14]) || 0;
        const riskReduction = initialRiskLevel - residualRiskLevel;
        const riskReductionPercentage = initialRiskLevel > 0 
          ? Math.round((riskReduction / initialRiskLevel) * 100)
          : 0;
        
        // Determine mitigation effectiveness based on reduction percentage
        let mitigationEffectiveness: 'Low' | 'Medium' | 'High' = 'Medium';
        if (riskReductionPercentage >= 60) {
          mitigationEffectiveness = 'High';
        } else if (riskReductionPercentage <= 30) {
          mitigationEffectiveness = 'Low';
        }

        const risk: Risk = {
          id: `AIR-${String(i).padStart(2, '0')}`,
          riskCategory: row[0] || '',
          risk: row[1] || '',
          riskDescription: row[2] || '',
          initialScoring: {
            likelihood: (Number(row[3]) || 0) as 1 | 2 | 3 | 4 | 5,
            impact: (Number(row[4]) || 0) as 1 | 2 | 3 | 4 | 5,
            riskLevel: initialRiskLevel,
            riskLevelCategory: row[6] || ''
          },
          exampleMitigations: '', // Column H is skipped in Excel
          agreedMitigation: row[8] || '',
          proposedOversightOwnership: row[9] || '',
          proposedSupport: row[10] || '',
          notes: row[11] || '',
          residualScoring: {
            likelihood: (Number(row[12]) || 0) as 1 | 2 | 3 | 4 | 5,
            impact: (Number(row[13]) || 0) as 1 | 2 | 3 | 4 | 5,
            riskLevel: residualRiskLevel,
            riskLevelCategory: row[15] || ''
          },
          riskReduction,
          riskReductionPercentage,
          mitigationEffectiveness,
          relatedControlIds: [],
          createdAt: new Date(),
          lastUpdated: new Date()
        };

        // Validate risk data
        if (!risk.risk) {
          errors.push(`Row ${i + 1}: Missing risk name`);
        }
        if (risk.initialScoring.likelihood < 1 || risk.initialScoring.likelihood > 5) {
          errors.push(`Row ${i + 1}: Invalid likelihood value (${risk.initialScoring.likelihood})`);
        }
        if (risk.initialScoring.impact < 1 || risk.initialScoring.impact > 5) {
          errors.push(`Row ${i + 1}: Invalid impact value (${risk.initialScoring.impact})`);
        }

        risks.push(risk);
      }

      // Process controls
      for (let i = 1; i < controlsData.length; i++) {
        const row = controlsData[i];
        if (!row || row.length === 0) continue;

        const control: Control = {
          mitigationID: row[0] || `CTRL-${String(i).padStart(2, '0')}`,
          mitigationDescription: row[1] || '',
          category: 'Technical Controls' as any, // Default category
          implementationStatus: 'Planned',
          effectiveness: 'Not Assessed',
          relatedRiskIds: [],
          compliance: {
            cfrPart11Annex11: row[2] || '',
            hipaaSafeguard: row[3] || '',
            gdprArticle: row[4] || '',
            euAiActArticle: row[5] || '',
            nist80053: row[6] || '',
            soc2TSC: row[7] || ''
          },
          complianceScore: 0.5,
          createdAt: new Date(),
          lastUpdated: new Date()
        };

        if (!control.mitigationDescription) {
          errors.push(`Control row ${i + 1}: Missing description`);
        }

        controls.push(control);
      }

      // Summary
      if (errors.length === 0) {
        warnings.push(`Found ${risks.length} risks and ${controls.length} controls`);
        return {
          valid: true,
          errors,
          warnings,
          data: { risks, controls }
        };
      }

      return { valid: false, errors, warnings };
    } catch (error) {
      return {
        valid: false,
        errors: [`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      };
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile);
      setIsProcessing(true);
      const result = await validateExcelData(droppedFile);
      setValidationResult(result);
      setIsProcessing(false);
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setIsProcessing(true);
      const result = await validateExcelData(selectedFile);
      setValidationResult(result);
      setIsProcessing(false);
    }
  }, []);

  const handleImport = () => {
    if (validationResult?.valid && validationResult.data) {
      onDataImport(validationResult.data);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Import Excel Data</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragging
                ? "border-8090-primary bg-8090-primary/5"
                : "border-gray-300 hover:border-gray-400"
            )}
          >
            <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop your Excel file here, or{' '}
              <label className="text-8090-primary hover:text-8090-primary/80 cursor-pointer">
                browse
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-xs text-gray-500">
              Accepted format: General AI Risk Map.xlsx
            </p>
          </div>

          {file && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="mt-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-8090-primary mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Validating data...</p>
            </div>
          )}

          {validationResult && !isProcessing && (
            <div className="mt-4 space-y-4">
              {/* Validation Summary */}
              <div className={cn(
                "p-4 rounded-lg",
                validationResult.valid
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              )}>
                <div className="flex items-start space-x-2">
                  {validationResult.valid ? (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className={cn(
                      "font-medium",
                      validationResult.valid ? "text-green-900" : "text-red-900"
                    )}>
                      {validationResult.valid ? 'Validation Passed' : 'Validation Failed'}
                    </h3>
                    {validationResult.valid && validationResult.data && (
                      <p className="text-sm text-green-700 mt-1">
                        Ready to import {validationResult.data.risks.length} risks 
                        and {validationResult.data.controls.length} controls
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Errors */}
              {validationResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-900">Errors:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {validationResult.errors.map((error, idx) => (
                      <li key={idx} className="text-sm text-red-700">{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {validationResult.warnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-yellow-900">Warnings:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {validationResult.warnings.map((warning, idx) => (
                      <li key={idx} className="text-sm text-yellow-700">{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleImport}
            disabled={!validationResult?.valid || isProcessing}
          >
            Import Data
          </Button>
        </div>
      </div>
    </div>
  );
};