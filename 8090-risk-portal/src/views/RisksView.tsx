import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { useRiskStore } from '../store';
import { RiskSummaryStats } from '../components/risks/RiskSummaryStats';
import { RiskTable } from '../components/risks/RiskTable';
import { PageHeader } from '../components/layout/PageHeader';
import { CollapsibleFilterPanel } from '../components/common/CollapsibleFilterPanel';
import { Button } from '../components/ui/Button';
import { exportRisksToExcel, exportRisksToCSV } from '../utils/exportUtils';
import { useFilters } from '../hooks/useFilters';
import { RISK_OWNERS } from '../constants/riskOwners';
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

  const {
    activeFilters,
    savedFilterSets,
    updateFilter,
    clearAllFilters,
    saveFilterSet,
    loadFilterSet,
    hasActiveFilters
  } = useFilters({ 
    storageKey: 'risks',
    defaultFilters: {}
  });

  useEffect(() => {
    loadRisks();
  }, [loadRisks]);

  // Build filter groups with counts
  const filterGroups = useMemo(() => {
    const categoryOptions = Array.from(
      new Set(risks.map(r => r.riskCategory))
    ).map(category => ({
      value: category,
      label: category,
      count: risks.filter(r => r.riskCategory === category).length
    }));

    const levelOptions = [
      { value: 'Critical', label: 'Critical', count: 0 },
      { value: 'High', label: 'High', count: 0 },
      { value: 'Medium', label: 'Medium', count: 0 },
      { value: 'Low', label: 'Low', count: 0 }
    ];

    // Use standardized owner list and count occurrences
    const ownerOptions = RISK_OWNERS.map(owner => ({
      value: owner,
      label: owner,
      count: risks.filter(r => r.proposedOversightOwnership.includes(owner)).length
    })).filter(option => option.count > 0) // Only show owners that have risks
      .sort((a, b) => b.count - a.count); // Sort by count descending

    const controlOptions = [
      { value: 'with-controls', label: 'With Controls', count: 0 },
      { value: 'without-controls', label: 'Without Controls', count: 0 }
    ];

    // Count risk levels and control status
    risks.forEach(risk => {
      const level = risk.residualScoring.riskLevelCategory;
      const levelOption = levelOptions.find(o => o.value === level);
      if (levelOption) levelOption.count++;

      if (risk.relatedControlIds.length > 0) {
        controlOptions[0].count++;
      } else {
        controlOptions[1].count++;
      }
    });

    return [
      {
        id: 'category',
        label: 'Risk Category',
        options: categoryOptions.sort((a, b) => a.label.localeCompare(b.label)),
        multiple: true
      },
      {
        id: 'level',
        label: 'Risk Level',
        options: levelOptions.filter(o => o.count > 0),
        multiple: true
      },
      {
        id: 'owner',
        label: 'Risk Owner',
        options: ownerOptions.sort((a, b) => a.label.localeCompare(b.label)),
        multiple: true
      },
      {
        id: 'controls',
        label: 'Control Status',
        options: controlOptions,
        multiple: false
      }
    ];
  }, [risks]);

  // Apply filters
  const filteredRisks = useMemo(() => {
    let filtered = [...risks];

    // Apply category filter
    if (activeFilters.category?.length > 0) {
      filtered = filtered.filter(risk => 
        activeFilters.category!.includes(risk.riskCategory)
      );
    }

    // Apply level filter
    if (activeFilters.level?.length > 0) {
      filtered = filtered.filter(risk => 
        activeFilters.level!.includes(risk.residualScoring.riskLevelCategory)
      );
    }

    // Apply owner filter
    if (activeFilters.owner?.length > 0) {
      filtered = filtered.filter(risk => 
        activeFilters.owner!.some(filterOwner => 
          risk.proposedOversightOwnership.includes(filterOwner)
        )
      );
    }

    // Apply controls filter
    if (activeFilters.controls?.length > 0) {
      filtered = filtered.filter(risk => {
        const hasControls = risk.relatedControlIds.length > 0;
        return activeFilters.controls!.includes('with-controls') ? hasControls : !hasControls;
      });
    }

    return filtered;
  }, [risks, activeFilters]);

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

  // Default filter sets
  const defaultFilterSets = [
    {
      id: 'critical-high',
      name: 'Critical & High Risks',
      filters: { 
        level: ['Critical', 'High'],
        category: [],
        owner: [],
        controls: []
      },
      isDefault: true
    },
    {
      id: 'uncontrolled',
      name: 'Uncontrolled Risks',
      filters: { 
        controls: ['without-controls'],
        level: [],
        category: [],
        owner: []
      },
      isDefault: true
    },
    {
      id: 'ai-ml-risks',
      name: 'AI/ML Specific',
      filters: { 
        category: ['AI/ML Model Risks', 'Algorithmic Risks'],
        level: [],
        owner: [],
        controls: []
      },
      isDefault: true
    },
    {
      id: 'compliance-risks',
      name: 'Compliance Related',
      filters: { 
        category: ['Regulatory Compliance', 'Ethical and Societal'],
        level: [],
        owner: [],
        controls: []
      },
      isDefault: true
    }
  ];

  const allFilterSets = [...defaultFilterSets, ...savedFilterSets];
  const stats = getStatistics();

  return (
    <div className="flex h-full">
      {/* Collapsible Filter Panel - Left Side */}
      <CollapsibleFilterPanel
        filterGroups={filterGroups}
        activeFilters={activeFilters}
        savedFilterSets={allFilterSets}
        onFilterChange={updateFilter}
        onClearFilters={clearAllFilters}
        onSaveFilterSet={saveFilterSet}
        onLoadFilterSet={loadFilterSet}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Main Content - Right Side */}
      <div className="flex-1 space-y-6 p-6 overflow-y-auto">
        <PageHeader
          title={
            <span>
              Risk Register
              {hasActiveFilters && (
                <span className="ml-2 text-lg font-normal text-gray-600">
                  ({filteredRisks.length} of {risks.length})
                </span>
              )}
            </span>
          }
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
              searchTerm=""
              selectedCategories={[]}
              selectedLevels={[]}
              onRowClick={handleRowClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};