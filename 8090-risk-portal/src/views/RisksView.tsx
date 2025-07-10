import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { useRiskStore } from '../store';
import { RiskSummaryStats } from '../components/risks/RiskSummaryStats';
import { RiskFilters } from '../components/risks/RiskFilters';
import { RiskTable } from '../components/risks/RiskTable';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { exportRisksToExcel, exportRisksToCSV } from '../utils/exportUtils';
import type { Risk } from '../types';

export const RisksView: React.FC = () => {
  const navigate = useNavigate();
  const { 
    risks, 
    isLoading, 
    error, 
    loadRisks, 
    getStatistics 
  } = useRiskStore();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  useEffect(() => {
    loadRisks();
  }, [loadRisks]);

  const handleRowClick = (risk: Risk) => {
    navigate(`/risks/${risk.id}`);
  };

  const handleExportExcel = () => {
    exportRisksToExcel(risks, `risk-register-${new Date().toISOString().split('T')[0]}.xlsx`);
    setExportMenuOpen(false);
  };

  const handleExportCSV = () => {
    exportRisksToCSV(risks, `risk-register-${new Date().toISOString().split('T')[0]}.csv`);
    setExportMenuOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedLevels([]);
  };

  const stats = getStatistics();

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <PageHeader
        title="Risk Register"
        description="Comprehensive view of all identified AI risks and their mitigation status"
        actions={
          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => loadRisks()}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <div className="relative">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
              {exportMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    <button
                      onClick={handleExportExcel}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export to Excel
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export to CSV
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error.message}</p>
        </div>
      )}

      <RiskSummaryStats statistics={stats} />

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <RiskFilters
          selectedCategories={selectedCategories}
          selectedLevels={selectedLevels}
          onCategoryChange={setSelectedCategories}
          onLevelChange={setSelectedLevels}
          onClearAll={handleClearFilters}
        />

        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-8090-primary" />
            </div>
          ) : (
            <RiskTable
              risks={risks}
              searchTerm=""
              selectedCategories={selectedCategories}
              selectedLevels={selectedLevels}
              onRowClick={handleRowClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};