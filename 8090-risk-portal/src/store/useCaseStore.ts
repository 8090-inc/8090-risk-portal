import { create } from 'zustand';
import type { UseCase, UseCaseFilters, UseCaseStatistics } from '../types/useCase.types';

interface UseCaseStore {
  // State
  useCases: UseCase[];
  statistics: UseCaseStatistics | null;
  selectedUseCase: UseCase | null;
  filters: UseCaseFilters;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchUseCases: (filters?: UseCaseFilters) => Promise<void>;
  fetchUseCaseById: (id: string) => Promise<void>;
  fetchUseCase: (id: string) => Promise<void>; // Alias for fetchUseCaseById
  fetchStatistics: () => Promise<void>;
  createUseCase: (useCase: Partial<UseCase>) => Promise<UseCase>;
  updateUseCase: (id: string, updates: Partial<UseCase>) => Promise<UseCase>;
  deleteUseCase: (id: string) => Promise<void>;
  associateRisks: (id: string, riskIds: string[]) => Promise<void>;
  setSelectedUseCase: (useCase: UseCase | null) => void;
  setFilters: (filters: UseCaseFilters) => void;
  clearError: () => void;
}

const API_BASE = '/api/v1';

export const useUseCaseStore = create<UseCaseStore>((set, get) => ({
  // Initial state
  useCases: [],
  statistics: null,
  selectedUseCase: null,
  filters: {},
  loading: false,
  error: null,
  
  // Fetch all use cases with optional filters
  fetchUseCases: async (filters?: UseCaseFilters) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      const activeFilters = filters || get().filters;
      
      if (activeFilters.businessArea) queryParams.append('businessArea', activeFilters.businessArea);
      if (activeFilters.aiCategory) queryParams.append('aiCategory', activeFilters.aiCategory);
      if (activeFilters.status) queryParams.append('status', activeFilters.status);
      if (activeFilters.owner) queryParams.append('owner', activeFilters.owner);
      if (activeFilters.search) queryParams.append('search', activeFilters.search);
      
      const response = await fetch(`${API_BASE}/usecases?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch use cases');
      
      const data = await response.json();
      set({ useCases: data.data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch use cases', loading: false });
    }
  },
  
  // Fetch single use case by ID
  fetchUseCaseById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/usecases/${id}`);
      if (!response.ok) throw new Error('Failed to fetch use case');
      
      const data = await response.json();
      set({ selectedUseCase: data.data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch use case', loading: false });
    }
  },
  
  // Alias for fetchUseCaseById for backward compatibility
  fetchUseCase: async (id: string) => {
    await get().fetchUseCaseById(id);
  },
  
  // Fetch statistics
  fetchStatistics: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/usecases/statistics`);
      if (!response.ok) throw new Error('Failed to fetch statistics');
      
      const data = await response.json();
      set({ statistics: data.data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch statistics', loading: false });
    }
  },
  
  // Create new use case
  createUseCase: async (useCase: Partial<UseCase>) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/usecases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(useCase)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create use case');
      }
      
      const data = await response.json();
      
      // Update local state
      set(state => ({
        useCases: [...state.useCases, data.data],
        loading: false
      }));
      
      return data.data;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create use case', loading: false });
      throw error;
    }
  },
  
  // Update existing use case
  updateUseCase: async (id: string, updates: Partial<UseCase>) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/usecases/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update use case');
      }
      
      const data = await response.json();
      
      // Update local state
      set(state => ({
        useCases: state.useCases.map(uc => uc.id === id ? data.data : uc),
        selectedUseCase: state.selectedUseCase?.id === id ? data.data : state.selectedUseCase,
        loading: false
      }));
      
      return data.data;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update use case', loading: false });
      throw error;
    }
  },
  
  // Delete use case
  deleteUseCase: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/usecases/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete use case');
      
      // Update local state
      set(state => ({
        useCases: state.useCases.filter(uc => uc.id !== id),
        selectedUseCase: state.selectedUseCase?.id === id ? null : state.selectedUseCase,
        loading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete use case', loading: false });
      throw error;
    }
  },
  
  // Associate risks with use case
  associateRisks: async (id: string, riskIds: string[]) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/usecases/${id}/risks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riskIds })
      });
      
      if (!response.ok) throw new Error('Failed to associate risks');
      
      const data = await response.json();
      
      // Update local state
      set(state => ({
        useCases: state.useCases.map(uc => uc.id === id ? data.data : uc),
        selectedUseCase: state.selectedUseCase?.id === id ? data.data : state.selectedUseCase,
        loading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to associate risks', loading: false });
      throw error;
    }
  },
  
  // Set selected use case
  setSelectedUseCase: (useCase: UseCase | null) => {
    set({ selectedUseCase: useCase });
  },
  
  // Set filters
  setFilters: (filters: UseCaseFilters) => {
    set({ filters });
    get().fetchUseCases(filters);
  },
  
  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));