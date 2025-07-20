import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, RefreshCw, FileSpreadsheet, Filter } from 'lucide-react';
import { useRiskStore } from '../store';
import { RiskSummaryStats } from '../components/risks/RiskSummaryStats';
import { RiskTable } from '../components/risks/RiskTable';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn } from '../utils/cn';
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
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const {
    activeFilters,
    savedFilterSets,
    updateFilter,
    clearAllFilters,
    loadFilterSet,
    hasActiveFilters
  } = useFilters({ 
    storageKey: 'risks',
    defaultFilters: {}
  });

  useEffect(() => {
    loadRisks();
  }, [loadRisks]);

  // Build filter groups with counts - Simplified to only Category and Owner
  const filterGroups = useMemo(() => {
    const categoryOptions = Array.from(
      new Set(risks.map(r => r.riskCategory))
    ).map(category => ({
      value: category,
      label: category,
      count: risks.filter(r => r.riskCategory === category).length
    }));

    // Use standardized owner list and count occurrences
    const ownerOptions = RISK_OWNERS.map(owner => ({
      value: owner,
      label: owner,
      count: risks.filter(r => r.proposedOversightOwnership.includes(owner)).length
    })).filter(option => option.count > 0) // Only show owners that have risks
      .sort((a, b) => b.count - a.count); // Sort by count descending

    return [
      {
        id: 'category',
        label: 'Risk Category',
        options: categoryOptions.sort((a, b) => a.label.localeCompare(b.label)),
        multiple: true
      },
      {
        id: 'owner',
        label: 'Risk Owner',
        options: ownerOptions.sort((a, b) => a.label.localeCompare(b.label)),
        multiple: true
      }
    ];
  }, [risks]);

  // Apply filters - Simplified to only Category and Owner
  const filteredRisks = useMemo(() => {
    let filtered = [...risks];

    // Apply category filter
    if (activeFilters.category?.length > 0) {
      filtered = filtered.filter(risk => 
        activeFilters.category!.includes(risk.riskCategory)
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

  // Default filter sets - Updated to only use Category and Owner
  const defaultFilterSets = [
    {
      id: 'ai-ml-risks',
      name: 'AI/ML Specific',
      filters: { 
        category: ['AI/ML Model Risks', 'Algorithmic Risks'],
        owner: []
      },
      isDefault: true
    },
    {
      id: 'compliance-risks',
      name: 'Compliance Related',
      filters: { 
        category: ['Regulatory Compliance', 'Ethical and Societal'],
        owner: []
      },
      isDefault: true
    },
    {
      id: 'by-owner',
      name: 'My Risks',
      filters: { 
        category: [],
        owner: ['R&D Team', 'IT Operations'] // Example owners, adjust as needed
      },
      isDefault: true
    }
  ];

  const allFilterSets = [...defaultFilterSets, ...savedFilterSets];
  const stats = getStatistics();

  return (
    <div className="h-full">
      {/* Main Content - Full Width */}
      <div className="space-y-6 p-6 overflow-y-auto">
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
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                icon={<Filter className="h-4 w-4" />}
              >
                Filters
                {hasActiveFilters && (
                  <Badge size="sm" variant="primary" className="ml-2">
                    {Object.values(activeFilters).reduce((sum, values) => sum + values.length, 0)}
                  </Badge>
                )}
              </Button>
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

        {/* Collapsible Filter Panel */}
        {showFilterPanel && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-4">
              {/* Saved Filter Sets */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Saved Filters</h3>
                <div className="flex flex-wrap gap-2">
                  {allFilterSets.map((filterSet) => (
                    <Button
                      key={filterSet.id}
                      variant="secondary"
                      size="sm"
                      onClick={() => loadFilterSet(filterSet)}
                      className={cn(
                        "text-xs",
                        filterSet.isDefault && "text-gray-600"
                      )}
                    >
                      {filterSet.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Filter Groups - Only Category and Owner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filterGroups.map((group) => {
                  const activeCount = activeFilters[group.id]?.length || 0;
                  return (
                    <div key={group.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {group.label}
                        {activeCount > 0 && (
                          <Badge size="sm" variant="secondary" className="ml-2">
                            {activeCount}
                          </Badge>
                        )}
                      </label>
                      <div className="space-y-1 max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                        {group.options.map((option) => {
                          const isActive = activeFilters[group.id]?.includes(option.value);
                          return (
                            <label
                              key={option.value}
                              className="flex items-center justify-between p-1 rounded cursor-pointer hover:bg-gray-50"
                            >
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={isActive}
                                  onChange={(e) => {
                                    const currentValues = activeFilters[group.id] || [];
                                    const newValues = e.target.checked
                                      ? [...currentValues, option.value]
                                      : currentValues.filter(v => v !== option.value);
                                    updateFilter(group.id, newValues);
                                  }}
                                  className="h-3 w-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{option.label}</span>
                              </div>
                              <span className="text-xs text-gray-500">{option.count}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-red-600 hover:text-red-700"
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
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