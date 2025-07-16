import React, { useMemo, useEffect } from 'react';
import { Download } from 'lucide-react';
import { useControlStore } from '../store';
import { ControlSummaryCard } from '../components/controls/ControlSummaryCard';
import { ControlsTable } from '../components/controls/ControlsTable';
import { CollapsibleFilterPanel } from '../components/common/CollapsibleFilterPanel';
import { Button } from '../components/ui/Button';
import { useAsyncOperation } from '../hooks/useErrorHandler';
import { useFilters } from '../hooks/useFilters';

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
    saveFilterSet,
    loadFilterSet,
    hasActiveFilters
  } = useFilters({ 
    storageKey: 'controls',
    defaultFilters: {}
  });

  const { execute: loadControlsAsync } = useAsyncOperation(loadControls, {
    onError: (error) => {
      console.error('Failed to load controls:', error);
    }
  });

  useEffect(() => {
    if (controls.length === 0) {
      loadControlsAsync();
    }
  }, []);

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
      { value: 'Not Implemented', label: 'Not Implemented', count: 0 }
    ];

    const effectivenessOptions = [
      { value: 'High', label: 'High', count: 0 },
      { value: 'Medium', label: 'Medium', count: 0 },
      { value: 'Low', label: 'Low', count: 0 },
      { value: 'Not Assessed', label: 'Not Assessed', count: 0 }
    ];

    // Count statuses and effectiveness
    controls.forEach(control => {
      const status = control.implementationStatus || 'Not Implemented';
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
    }

    // Apply status filter
    if (activeFilters.status?.length > 0) {
      filtered = filtered.filter(control => 
        activeFilters.status!.includes(control.implementationStatus || 'Not Implemented')
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

  const summaryStats = useMemo(() => {
    if (!statistics) return { ok: 0, attention: 0, pending: 0 };
    
    return {
      ok: statistics.byImplementationStatus['Implemented'] || 0,
      attention: statistics.byImplementationStatus['Not Implemented'] || 0,
      pending: statistics.byImplementationStatus['In Progress'] || 0
    };
  }, [statistics]);

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export controls');
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
        status: ['Not Implemented', 'Planned'],
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
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Controls
            {hasActiveFilters && (
              <span className="ml-2 text-lg font-normal text-gray-600">
                ({filteredControls.length} of {controls.length})
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and monitor your AI risk control implementations
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ControlSummaryCard
            title="Implemented"
            count={summaryStats.ok}
            variant="ok"
            description="Controls fully implemented and compliant"
          />
          <ControlSummaryCard
            title="Not Implemented"
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

        {/* Export Button */}
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            icon={<Download className="h-4 w-4" />}
          >
            Export
          </Button>
        </div>

        {/* Controls Table */}
        <div className="bg-white shadow rounded-lg p-6">
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