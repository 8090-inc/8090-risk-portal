import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { useRiskStore } from '../store';
import { useFilterStore } from '../store/filterStore';
import { RiskSummaryStats } from '../components/risks/RiskSummaryStats';
import { RiskTable } from '../components/risks/RiskTable';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { FilterSidebarLayout } from '../components/layout/FilterSidebarLayout';
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

  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const { activeFilters } = useFilterStore();
  const riskFilters = activeFilters.risks;

  useEffect(() => {
    loadRisks();
  }, [loadRisks]);

  const filteredRisks = useMemo(() => {
    let filtered = [...risks];

    // Apply category filter
    if (riskFilters?.categories && riskFilters.categories.length > 0) {
      filtered = filtered.filter(risk => 
        riskFilters.categories!.includes(risk.riskCategory)
      );
    }

    // Apply level filter
    if (riskFilters?.levels && riskFilters.levels.length > 0) {
      filtered = filtered.filter(risk => 
        riskFilters.levels!.includes(risk.residualScoring.riskLevelCategory)
      );
    }

    // Apply has controls filter
    if (riskFilters?.hasControls !== undefined) {
      filtered = filtered.filter(risk => 
        riskFilters.hasControls ? risk.relatedControlIds.length > 0 : risk.relatedControlIds.length === 0
      );
    }

    // Apply search term
    if (riskFilters?.searchTerm) {
      const searchLower = riskFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(risk =>
        risk.risk.toLowerCase().includes(searchLower) ||
        risk.riskDescription.toLowerCase().includes(searchLower) ||
        risk.id.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [risks, riskFilters]);

  const handleRowClick = (risk: Risk) => {
    navigate(`/risks/${risk.id}`);
  };

  const handleExportExcel = () => {
    exportRisksToExcel(filteredRisks, `risk-register-${new Date().toISOString().split('T')[0]}.xlsx`);
    setExportMenuOpen(false);
  };

  const handleExportCSV = () => {
    exportRisksToCSV(filteredRisks, `risk-register-${new Date().toISOString().split('T')[0]}.csv`);
    setExportMenuOpen(false);
  };

  const stats = getStatistics();

  return (
    <FilterSidebarLayout filterType="risks">
      <div className="space-y-6">
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

        <div className="bg-white shadow rounded-lg p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-8090-primary" />
            </div>
          ) : (
            <RiskTable
              risks={filteredRisks}
              searchTerm={riskFilters?.searchTerm || ""}
              selectedCategories={riskFilters?.categories || []}
              selectedLevels={riskFilters?.levels || []}
              onRowClick={handleRowClick}
            />
          )}
        </div>
      </div>
    </FilterSidebarLayout>
  );
};