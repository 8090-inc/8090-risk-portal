import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { cn } from '../../utils/cn';
import { FilterPanel } from './FilterPanel';
import { Badge } from '../ui/Badge';

interface FilterGroup {
  id: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}

interface SavedFilterSet {
  id: string;
  name: string;
  filters: Record<string, string[]>;
  createdAt: string;
}

interface CollapsibleFilterPanelProps {
  filterGroups: FilterGroup[];
  activeFilters: Record<string, string[]>;
  savedFilterSets: SavedFilterSet[];
  onFilterChange: (filterId: string, values: string[]) => void;
  onClearFilters: () => void;
  onSaveFilterSet: (name: string) => void;
  onLoadFilterSet: (filterSet: SavedFilterSet) => void;
  hasActiveFilters: boolean;
}

export const CollapsibleFilterPanel: React.FC<CollapsibleFilterPanelProps> = ({
  filterGroups,
  activeFilters,
  savedFilterSets,
  onFilterChange,
  onClearFilters,
  onSaveFilterSet,
  onLoadFilterSet,
  hasActiveFilters
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "bg-white border-r border-slate-200 transition-all duration-300 h-full relative",
      isCollapsed ? "w-12" : "w-80"
    )}>
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "absolute -right-3 top-20 z-10 bg-white border border-slate-200 rounded-full p-1.5 shadow-sm hover:shadow-md transition-all",
          "hover:bg-slate-50"
        )}
        aria-label={isCollapsed ? "Expand filters" : "Collapse filters"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-slate-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-slate-600" />
        )}
      </button>

      {/* Collapsed State */}
      {isCollapsed ? (
        <div className="flex flex-col items-center py-6 space-y-4">
          <Filter className="h-5 w-5 text-slate-600" />
          <span className="text-xs font-medium text-slate-600 transform -rotate-90 origin-center whitespace-nowrap mt-8">
            Filters
          </span>
          {hasActiveFilters && (
            <Badge variant="primary" size="sm" className="mt-4">
              {Object.values(activeFilters).flat().length}
            </Badge>
          )}
        </div>
      ) : (
        /* Expanded State */
        <div className="h-full">
          <FilterPanel
            filterGroups={filterGroups}
            activeFilters={activeFilters}
            savedFilterSets={savedFilterSets}
            onFilterChange={onFilterChange}
            onClearAll={onClearFilters}
            onSaveFilterSet={onSaveFilterSet}
            onLoadFilterSet={onLoadFilterSet}
            className="h-full"
          />
        </div>
      )}
    </div>
  );
};