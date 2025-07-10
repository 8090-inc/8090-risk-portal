import { useState, useEffect, useCallback } from 'react';

interface SavedFilterSet {
  id: string;
  name: string;
  filters: Record<string, string[]>;
  isDefault?: boolean;
}

interface UseFiltersOptions {
  storageKey: string;
  defaultFilters?: Record<string, string[]>;
}

export const useFilters = ({ storageKey, defaultFilters = {} }: UseFiltersOptions) => {
  // Active filters state
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(() => {
    // Try to load from localStorage
    const stored = localStorage.getItem(`${storageKey}_filters`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored filters:', e);
      }
    }
    return defaultFilters;
  });

  // Saved filter sets
  const [savedFilterSets, setSavedFilterSets] = useState<SavedFilterSet[]>(() => {
    const stored = localStorage.getItem(`${storageKey}_filterSets`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored filter sets:', e);
      }
    }
    return [];
  });

  // Persist active filters to localStorage
  useEffect(() => {
    localStorage.setItem(`${storageKey}_filters`, JSON.stringify(activeFilters));
  }, [activeFilters, storageKey]);

  // Persist saved filter sets to localStorage
  useEffect(() => {
    localStorage.setItem(`${storageKey}_filterSets`, JSON.stringify(savedFilterSets));
  }, [savedFilterSets, storageKey]);

  // Update a specific filter
  const updateFilter = useCallback((filterId: string, values: string[]) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterId]: values
    }));
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  // Save current filters as a set
  const saveFilterSet = useCallback((name: string) => {
    const newFilterSet: SavedFilterSet = {
      id: Date.now().toString(),
      name,
      filters: { ...activeFilters }
    };
    setSavedFilterSets(prev => [...prev, newFilterSet]);
  }, [activeFilters]);

  // Load a saved filter set
  const loadFilterSet = useCallback((filterSet: SavedFilterSet) => {
    setActiveFilters(filterSet.filters);
  }, []);

  // Delete a saved filter set
  const deleteFilterSet = useCallback((id: string) => {
    setSavedFilterSets(prev => prev.filter(set => set.id !== id));
  }, []);

  // Check if any filters are active
  const hasActiveFilters = Object.values(activeFilters).some(values => values.length > 0);

  // Get active filter count
  const activeFilterCount = Object.values(activeFilters).reduce(
    (sum, values) => sum + values.length, 
    0
  );

  return {
    activeFilters,
    savedFilterSets,
    updateFilter,
    clearAllFilters,
    saveFilterSet,
    loadFilterSet,
    deleteFilterSet,
    hasActiveFilters,
    activeFilterCount
  };
};