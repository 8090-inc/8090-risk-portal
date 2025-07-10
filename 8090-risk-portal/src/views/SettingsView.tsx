import React, { useState } from 'react';
import { Upload, Download, RefreshCw, FileText, Settings as SettingsIcon } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { DataStatus } from '../components/data/DataStatus';
import { DataUpload } from '../components/data/DataUpload';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useRiskStore, useControlStore } from '../store';
import { exportRisksToExcel, exportRisksToCSV } from '../utils/exportUtils';
import { exportRisksToPDF } from '../utils/pdfExport';

export const SettingsView: React.FC = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const { risks, loadRisks } = useRiskStore();
  const { controls, loadControls } = useControlStore();

  const dataStatus = {
    lastUpdated: localStorage.getItem('dataLastUpdated') || undefined,
    recordCount: {
      risks: risks.length,
      controls: controls.length
    }
  };

  const handleDataImport = async (data: { risks: any[], controls: any[] }) => {
    try {
      console.log('Importing data:', { risksCount: data.risks.length, controlsCount: data.controls.length });
      
      // Save to localStorage or API
      localStorage.setItem('importedRisks', JSON.stringify(data.risks));
      localStorage.setItem('importedControls', JSON.stringify(data.controls));
      localStorage.setItem('dataLastUpdated', new Date().toISOString());
      
      // Reload stores
      await loadRisks();
      await loadControls();
      
      setShowUpload(false);
      console.log('Data import successful');
    } catch (error) {
      console.error('Failed to import data:', error);
      alert('Failed to import data. Please check the console for details.');
    }
  };

  const handleRefresh = async () => {
    await Promise.all([loadRisks(), loadControls()]);
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await exportRisksToExcel(risks, `ai-risk-portal-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportRisksToPDF(risks, controls);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await exportRisksToCSV(risks, `risks-export-${new Date().toISOString().split('T')[0]}.csv`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage data imports, exports, and system configuration"
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Data</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Data Status */}
        <div className="lg:col-span-1">
          <DataStatus
            {...dataStatus}
            validationStatus="valid"
            onRefresh={handleRefresh}
          />
        </div>

        {/* Data Management */}
        <div className="lg:col-span-2 space-y-6">
          {/* Import Section */}
          <Card>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Upload className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Data Import</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Upload a new Excel file to update risks and controls data. The system will validate 
                the data before importing.
              </p>
              
              <Button
                variant="primary"
                onClick={() => setShowUpload(true)}
                icon={<Upload className="h-4 w-4" />}
              >
                Upload Excel File
              </Button>
            </div>
          </Card>

          {/* Export Section */}
          <Card>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Download className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Data Export</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Export current data in various formats for reporting and backup purposes.
              </p>
              
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    variant="secondary"
                    onClick={handleExportExcel}
                    disabled={isExporting}
                    icon={<FileText className="h-4 w-4" />}
                    className="justify-start"
                  >
                    Export to Excel
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    icon={<FileText className="h-4 w-4" />}
                    className="justify-start"
                  >
                    Export to PDF
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={handleExportCSV}
                    disabled={isExporting}
                    icon={<FileText className="h-4 w-4" />}
                    className="justify-start"
                  >
                    Export to CSV
                  </Button>
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  Exports include all current filters and sorting applied to the data.
                </div>
              </div>
            </div>
          </Card>

          {/* System Settings */}
          <Card>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <SettingsIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">System Configuration</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Data Source</label>
                  <p className="text-sm text-gray-600 mt-1">
                    Currently using local Excel data. API integration coming soon.
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto-refresh</label>
                  <p className="text-sm text-gray-600 mt-1">
                    Data refreshes when the application loads.
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Version</label>
                  <p className="text-sm text-gray-600 mt-1">
                    8090 AI Risk Portal v1.0.0
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <DataUpload
          onDataImport={handleDataImport}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
};