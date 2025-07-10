import React, { useState, useMemo, useEffect } from 'react';
import { Download, Filter } from 'lucide-react';
import { useControlStore } from '../store';
import type { ControlCategory } from '../types';
import { ControlSummaryCard } from '../components/controls/ControlSummaryCard';
import { ControlsTable } from '../components/controls/ControlsTable';
import { CategorySidebar } from '../components/controls/CategorySidebar';
import { StatusFilter } from '../components/controls/StatusFilter';
import { SearchBar } from '../components/common/SearchBar';
import { Button } from '../components/ui/Button';
import { useAsyncOperation } from '../hooks/useErrorHandler';

export const ControlsView: React.FC = () => {
  const { 
    controls, 
    isLoading, 
    error,
    loadControls,
    filteredControls,
    searchTerm,
    setSearchTerm,
    setFilters,
    statistics
  } = useControlStore();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<Array<'Implemented' | 'In Progress' | 'Planned' | 'Not Started' | undefined>>([]);
  const [showFilters, setShowFilters] = useState(false);

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

  useEffect(() => {
    setFilters({
      categories: selectedCategories as ControlCategory[],
      implementationStatus: selectedStatuses
    });
  }, [selectedCategories, selectedStatuses, setFilters]);

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
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleClearCategories = () => {
    setSelectedCategories([]);
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
          selectedCategories={selectedCategories}
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

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4 flex-1">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search controls..."
                  className="w-full max-w-md"
                />
                <StatusFilter
                  selectedStatuses={selectedStatuses}
                  onStatusChange={setSelectedStatuses}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  icon={<Filter className="h-4 w-4" />}
                >
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExport}
                  icon={<Download className="h-4 w-4" />}
                >
                  Export
                </Button>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCategories.length > 0 || selectedStatuses.length > 0) && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-500">Active filters:</span>
                {selectedCategories.map(cat => (
                  <span key={cat} className="px-2 py-1 bg-8090-primary/10 text-8090-primary rounded">
                    {cat}
                  </span>
                ))}
                {selectedStatuses.map(status => (
                  <span key={status} className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    {status}
                  </span>
                ))}
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedStatuses([]);
                  }}
                  className="text-8090-primary hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Controls Table */}
          <ControlsTable
            controls={filteredControls}
            searchTerm={searchTerm}
            selectedCategories={selectedCategories}
            selectedStatuses={selectedStatuses.filter(s => s !== undefined) as string[]}
          />
        </div>
      </div>
    </div>
  );
};