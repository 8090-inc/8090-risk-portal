import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilters } from '../useFilters';

interface SavedFilterSet {
  id: string;
  name: string;
  filters: Record<string, string[]>;
  isDefault?: boolean;
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useFilters Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    // Reset mock implementation to return null by default
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('initializes with default filters', () => {
    const { result } = renderHook(() => 
      useFilters({ 
        storageKey: 'test',
        defaultFilters: { category: ['AI/ML'] }
      })
    );

    expect(result.current.activeFilters).toEqual({ category: ['AI/ML'] });
    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.activeFilterCount).toBe(1);
  });

  it('loads filters from localStorage if available', () => {
    const storedFilters = { status: ['Active'], type: ['High'] };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(storedFilters));

    const { result } = renderHook(() => 
      useFilters({ storageKey: 'test' })
    );

    expect(result.current.activeFilters).toEqual(storedFilters);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test_filters');
  });

  it('updates a filter', () => {
    const { result } = renderHook(() => 
      useFilters({ storageKey: 'test' })
    );

    act(() => {
      result.current.updateFilter('category', ['Technical', 'Administrative']);
    });

    expect(result.current.activeFilters.category).toEqual(['Technical', 'Administrative']);
    expect(result.current.activeFilterCount).toBe(2);
  });

  it('clears all filters', () => {
    const { result } = renderHook(() => 
      useFilters({ 
        storageKey: 'test',
        defaultFilters: { category: ['AI/ML'], status: ['Active'] }
      })
    );

    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.clearAllFilters();
    });

    expect(result.current.activeFilters).toEqual({});
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.activeFilterCount).toBe(0);
  });

  it('saves current filters as a filter set', () => {
    const { result } = renderHook(() => 
      useFilters({ 
        storageKey: 'test',
        defaultFilters: { category: ['Technical'] }
      })
    );

    act(() => {
      result.current.saveFilterSet('My Filters');
    });

    expect(result.current.savedFilterSets).toHaveLength(1);
    expect(result.current.savedFilterSets[0]).toMatchObject({
      name: 'My Filters',
      filters: { category: ['Technical'] }
    });
  });

  it('loads a saved filter set', () => {
    const { result } = renderHook(() => 
      useFilters({ storageKey: 'test' })
    );

    const filterSet = {
      id: '123',
      name: 'Test Set',
      filters: { status: ['Implemented'], category: ['Security'] }
    };

    act(() => {
      result.current.saveFilterSet('Initial');
      result.current.loadFilterSet(filterSet);
    });

    expect(result.current.activeFilters).toEqual(filterSet.filters);
  });

  it('deletes a saved filter set', () => {
    const { result } = renderHook(() => 
      useFilters({ storageKey: 'test' })
    );

    // Save a filter set first
    act(() => {
      result.current.saveFilterSet('Filter to Delete');
    });

    expect(result.current.savedFilterSets).toHaveLength(1);
    const filterSetId = result.current.savedFilterSets[0].id;

    // Delete the filter set
    act(() => {
      result.current.deleteFilterSet(filterSetId);
    });

    expect(result.current.savedFilterSets).toHaveLength(0);
  });

  it('persists filters to localStorage on change', () => {
    const { result } = renderHook(() => 
      useFilters({ storageKey: 'test' })
    );

    act(() => {
      result.current.updateFilter('level', ['High', 'Critical']);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'test_filters',
      JSON.stringify({ level: ['High', 'Critical'] })
    );
  });

  it('persists filter sets to localStorage on change', () => {
    const { result } = renderHook(() => 
      useFilters({ storageKey: 'test' })
    );

    act(() => {
      result.current.saveFilterSet('New Set');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'test_filterSets',
      expect.stringContaining('New Set')
    );
  });

  it('handles invalid localStorage data gracefully', () => {
    // Mock console.error to suppress expected error logging
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorageMock.getItem.mockReturnValueOnce('invalid json');

    const { result } = renderHook(() => 
      useFilters({ 
        storageKey: 'test',
        defaultFilters: { fallback: ['value'] }
      })
    );

    expect(result.current.activeFilters).toEqual({ fallback: ['value'] });
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to parse stored filters:', expect.any(Error));
    
    consoleErrorSpy.mockRestore();
  });

  it('calculates active filter count correctly', () => {
    const { result } = renderHook(() => 
      useFilters({ storageKey: 'test' })
    );

    act(() => {
      result.current.updateFilter('category', ['A', 'B', 'C']);
      result.current.updateFilter('status', ['Active']);
      result.current.updateFilter('level', []);
    });

    expect(result.current.activeFilterCount).toBe(4); // 3 + 1
  });
});