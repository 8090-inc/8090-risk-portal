import { Button, Input, Label, Select } from '../ui';
import { X, Search } from 'lucide-react';
import {
  VALID_BUSINESS_AREAS,
  VALID_AI_CATEGORIES,
  VALID_STATUSES,
  type UseCaseFilters as Filters
} from '../../types/useCase.types';

interface UseCaseFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
}

export function UseCaseFilters({ filters, onFiltersChange, onClearFilters }: UseCaseFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(value => value);
  
  const handleFilterChange = (key: keyof Filters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    });
  };
  
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search use cases..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="pl-9"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Business Area */}
        <div className="space-y-2">
          <Label htmlFor="businessArea">Business Area</Label>
          <Select
            value={filters.businessArea || ''}
            onChange={(value) => handleFilterChange('businessArea', value)}
            options={[
              { value: '', label: 'All areas' },
              ...VALID_BUSINESS_AREAS.map(area => ({
                value: area,
                label: area
              }))
            ]}
          />
        </div>
        
        {/* AI Category */}
        <div className="space-y-2">
          <Label htmlFor="aiCategory">AI Category</Label>
          <Select
            value={filters.aiCategory || ''}
            onChange={(value) => handleFilterChange('aiCategory', value)}
            options={[
              { value: '', label: 'All categories' },
              ...VALID_AI_CATEGORIES.map(category => ({
                value: category,
                label: category
              }))
            ]}
          />
        </div>
        
        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={filters.status || ''}
            onChange={(value) => handleFilterChange('status', value)}
            options={[
              { value: '', label: 'All statuses' },
              ...VALID_STATUSES.map(status => ({
                value: status,
                label: status
              }))
            ]}
          />
        </div>
        
        {/* Owner */}
        <div className="space-y-2">
          <Label htmlFor="owner">Owner</Label>
          <Input
            id="owner"
            type="text"
            placeholder="Filter by owner"
            value={filters.owner || ''}
            onChange={(e) => handleFilterChange('owner', e.target.value)}
          />
        </div>
      </div>
      
      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8"
          >
            <X className="mr-2 h-4 w-4" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}