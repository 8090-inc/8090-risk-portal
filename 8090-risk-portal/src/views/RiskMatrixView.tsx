import React, { useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/layout/PageHeader';
import riskMapData from '../data/extracted-excel-data.json';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Risk level color mapping
const getRiskLevelColor = (level: string) => {
  switch (level) {
    case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
    case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

// Risk Level Badge Renderer
const RiskLevelRenderer = (params: { value: string }) => {
  const level = params.value;
  const colorClass = getRiskLevelColor(level);
  
  return (
    <div className="flex items-center h-full">
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
        {level}
      </span>
    </div>
  );
};

// Risk Score Renderer with color coding
const RiskScoreRenderer = (params: { value: number | null | undefined }) => {
  const score = params.value;
  
  // Handle null/undefined values
  if (score === null || score === undefined || score === '') {
    return (
      <div className="flex items-center h-full text-slate-400">
        -
      </div>
    );
  }
  
  let colorClass = 'text-slate-700';
  
  if (score >= 16) colorClass = 'text-red-700 font-semibold';
  else if (score >= 12) colorClass = 'text-orange-700 font-semibold';
  else if (score >= 6) colorClass = 'text-yellow-700 font-semibold';
  else if (score > 0) colorClass = 'text-green-700 font-semibold';
  
  return (
    <div className={`flex items-center h-full ${colorClass}`}>
      {score}
    </div>
  );
};

// Truncated text renderer with tooltip
const TextRenderer = (params: { value: string | string[] | null }) => {
  let text = params.value || '';
  
  // Handle arrays (like proposedOversightOwnership)
  if (Array.isArray(text)) {
    text = text.join(', ');
  }
  
  // Convert to string if it's not already
  text = String(text);
  
  const truncated = text.length > 100 ? text.substring(0, 100) + '...' : text;
  
  return (
    <div className="py-2" title={text}>
      {truncated}
    </div>
  );
};

export const RiskMatrixView: React.FC = () => {
  const gridRef = useRef<AgGridReact>(null);
  
  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Category',
      field: 'riskCategory',
      width: 150,
      pinned: 'left',
      cellRenderer: TextRenderer
    },
    {
      headerName: 'Risk',
      field: 'risk',
      width: 200,
      pinned: 'left',
      cellRenderer: TextRenderer
    },
    {
      headerName: 'Description',
      field: 'riskDescription',
      width: 350,
      cellRenderer: TextRenderer
    },
    {
      headerName: 'Initial Likelihood',
      field: 'initialLikelihood',
      width: 130,
      type: 'numericColumn',
      cellRenderer: RiskScoreRenderer
    },
    {
      headerName: 'Initial Impact',
      field: 'initialImpact',
      width: 120,
      type: 'numericColumn',
      cellRenderer: RiskScoreRenderer
    },
    {
      headerName: 'Initial Risk Level',
      field: 'initialRiskLevel',
      width: 140,
      type: 'numericColumn',
      cellRenderer: RiskScoreRenderer
    },
    {
      headerName: 'Risk Level Category',
      field: 'riskLevelCategory',
      width: 150,
      cellRenderer: RiskLevelRenderer
    },
    {
      headerName: 'Residual Likelihood',
      field: 'residualLikelihood',
      width: 150,
      type: 'numericColumn',
      cellRenderer: RiskScoreRenderer
    },
    {
      headerName: 'Residual Impact',
      field: 'residualImpact',
      width: 130,
      type: 'numericColumn',
      cellRenderer: RiskScoreRenderer
    },
    {
      headerName: 'Residual Risk Level',
      field: 'residualRiskLevel',
      width: 150,
      type: 'numericColumn',
      cellRenderer: RiskScoreRenderer
    },
    {
      headerName: 'Agreed Mitigation',
      field: 'agreedMitigation',
      width: 300,
      cellRenderer: TextRenderer
    },
    {
      headerName: 'Proposed Ownership',
      field: 'proposedOversightOwnership',
      width: 200,
      cellRenderer: TextRenderer
    },
    {
      headerName: 'Notes',
      field: 'notes',
      width: 200,
      cellRenderer: TextRenderer
    }
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true
  }), []);

  const gridOptions = useMemo(() => ({
    enableRangeSelection: true,
    enableCellTextSelection: true,
    ensureDomOrder: true,
    suppressRowClickSelection: true,
    rowSelection: 'multiple' as const,
    animateRows: true,
    suppressColumnVirtualisation: true,
    suppressRowVirtualisation: false,
    rowHeight: 80,
    headerHeight: 50,
    groupHeaderHeight: 35
  }), []);

  const handleExport = () => {
    if (gridRef.current) {
      const gridApi = gridRef.current.api;
      gridApi.exportDataAsCsv({
        fileName: 'risk-matrix-export.csv',
        columnSeparator: ',',
        suppressQuotes: false
      });
    }
  };

  const handleAutoSize = () => {
    if (gridRef.current) {
      const gridApi = gridRef.current.api;
      const allColumnIds = gridApi.getColumnState().map(col => col.colId);
      gridApi.autoSizeColumns(allColumnIds);
    }
  };

  return (
    <div className="h-full">
      {/* Main Content - Full Width */}
      <div className="space-y-6 p-6 overflow-y-auto">
        <PageHeader
          title="Risk Matrix"
          description="Comprehensive view of all AI risks with initial and residual assessments"
          actions={
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAutoSize}
              >
                Auto-size Columns
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExport}
                icon={<Download className="h-4 w-4" />}
              >
                Export CSV
              </Button>
            </div>
          }
        />
        
        {/* Summary Stats */}
        <div className="bg-white shadow-sm rounded-lg p-4">
          <div className="flex items-center space-x-6">
            <div className="text-sm text-slate-600">
              <span className="font-medium">Total Risks:</span> {riskMapData.riskMap.length}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="default" className="bg-red-100 text-red-800">
                Critical: {riskMapData.riskMap.filter(r => r.riskLevelCategory === 'Critical').length}
              </Badge>
              <Badge variant="default" className="bg-orange-100 text-orange-800">
                High: {riskMapData.riskMap.filter(r => r.riskLevelCategory === 'High').length}
              </Badge>
              <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                Medium: {riskMapData.riskMap.filter(r => r.riskLevelCategory === 'Medium').length}
              </Badge>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Low: {riskMapData.riskMap.filter(r => r.riskLevelCategory === 'Low').length}
              </Badge>
            </div>
          </div>
        </div>


        {/* AG-Grid Container */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200" style={{ height: '600px' }}>
          <div className="ag-theme-alpine w-full h-full" style={{ 
            '--ag-header-background-color': '#f8fafc',
            '--ag-header-foreground-color': '#334155',
            '--ag-border-color': '#e2e8f0',
            '--ag-row-hover-color': '#f8fafc',
            '--ag-selected-row-background-color': '#e0f2fe',
            '--ag-odd-row-background-color': '#ffffff',
            '--ag-even-row-background-color': '#fafafa',
            '--ag-primary-color': '#0055D4',
            '--ag-accent-color': '#0055D4'
          } as React.CSSProperties}>
            <AgGridReact
              ref={gridRef}
              rowData={riskMapData.riskMap}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              {...gridOptions}
              suppressMenuHide={true}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};