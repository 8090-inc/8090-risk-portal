import React from 'react';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { X } from 'lucide-react';
import type { RiskCategory, RiskLevelCategory } from '../../types';

interface RiskFiltersProps {
  selectedCategories: string[];
  selectedLevels: string[];
  onCategoryChange: (categories: string[]) => void;
  onLevelChange: (levels: string[]) => void;
  onClearAll: () => void;
}

const categoryOptions: Array<{ value: RiskCategory; label: string }> = [
  { value: 'Behavioral Risks', label: 'Behavioral Risks' },
  { value: 'Transparency Risks', label: 'Transparency Risks' },
  { value: 'Security and Data Risks', label: 'Security and Data Risks' },
  { value: 'Other Risks', label: 'Other Risks' },
  { value: 'Business/Cost Related Risks', label: 'Business/Cost Related Risks' },
  { value: 'AI Human Impact Risks', label: 'AI Human Impact Risks' }
];

const levelOptions: Array<{ value: RiskLevelCategory; label: string }> = [
  { value: 'Critical', label: 'Critical' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' }
];

export const RiskFilters: React.FC<RiskFiltersProps> = ({
  selectedCategories,
  selectedLevels,
  onCategoryChange,
  onLevelChange,
  onClearAll
}) => {
  const hasActiveFilters = selectedCategories.length > 0 || selectedLevels.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-4">
        <div className="w-64">
          <Select
            label="Filter by Category"
            placeholder="All categories"
            options={categoryOptions}
            value={selectedCategories}
            onChange={(value) => onCategoryChange(value as string[])}
            multiple
          />
        </div>

        <div className="w-64">
          <Select
            label="Filter by Risk Level"
            placeholder="All risk levels"
            options={levelOptions}
            value={selectedLevels}
            onChange={(value) => onLevelChange(value as string[])}
            multiple
          />
        </div>

        {hasActiveFilters && (
          <div className="pt-6">
            <button
              onClick={onClearAll}
              className="text-sm text-8090-primary hover:text-8090-primary/80 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {selectedCategories.map(category => (
            <Badge
              key={category}
              variant="default"
              className="flex items-center space-x-1"
            >
              <span>{category}</span>
              <button
                onClick={() => onCategoryChange(selectedCategories.filter(c => c !== category))}
                className="ml-1 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedLevels.map(level => {
            const variant = level === 'Critical' ? 'risk-critical' : 
                           level === 'High' ? 'risk-high' : 
                           level === 'Medium' ? 'risk-medium' : 'risk-low';
            return (
              <Badge
                key={level}
                variant={variant}
                className="flex items-center space-x-1"
              >
                <span>{level}</span>
                <button
                  onClick={() => onLevelChange(selectedLevels.filter(l => l !== level))}
                  className="ml-1 hover:opacity-80"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};