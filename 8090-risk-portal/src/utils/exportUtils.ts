import * as XLSX from 'xlsx';
import { Risk, Control } from '../types';
import { UseCase } from '../types/useCase.types';

export const exportRisksToExcel = (risks: Risk[], filename: string = 'risk-register.xlsx') => {
  // Prepare data for export
  const exportData = risks.map(risk => ({
    'Risk ID': risk.id,
    'Category': risk.riskCategory,
    'Risk': risk.risk,
    'Description': risk.riskDescription,
    'Initial Likelihood': risk.initialScoring.likelihood,
    'Initial Impact': risk.initialScoring.impact,
    'Initial Risk Level': risk.initialScoring.riskLevel,
    'Initial Risk Category': risk.initialScoring.riskLevelCategory,
    'Agreed Mitigation': risk.agreedMitigation,
    'Oversight Owner': risk.proposedOversightOwnership.join(', '),
    'Support': risk.proposedSupport.join(', '),
    'Notes': risk.notes,
    'Residual Likelihood': risk.residualScoring.likelihood,
    'Residual Impact': risk.residualScoring.impact,
    'Residual Risk Level': risk.residualScoring.riskLevel,
    'Residual Risk Category': risk.residualScoring.riskLevelCategory,
    'Risk Reduction': risk.riskReduction,
    'Risk Reduction %': `${risk.riskReductionPercentage}%`,
    'Mitigation Effectiveness': risk.mitigationEffectiveness,
    'Control Count': risk.relatedControlIds.length,
    'Control IDs': risk.relatedControlIds.join(', ')
  }));

  // Create workbook
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Risk Register');

  // Auto-size columns
  const maxWidth = 50;
  const wscols = Object.keys(exportData[0] || {}).map(key => ({
    wch: Math.min(maxWidth, Math.max(key.length, ...exportData.map(row => String(row[key as keyof typeof row] || '').length)))
  }));
  ws['!cols'] = wscols;

  // Save file
  XLSX.writeFile(wb, filename);
};

export const exportRisksToCSV = (risks: Risk[], filename: string = 'risk-register.csv') => {
  // Prepare data
  const headers = [
    'Risk ID', 'Category', 'Risk', 'Description',
    'Initial Likelihood', 'Initial Impact', 'Initial Risk Level', 'Initial Risk Category',
    'Agreed Mitigation', 'Oversight Owner', 'Support', 'Notes',
    'Residual Likelihood', 'Residual Impact', 'Residual Risk Level', 'Residual Risk Category',
    'Risk Reduction', 'Risk Reduction %', 'Mitigation Effectiveness',
    'Control Count', 'Control IDs'
  ];

  const rows = risks.map(risk => [
    risk.id,
    risk.riskCategory,
    risk.risk,
    risk.riskDescription,
    risk.initialScoring.likelihood,
    risk.initialScoring.impact,
    risk.initialScoring.riskLevel,
    risk.initialScoring.riskLevelCategory,
    risk.agreedMitigation,
    risk.proposedOversightOwnership.join(', '),
    risk.proposedSupport.join(', '),
    risk.notes,
    risk.residualScoring.likelihood,
    risk.residualScoring.impact,
    risk.residualScoring.riskLevel,
    risk.residualScoring.riskLevelCategory,
    risk.riskReduction,
    `${risk.riskReductionPercentage}%`,
    risk.mitigationEffectiveness,
    risk.relatedControlIds.length,
    risk.relatedControlIds.join(', ')
  ]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma or newline
      const cellStr = String(cell || '');
      if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportControlsToExcel = (controls: Control[], filename: string = 'controls-register.xlsx') => {
  // Prepare data for export
  const exportData = controls.map(control => ({
    'Control ID': control.mitigationID,
    'Description': control.mitigationDescription,
    'Category': control.category,
    'Implementation Status': control.implementationStatus || 'Not Started',
    'Effectiveness': control.effectiveness || 'Not Assessed',
    'CFR Part 11/Annex 11': control.compliance.cfrPart11Annex11,
    'HIPAA Safeguard': control.compliance.hipaaSafeguard,
    'GDPR Article': control.compliance.gdprArticle,
    'EU AI Act Article': control.compliance.euAiActArticle,
    'NIST 800-53': control.compliance.nist80053,
    'SOC 2 TSC': control.compliance.soc2TSC,
    'Related Risk Count': control.relatedRiskIds.length,
    'Related Risk IDs': control.relatedRiskIds.join(', '),
    'Compliance Score': control.complianceScore ? `${Math.round(control.complianceScore * 100)}%` : 'N/A'
  }));

  // Create workbook
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Controls Register');

  // Auto-size columns
  const maxWidth = 50;
  const wscols = Object.keys(exportData[0] || {}).map(key => ({
    wch: Math.min(maxWidth, Math.max(key.length, ...exportData.map(row => String(row[key as keyof typeof row] || '').length)))
  }));
  ws['!cols'] = wscols;

  // Save file
  XLSX.writeFile(wb, filename);
};

export const exportControlsToCSV = (controls: Control[], filename: string = 'controls-register.csv') => {
  // Prepare data
  const headers = [
    'Control ID', 'Description', 'Category', 'Implementation Status', 'Effectiveness',
    'CFR Part 11/Annex 11', 'HIPAA Safeguard', 'GDPR Article', 'EU AI Act Article',
    'NIST 800-53', 'SOC 2 TSC', 'Related Risk Count', 'Related Risk IDs', 'Compliance Score'
  ];

  const rows = controls.map(control => [
    control.mitigationID,
    control.mitigationDescription,
    control.category,
    control.implementationStatus || 'Not Started',
    control.effectiveness || 'Not Assessed',
    control.compliance.cfrPart11Annex11,
    control.compliance.hipaaSafeguard,
    control.compliance.gdprArticle,
    control.compliance.euAiActArticle,
    control.compliance.nist80053,
    control.compliance.soc2TSC,
    control.relatedRiskIds.length,
    control.relatedRiskIds.join(', '),
    control.complianceScore ? `${Math.round(control.complianceScore * 100)}%` : 'N/A'
  ]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma or newline
      const cellStr = String(cell || '');
      if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportUseCasesToExcel = (useCases: UseCase[], filename: string = 'use-cases.xlsx') => {
  // Prepare data for export
  const exportData = useCases.map(useCase => ({
    'Use Case ID': useCase.id,
    'Title': useCase.title,
    'Description': useCase.description || '',
    'Business Area': useCase.businessArea || '',
    'AI Categories': useCase.aiCategories?.join(', ') || '',
    'Status': useCase.status || '',
    'Owner': useCase.owner || '',
    'Stakeholders': useCase.stakeholders?.join(', ') || '',
    // Objective fields
    'Current State': useCase.objective?.currentState || '',
    'Future State': useCase.objective?.futureState || '',
    'Solution': useCase.objective?.solution || '',
    'Benefits': useCase.objective?.benefits || '',
    // Impact fields
    'Impact Points': useCase.impact?.impactPoints?.join('; ') || '',
    'Cost Saving': useCase.impact?.costSaving || '',
    'Effort (Months)': useCase.impact?.effortMonths || '',
    // Execution fields
    'Functions Impacted': useCase.execution?.functionsImpacted?.join(', ') || '',
    'Data Requirements': useCase.execution?.dataRequirements || '',
    'AI Complexity': useCase.execution?.aiComplexity || '',
    'Feasibility': useCase.execution?.feasibility || '',
    'Value': useCase.execution?.value || '',
    'Risk Level': useCase.execution?.risk || '',
    // Dates
    'Implementation Start': useCase.implementationStart || '',
    'Implementation End': useCase.implementationEnd || '',
    // Related entities
    'Risk Count': useCase.riskCount || 0,
    'Related Risk IDs': useCase.relatedRiskIds?.join(', ') || '',
    // Audit fields
    'Created Date': useCase.createdDate || '',
    'Created By': useCase.createdBy || '',
    'Last Updated': useCase.lastUpdated || '',
    'Last Updated By': useCase.lastUpdatedBy || '',
    // Notes
    'Notes': useCase.notes || ''
  }));

  // Create workbook
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Use Cases');

  // Auto-size columns
  const maxWidth = 50;
  const wscols = Object.keys(exportData[0] || {}).map(key => ({
    wch: Math.min(maxWidth, Math.max(key.length, ...exportData.map(row => String(row[key as keyof typeof row] || '').length)))
  }));
  ws['!cols'] = wscols;

  // Save file
  XLSX.writeFile(wb, filename);
};

export const exportUseCasesToCSV = (useCases: UseCase[], filename: string = 'use-cases.csv') => {
  // Prepare data
  const headers = [
    'Use Case ID', 'Title', 'Description', 'Business Area', 'AI Categories',
    'Status', 'Owner', 'Stakeholders',
    'Current State', 'Future State', 'Solution', 'Benefits',
    'Impact Points', 'Cost Saving', 'Effort (Months)',
    'Functions Impacted', 'Data Requirements', 'AI Complexity', 'Feasibility', 'Value', 'Risk Level',
    'Implementation Start', 'Implementation End',
    'Risk Count', 'Related Risk IDs',
    'Created Date', 'Created By', 'Last Updated', 'Last Updated By',
    'Notes'
  ];

  const rows = useCases.map(useCase => [
    useCase.id,
    useCase.title,
    useCase.description || '',
    useCase.businessArea || '',
    useCase.aiCategories?.join(', ') || '',
    useCase.status || '',
    useCase.owner || '',
    useCase.stakeholders?.join(', ') || '',
    useCase.objective?.currentState || '',
    useCase.objective?.futureState || '',
    useCase.objective?.solution || '',
    useCase.objective?.benefits || '',
    useCase.impact?.impactPoints?.join('; ') || '',
    useCase.impact?.costSaving || '',
    useCase.impact?.effortMonths || '',
    useCase.execution?.functionsImpacted?.join(', ') || '',
    useCase.execution?.dataRequirements || '',
    useCase.execution?.aiComplexity || '',
    useCase.execution?.feasibility || '',
    useCase.execution?.value || '',
    useCase.execution?.risk || '',
    useCase.implementationStart || '',
    useCase.implementationEnd || '',
    useCase.riskCount || 0,
    useCase.relatedRiskIds?.join(', ') || '',
    useCase.createdDate || '',
    useCase.createdBy || '',
    useCase.lastUpdated || '',
    useCase.lastUpdatedBy || '',
    useCase.notes || ''
  ]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma or newline
      const cellStr = String(cell || '');
      if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};