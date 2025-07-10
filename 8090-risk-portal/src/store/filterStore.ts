import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface FilterSet {
  id: string;
  name: string;
  description?: string;
  filters: SavedFilters;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedFilters {
  risks?: {
    categories?: string[];
    levels?: string[];
    owners?: string[];
    dateRange?: DateRange;
    hasControls?: boolean;
    searchTerm?: string;
  };
  controls?: {
    categories?: string[];
    statuses?: string[];
    effectiveness?: string[];
    complianceRange?: [number, number];
    dateRange?: DateRange;
    searchTerm?: string;
  };
}

interface FilterStore {
  // Current active filters
  activeFilters: SavedFilters;
  
  // Saved filter sets
  savedFilterSets: FilterSet[];
  
  // Recently used values for quick access
  recentFilters: {
    riskCategories: string[];
    riskOwners: string[];
    controlCategories: string[];
  };
  
  // Actions
  setRiskFilters: (filters: SavedFilters['risks']) => void;
  setControlFilters: (filters: SavedFilters['controls']) => void;
  clearRiskFilters: () => void;
  clearControlFilters: () => void;
  clearAllFilters: () => void;
  
  // Filter set management
  saveFilterSet: (name: string, description?: string) => void;
  loadFilterSet: (id: string) => void;
  deleteFilterSet: (id: string) => void;
  updateFilterSet: (id: string, updates: Partial<FilterSet>) => void;
  
  // Recent filters
  addRecentRiskCategory: (category: string) => void;
  addRecentRiskOwner: (owner: string) => void;
  addRecentControlCategory: (category: string) => void;
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set, get) => ({
      activeFilters: {},
      savedFilterSets: [],
      recentFilters: {
        riskCategories: [],
        riskOwners: [],
        controlCategories: []
      },

      setRiskFilters: (filters) => set((state) => ({
        activeFilters: {
          ...state.activeFilters,
          risks: { ...state.activeFilters.risks, ...filters }
        }
      })),

      setControlFilters: (filters) => set((state) => ({
        activeFilters: {
          ...state.activeFilters,
          controls: { ...state.activeFilters.controls, ...filters }
        }
      })),

      clearRiskFilters: () => set((state) => ({
        activeFilters: {
          ...state.activeFilters,
          risks: undefined
        }
      })),

      clearControlFilters: () => set((state) => ({
        activeFilters: {
          ...state.activeFilters,
          controls: undefined
        }
      })),

      clearAllFilters: () => set({ activeFilters: {} }),

      saveFilterSet: (name, description) => {
        const newFilterSet: FilterSet = {
          id: `filter-${Date.now()}`,
          name,
          description,
          filters: get().activeFilters,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set((state) => ({
          savedFilterSets: [...state.savedFilterSets, newFilterSet]
        }));
      },

      loadFilterSet: (id) => {
        const filterSet = get().savedFilterSets.find(fs => fs.id === id);
        if (filterSet) {
          set({ activeFilters: filterSet.filters });
        }
      },

      deleteFilterSet: (id) => set((state) => ({
        savedFilterSets: state.savedFilterSets.filter(fs => fs.id !== id)
      })),

      updateFilterSet: (id, updates) => set((state) => ({
        savedFilterSets: state.savedFilterSets.map(fs =>
          fs.id === id
            ? { ...fs, ...updates, updatedAt: new Date() }
            : fs
        )
      })),

      addRecentRiskCategory: (category) => set((state) => ({
        recentFilters: {
          ...state.recentFilters,
          riskCategories: [
            category,
            ...state.recentFilters.riskCategories.filter(c => c !== category)
          ].slice(0, 5)
        }
      })),

      addRecentRiskOwner: (owner) => set((state) => ({
        recentFilters: {
          ...state.recentFilters,
          riskOwners: [
            owner,
            ...state.recentFilters.riskOwners.filter(o => o !== owner)
          ].slice(0, 5)
        }
      })),

      addRecentControlCategory: (category) => set((state) => ({
        recentFilters: {
          ...state.recentFilters,
          controlCategories: [
            category,
            ...state.recentFilters.controlCategories.filter(c => c !== category)
          ].slice(0, 5)
        }
      }))
    }),
    {
      name: 'filter-storage',
      partialize: (state) => ({
        savedFilterSets: state.savedFilterSets,
        recentFilters: state.recentFilters
      })
    }
  )
);