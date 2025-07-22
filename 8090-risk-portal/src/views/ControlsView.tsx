import React, { useMemo, useEffect, useState } from 'react';
import { Download, Filter } from 'lucide-react';
import { useControlStore } from '../store';
import { ControlSummaryCard } from '../components/controls/ControlSummaryCard';
import { ControlsTable } from '../components/controls/ControlsTable';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { useAsyncOperation } from '../hooks/useErrorHandler';
import { useFilters } from '../hooks/useFilters';
import { Badge } from '../components/ui/Badge';
import { cn } from '../utils/cn';
import { exportControlsToExcel } from '../utils/exportUtils';

export const ControlsView: React.FC = () => {
  const { 
    controls, 
    isLoading, 
    error,
    loadControls,
    statistics
  } = useControlStore();

  const {
    activeFilters,
    savedFilterSets,
    updateFilter,
    clearAllFilters,
    loadFilterSet,
    hasActiveFilters
  } = useFilters({ 
    storageKey: 'controls',
    defaultFilters: {}
  });

  // Debug: Log filter state
  console.log('ControlsView: Active filters:', activeFilters);
  console.log('ControlsView: Has active filters:', hasActiveFilters);

  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const { execute: loadControlsAsync } = useAsyncOperation(loadControls, {
    onError: (error) => {
      console.error('Failed to load controls:', error);
    }
  });

  useEffect(() => {
    if (controls.length === 0) {
      loadControlsAsync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debug: Log controls when they change
  useEffect(() => {
    console.log('ControlsView: Controls updated:', controls.length, controls);
    if (controls.length > 0) {
      console.log('ControlsView: First control:', controls[0]);
      console.log('ControlsView: Control statuses:', controls.map(c => c.implementationStatus));
    }
  }, [controls]);

  // Build filter groups with counts
  const filterGroups = useMemo(() => {
    const categoryOptions = Array.from(
      new Set(controls.map(c => c.category))
    ).map(category => ({
      value: category,
      label: category,
      count: controls.filter(c => c.category === category).length
    }));

    const statusOptions = [
      { value: 'Implemented', label: 'Implemented', count: 0 },
      { value: 'In Progress', label: 'In Progress', count: 0 },
      { value: 'Planned', label: 'Planned', count: 0 },
      { value: 'Not Started', label: 'Not Started', count: 0 }
    ];

    const effectivenessOptions = [
      { value: 'High', label: 'High', count: 0 },
      { value: 'Medium', label: 'Medium', count: 0 },
      { value: 'Low', label: 'Low', count: 0 },
      { value: 'Not Assessed', label: 'Not Assessed', count: 0 }
    ];

    // Count statuses and effectiveness
    controls.forEach(control => {
      const status = control.implementationStatus || 'Not Started';
      const statusOption = statusOptions.find(o => o.value === status);
      if (statusOption) statusOption.count++;

      const effectiveness = control.effectiveness || 'Not Assessed';
      const effectivenessOption = effectivenessOptions.find(o => o.value === effectiveness);
      if (effectivenessOption) effectivenessOption.count++;
    });

    return [
      {
        id: 'category',
        label: 'Category',
        options: categoryOptions.sort((a, b) => a.label.localeCompare(b.label)),
        multiple: true
      },
      {
        id: 'status',
        label: 'Implementation Status',
        options: statusOptions.filter(o => o.count > 0),
        multiple: true
      },
      {
        id: 'effectiveness',
        label: 'Effectiveness',
        options: effectivenessOptions.filter(o => o.count > 0),
        multiple: true
      }
    ];
  }, [controls]);

  // Apply filters
  const filteredControls = useMemo(() => {
    let filtered = [...controls];

    // Apply category filter
    if (activeFilters.category?.length > 0) {
      filtered = filtered.filter(control => 
        activeFilters.category!.includes(control.category)
      );
      console.log('ControlsView: After category filter:', filtered.length);
    }

    // Apply status filter
    if (activeFilters.status?.length > 0) {
      filtered = filtered.filter(control => 
        activeFilters.status!.includes(control.implementationStatus || 'Not Started')
      );
    }

    // Apply effectiveness filter
    if (activeFilters.effectiveness?.length > 0) {
      filtered = filtered.filter(control => 
        activeFilters.effectiveness!.includes(control.effectiveness || 'Not Assessed')
      );
    }

    return filtered;
  }, [controls, activeFilters]);

  // Auto-clear invalid filters when no controls match
  useEffect(() => {
    if (controls.length > 0 && hasActiveFilters && filteredControls.length === 0) {
      console.warn('ControlsView: No controls match current filters, clearing filters');
      clearAllFilters();
    }
  }, [controls.length, hasActiveFilters, filteredControls.length, clearAllFilters]);

  const summaryStats = useMemo(() => {
    if (!statistics) return { ok: 0, attention: 0, pending: 0 };
    
    return {
      ok: statistics.byImplementationStatus['Implemented'] || 0,
      attention: statistics.byImplementationStatus['Not Started'] || 0,
      pending: statistics.byImplementationStatus['In Progress'] || 0
    };
  }, [statistics]);

  const handleExport = () => {
    const filename = `controls-register-${new Date().toISOString().split('T')[0]}.xlsx`;
    exportControlsToExcel(filteredControls, filename);
  };

  // Default filter sets
  const defaultFilterSets = [
    {
      id: 'critical',
      name: 'Critical Controls',
      filters: { 
        category: ['Technical Controls', 'Security and Privacy'],
        effectiveness: ['High'],
        status: []
      },
      isDefault: true
    },
    {
      id: 'needs-attention',
      name: 'Needs Attention',
      filters: { 
        status: ['Not Started', 'Planned'],
        effectiveness: ['Low', 'Not Assessed'],
        category: []
      },
      isDefault: true
    },
    {
      id: 'compliance-ready',
      name: 'Compliance Ready',
      filters: { 
        status: ['Implemented'],
        effectiveness: ['High', 'Medium'],
        category: []
      },
      isDefault: true
    }
  ];

  const allFilterSets = [...defaultFilterSets, ...savedFilterSets];

  if (isLoading && controls.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-8090-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading controls...</p>
        </div>
      </div>
    );
  }

  if (error && controls.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600">Failed to load controls</p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => loadControlsAsync()}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Main Content - Full Width */}
      <div className="space-y-6 p-6 overflow-y-auto">
        <PageHeader
          title={
            <span>
              Controls
              {hasActiveFilters && (
                <span className="ml-2 text-lg font-normal text-gray-600">
                  ({filteredControls.length} of {controls.length})
                </span>
              )}
            </span>
          }
          description="Manage and monitor your AI risk control implementations"
          actions={
            <div className="flex items-center space-x-3">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-red-600 hover:text-red-700 mr-2"
                >
                  Clear Filters
                </Button>
              )}
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
                onClick={handleExport}
                icon={<Download className="h-4 w-4" />}
              >
                Export
              </Button>
              {/* Debug button to clear filters */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  localStorage.removeItem('controls_filters');
                  localStorage.removeItem('controls_filterSets');
                  localStorage.removeItem('control-store');
                  window.location.reload();
                }}
                className="text-red-600"
              >
                Clear Cache
              </Button>
            </div>
          }
        />

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

                {/* Filter Groups */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ControlSummaryCard
              title="Implemented"
              count={summaryStats.ok}
              variant="ok"
              description="Controls fully implemented and compliant"
            />
            <ControlSummaryCard
              title="Not Started"
              count={summaryStats.attention}
              variant="attention"
              description="Controls requiring immediate attention"
            />
            <ControlSummaryCard
              title="In Progress"
              count={summaryStats.pending}
              variant="pending"
              description="Controls currently being implemented"
            />
          </div>

          {/* Controls Table */}
          <div className="bg-white shadow rounded-lg p-6">
            {console.log('ControlsView: Rendering ControlsTable with controls:', filteredControls.length)}
            {console.log('ControlsView: First filtered control:', filteredControls[0])}
            {console.log('ControlsView: Has active filters:', hasActiveFilters)}
            {console.log('ControlsView: Active filters detail:', JSON.stringify(activeFilters))}
            <ControlsTable
              controls={filteredControls}
              searchTerm=""
              selectedCategories={[]}
              selectedStatuses={[]}
            />
          </div>
      </div>
    </div>
  );
};