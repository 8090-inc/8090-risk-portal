import React, { useState } from 'react';
import { X, Filter, Save, Bookmark } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  multiple?: boolean;
}

interface SavedFilterSet {
  id: string;
  name: string;
  filters: Record<string, string[]>;
  isDefault?: boolean;
}

interface FilterPanelProps {
  filterGroups: FilterGroup[];
  activeFilters: Record<string, string[]>;
  onFilterChange: (filterId: string, values: string[]) => void;
  onClearAll: () => void;
  savedFilterSets?: SavedFilterSet[];
  onSaveFilterSet?: (name: string) => void;
  onLoadFilterSet?: (filterSet: SavedFilterSet) => void;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filterGroups,
  activeFilters,
  onFilterChange,
  onClearAll,
  savedFilterSets = [],
  onSaveFilterSet,
  onLoadFilterSet,
  className
}) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterSetName, setFilterSetName] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(filterGroups.map(g => g.id))
  );

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleOptionToggle = (groupId: string, value: string, multiple: boolean) => {
    const currentValues = activeFilters[groupId] || [];
    let newValues: string[];

    if (multiple) {
      if (currentValues.includes(value)) {
        newValues = currentValues.filter(v => v !== value);
      } else {
        newValues = [...currentValues, value];
      }
    } else {
      newValues = currentValues.includes(value) ? [] : [value];
    }

    onFilterChange(groupId, newValues);
  };

  const hasActiveFilters = Object.values(activeFilters).some(values => values.length > 0);

  const handleSaveFilterSet = () => {
    if (filterSetName.trim() && onSaveFilterSet) {
      onSaveFilterSet(filterSetName.trim());
      setFilterSetName('');
      setShowSaveDialog(false);
    }
  };

  return (
    <div className={cn("bg-white border border-slate-200 rounded-md", className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-900 flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-xs"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Quick Filter Pills */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([groupId, values]) => {
              const group = filterGroups.find(g => g.id === groupId);
              if (!group || values.length === 0) return null;
              
              return values.map(value => {
                const option = group.options.find(o => o.value === value);
                return (
                  <Badge
                    key={`${groupId}-${value}`}
                    variant="default"
                    className="text-xs flex items-center gap-1"
                  >
                    <span>{option?.label || value}</span>
                    <button
                      onClick={() => handleOptionToggle(groupId, value, group.multiple !== false)}
                      className="ml-1 hover:text-slate-700 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              });
            })}
          </div>
        )}
      </div>

      {/* Saved Filter Sets */}
      {savedFilterSets.length > 0 && (
        <div className="px-4 py-3 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-slate-700 uppercase tracking-wider">
              Saved Filters
            </h4>
            {hasActiveFilters && onSaveFilterSet && (
              <button
                onClick={() => setShowSaveDialog(true)}
                className="text-xs text-accent hover:text-accent/80 transition-colors"
              >
                <Save className="h-3 w-3 inline mr-1" />
                Save current
              </button>
            )}
          </div>
          <div className="space-y-1">
            {savedFilterSets.map(filterSet => (
              <button
                key={filterSet.id}
                onClick={() => onLoadFilterSet?.(filterSet)}
                className="w-full text-left px-2 py-1 text-sm rounded hover:bg-slate-50 flex items-center justify-between group transition-colors"
              >
                <span className="flex items-center">
                  <Bookmark className="h-3 w-3 mr-2 text-slate-400" />
                  {filterSet.name}
                </span>
                {filterSet.isDefault && (
                  <Badge variant="secondary" className="text-xs">
                    Default
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">
              Save current filters as:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={filterSetName}
                onChange={(e) => setFilterSetName(e.target.value)}
                placeholder="Filter set name"
                className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-accent"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveFilterSet()}
              />
              <Button
                size="sm"
                variant="primary"
                onClick={handleSaveFilterSet}
                disabled={!filterSetName.trim()}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowSaveDialog(false);
                  setFilterSetName('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Groups */}
      <div className="divide-y divide-slate-200">
        {filterGroups.map(group => {
          const isExpanded = expandedGroups.has(group.id);
          const activeCount = (activeFilters[group.id] || []).length;

          return (
            <div key={group.id} className="px-4 py-3">
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between text-sm font-medium text-slate-900 hover:text-slate-700 transition-colors"
              >
                <span>
                  {group.label}
                  {activeCount > 0 && (
                    <Badge variant="primary" className="ml-2 text-xs">
                      {activeCount}
                    </Badge>
                  )}
                </span>
                <svg
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isExpanded ? "rotate-180" : ""
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isExpanded && (
                <div className="mt-3 space-y-2">
                  {group.options.map(option => {
                    const isActive = (activeFilters[group.id] || []).includes(option.value);
                    
                    return (
                      <label
                        key={option.value}
                        className="flex items-center justify-between py-1 px-2 rounded hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => handleOptionToggle(group.id, option.value, group.multiple !== false)}
                            className="h-4 w-4 text-accent border-slate-300 rounded focus:ring-accent"
                          />
                          <span className="ml-2 text-sm text-slate-700">
                            {option.label}
                          </span>
                        </div>
                        {option.count !== undefined && (
                          <span className="text-xs text-slate-500">
                            {option.count}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};