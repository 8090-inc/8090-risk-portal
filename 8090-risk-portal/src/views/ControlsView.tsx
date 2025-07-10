import React, { useMemo, useEffect } from 'react';
import { Download } from 'lucide-react';
import { useControlStore } from '../store';
import { useFilterStore } from '../store/filterStore';
import { ControlSummaryCard } from '../components/controls/ControlSummaryCard';
import { ControlsTable } from '../components/controls/ControlsTable';
import { CategorySidebar } from '../components/controls/CategorySidebar';
import { AdvancedFilterPanel } from '../components/common/AdvancedFilterPanel';
import { Button } from '../components/ui/Button';
import { useAsyncOperation } from '../hooks/useErrorHandler';

export const ControlsView: React.FC = () => {
  const { 
    controls, 
    isLoading, 
    error,
    loadControls,
    statistics
  } = useControlStore();

  const { activeFilters, setControlFilters } = useFilterStore();
  const controlFilters = activeFilters.controls;

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

  const filteredControls = useMemo(() => {
    let filtered = [...controls];

    // Apply category filter
    if (controlFilters?.categories && controlFilters.categories.length > 0) {
      filtered = filtered.filter(control => 
        controlFilters.categories!.includes(control.category)
      );
    }

    // Apply status filter
    if (controlFilters?.statuses && controlFilters.statuses.length > 0) {
      filtered = filtered.filter(control => 
        controlFilters.statuses!.includes(control.implementationStatus || 'Not Implemented')
      );
    }

    // Apply effectiveness filter
    if (controlFilters?.effectiveness && controlFilters.effectiveness.length > 0) {
      filtered = filtered.filter(control => 
        controlFilters.effectiveness!.includes(control.effectiveness || 'Not Assessed')
      );
    }

    // Apply compliance score range
    if (controlFilters?.complianceRange) {
      const [min, max] = controlFilters.complianceRange;
      filtered = filtered.filter(control => {
        const score = control.complianceScore || 0;
        return score >= min && score <= max;
      });
    }

    // Apply search term
    if (controlFilters?.searchTerm) {
      const searchLower = controlFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(control =>
        control.mitigationDescription.toLowerCase().includes(searchLower) ||
        control.mitigationID.toLowerCase().includes(searchLower) ||
        control.category.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [controls, controlFilters]);

  const categories = useMemo(() => {
    const categoryMap = new Map<string, number>();
    controls.forEach(control => {
      const count = categoryMap.get(control.category) || 0;
      categoryMap.set(control.category, count + 1);
    });
    return Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [controls]);

  const summaryStats = useMemo(() => {
    if (!statistics) return { ok: 0, attention: 0, pending: 0 };
    
    return {
      ok: statistics.byImplementationStatus['Implemented'] || 0,
      attention: statistics.byImplementationStatus['Not Implemented'] || 0,
      pending: statistics.byImplementationStatus['In Progress'] || 0
    };
  }, [statistics]);

  const handleCategoryToggle = (category: string) => {
    const currentCategories = controlFilters?.categories || [];
    setControlFilters({
      categories: currentCategories.includes(category)
        ? currentCategories.filter(c => c !== category)
        : [...currentCategories, category]
    });
  };

  const handleClearCategories = () => {
    setControlFilters({ categories: [] });
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export controls');
  };

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
    <div className="flex h-full bg-gray-50 min-w-0 overflow-x-hidden">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 p-4 overflow-y-auto overflow-x-hidden">
        <CategorySidebar
          categories={categories}
          selectedCategories={controlFilters?.categories || []}
          onCategoryToggle={handleCategoryToggle}
          onClearAll={handleClearCategories}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Controls</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage and monitor your AI risk control implementations
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

          {/* Advanced Filters */}
          <AdvancedFilterPanel type="controls" />

          {/* Export Button */}
          <div className="mb-6 flex justify-end">
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
          <ControlsTable
            controls={filteredControls}
            searchTerm={controlFilters?.searchTerm || ""}
            selectedCategories={controlFilters?.categories || []}
            selectedStatuses={controlFilters?.statuses || []}
          />
        </div>
      </div>
    </div>
  );
};