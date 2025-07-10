import React, { useState } from 'react';
import { 
  Filter, 
  Save, 
  X, 
  ChevronDown, 
  ChevronUp,
  Bookmark,
  Clock,
  Trash2
} from 'lucide-react';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { useFilterStore } from '../../store/filterStore';

interface AdvancedFilterPanelProps {
  type: 'risks' | 'controls';
  onFiltersChange?: () => void;
}

export const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({ 
  type,
  onFiltersChange 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterSetName, setFilterSetName] = useState('');
  const [filterSetDescription, setFilterSetDescription] = useState('');
  
  const {
    activeFilters,
    savedFilterSets,
    recentFilters,
    setRiskFilters,
    setControlFilters,
    clearRiskFilters,
    clearControlFilters,
    saveFilterSet,
    loadFilterSet,
    deleteFilterSet,
    addRecentRiskCategory,
    addRecentControlCategory
  } = useFilterStore();

  const currentFilters = type === 'risks' ? activeFilters.risks : activeFilters.controls;
  const hasActiveFilters = currentFilters && Object.keys(currentFilters).length > 0;

  const handleSaveFilterSet = () => {
    if (filterSetName.trim()) {
      saveFilterSet(filterSetName.trim(), filterSetDescription.trim());
      setShowSaveDialog(false);
      setFilterSetName('');
      setFilterSetDescription('');
    }
  };

  const handleClearFilters = () => {
    if (type === 'risks') {
      clearRiskFilters();
    } else {
      clearControlFilters();
    }
    onFiltersChange?.();
  };

  const QuickFilterPills: React.FC = () => {
    const relevantRecent = type === 'risks' 
      ? recentFilters.riskCategories 
      : recentFilters.controlCategories;

    if (relevantRecent.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>Recent</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {relevantRecent.map(filter => (
            <button
              key={filter}
              className="px-2 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-xs"
              onClick={() => {
                if (type === 'risks') {
                  setRiskFilters({ 
                    categories: [...(currentFilters?.categories || []), filter] 
                  });
                } else {
                  setControlFilters({ 
                    categories: [...(currentFilters?.categories || []), filter] 
                  });
                }
                onFiltersChange?.();
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const SavedFilterSets: React.FC = () => {
    const relevantFilterSets = savedFilterSets.filter(fs => 
      (type === 'risks' && fs.filters.risks) || 
      (type === 'controls' && fs.filters.controls)
    );

    if (relevantFilterSets.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Bookmark className="h-3 w-3" />
          <span>Saved filters</span>
        </div>
        <div className="space-y-1">
          {relevantFilterSets.map(filterSet => (
            <div
              key={filterSet.id}
              className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50 text-sm"
            >
              <div 
                className="flex-1 cursor-pointer truncate"
                onClick={() => {
                  loadFilterSet(filterSet.id);
                  onFiltersChange?.();
                }}
                title={filterSet.description}
              >
                {filterSet.name}
              </div>
              <button
                onClick={() => deleteFilterSet(filterSet.id)}
                className="p-1 hover:text-red-600"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <h3 className="text-base font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <Badge variant="primary" className="text-xs">
              {Object.keys(currentFilters).length}
            </Badge>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {!isExpanded && hasActiveFilters && (
        <div className="flex flex-wrap gap-1">
          {currentFilters.categories?.map(category => (
            <Badge key={category} variant="default" className="text-xs">
              {category}
            </Badge>
          ))}
          {type === 'risks' && activeFilters.risks?.levels?.map((level: string) => (
            <Badge 
              key={level} 
              variant={
                level === 'Critical' ? 'danger' :
                level === 'High' ? 'warning' :
                level === 'Medium' ? 'default' : 'success'
              }
              className="text-xs"
            >
              {level}
            </Badge>
          ))}
          {type === 'controls' && activeFilters.controls?.statuses?.map((status: string) => (
            <Badge 
              key={status} 
              variant={
                status === 'Implemented' ? 'success' :
                status === 'In Progress' ? 'warning' : 'default'
              }
              className="text-xs"
            >
              {status}
            </Badge>
          ))}
        </div>
      )}

      {isExpanded && (
        <div className="space-y-4 mt-4">
          {/* Action buttons */}
          {hasActiveFilters && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSaveDialog(true)}
                className="flex-1"
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="flex-1"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          )}

          {/* Quick filter pills */}
          <QuickFilterPills />

          {/* Saved filter sets */}
          <SavedFilterSets />

          {/* Filter form */}
          <div className="space-y-3">
            {type === 'risks' ? (
              <>
                <Select
                  label="Risk Categories"
                  placeholder="Select categories"
                  multiple
                  value={currentFilters?.categories || []}
                  onChange={(value) => {
                    setRiskFilters({ categories: value as string[] });
                    (value as string[]).forEach(cat => addRecentRiskCategory(cat));
                    onFiltersChange?.();
                  }}
                  options={[
                    { value: 'Behavioral Risks', label: 'Behavioral Risks' },
                    { value: 'Transparency Risks', label: 'Transparency Risks' },
                    { value: 'Security and Data Risks', label: 'Security and Data Risks' },
                    { value: 'Other Risks', label: 'Other Risks' },
                    { value: 'Business/Cost Related Risks', label: 'Business/Cost Related Risks' },
                    { value: 'AI Human Impact Risks', label: 'AI Human Impact Risks' }
                  ]}
                />

                <Select
                  label="Risk Levels"
                  placeholder="Select levels"
                  multiple
                  value={type === 'risks' ? activeFilters.risks?.levels || [] : []}
                  onChange={(value) => {
                    setRiskFilters({ levels: value as string[] });
                    onFiltersChange?.();
                  }}
                  options={[
                    { value: 'Critical', label: 'Critical' },
                    { value: 'High', label: 'High' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'Low', label: 'Low' }
                  ]}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Has Controls
                  </label>
                  <Select
                    placeholder="Any"
                    value={type === 'risks' ? activeFilters.risks?.hasControls?.toString() || '' : ''}
                    onChange={(value) => {
                      setRiskFilters({ 
                        hasControls: value === '' ? undefined : value === 'true' 
                      });
                      onFiltersChange?.();
                    }}
                    options={[
                      { value: '', label: 'Any' },
                      { value: 'true', label: 'With Controls' },
                      { value: 'false', label: 'Without Controls' }
                    ]}
                  />
                </div>

              </>
            ) : (
              <>
                <Select
                  label="Control Categories"
                  placeholder="Select categories"
                  multiple
                  value={currentFilters?.categories || []}
                  onChange={(value) => {
                    setControlFilters({ categories: value as string[] });
                    (value as string[]).forEach(cat => addRecentControlCategory(cat));
                    onFiltersChange?.();
                  }}
                  options={[
                    { value: 'Technical', label: 'Technical' },
                    { value: 'Governance', label: 'Governance' },
                    { value: 'Monitoring', label: 'Monitoring' },
                    { value: 'Compliance', label: 'Compliance' }
                  ]}
                />

                <Select
                  label="Implementation Status"
                  placeholder="Select statuses"
                  multiple
                  value={type === 'controls' ? activeFilters.controls?.statuses || [] : []}
                  onChange={(value) => {
                    setControlFilters({ statuses: value as string[] });
                    onFiltersChange?.();
                  }}
                  options={[
                    { value: 'Implemented', label: 'Implemented' },
                    { value: 'In Progress', label: 'In Progress' },
                    { value: 'Planned', label: 'Planned' },
                    { value: 'Not Implemented', label: 'Not Implemented' }
                  ]}
                />

                <Select
                  label="Effectiveness"
                  placeholder="Select effectiveness"
                  multiple
                  value={type === 'controls' ? activeFilters.controls?.effectiveness || [] : []}
                  onChange={(value) => {
                    setControlFilters({ effectiveness: value as string[] });
                    onFiltersChange?.();
                  }}
                  options={[
                    { value: 'High', label: 'High' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'Low', label: 'Low' },
                    { value: 'Not Assessed', label: 'Not Assessed' }
                  ]}
                />

              </>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Save filter set dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Save Filter Set</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={filterSetName}
                  onChange={(e) => setFilterSetName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-8090-primary focus:border-transparent"
                  placeholder="My custom filters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={filterSetDescription}
                  onChange={(e) => setFilterSetDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-8090-primary focus:border-transparent"
                  rows={3}
                  placeholder="Describe what these filters are for..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowSaveDialog(false);
                    setFilterSetName('');
                    setFilterSetDescription('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveFilterSet}
                  disabled={!filterSetName.trim()}
                >
                  Save
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};