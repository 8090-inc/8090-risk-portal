import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  Risk, 
  RiskFilters, 
  RiskSort, 
  RiskStatistics,
  CreateRiskInput,
  UpdateRiskInput
} from '../types';
import { RiskValidationError } from '../types/error.types';
import { validateRisk } from '../utils/dataTransformers';
import axios from 'axios';

interface RiskState {
  // Data
  risks: Risk[];
  filteredRisks: Risk[];
  selectedRisk: Risk | null;
  
  // UI State
  filters: RiskFilters;
  sort: RiskSort;
  searchTerm: string;
  isLoading: boolean;
  error: Error | null;
  
  // Statistics
  statistics: RiskStatistics | null;
  
  // Actions
  loadRisks: () => Promise<void>;
  selectRisk: (riskId: string | null) => void;
  setFilters: (filters: RiskFilters) => void;
  setSort: (sort: RiskSort) => void;
  setSearchTerm: (term: string) => void;
  createRisk: (risk: CreateRiskInput) => Promise<void>;
  updateRisk: (risk: UpdateRiskInput) => Promise<void>;
  deleteRisk: (riskId: string) => Promise<void>;
  updateRiskControls: (riskId: string, controlIds: string[]) => Promise<void>;
  refreshStatistics: () => void;
  clearError: () => void;
  getStatistics: () => RiskStatistics | null;
}

// Helper function to apply filters
const applyFilters = (risks: Risk[], filters: RiskFilters, searchTerm: string): Risk[] => {
  return risks.filter(risk => {
    // Category filter
    if (filters.categories?.length && !filters.categories.includes(risk.riskCategory)) {
      return false;
    }
    
    // Risk level filter
    if (filters.riskLevels?.length) {
      const hasInitialLevel = filters.riskLevels.includes(risk.initialScoring.riskLevelCategory);
      const hasResidualLevel = filters.riskLevels.includes(risk.residualScoring.riskLevelCategory);
      if (!hasInitialLevel && !hasResidualLevel) return false;
    }
    
    // Score range filters
    if (filters.minInitialScore && risk.initialScoring.riskLevel < filters.minInitialScore) {
      return false;
    }
    if (filters.maxInitialScore && risk.initialScoring.riskLevel > filters.maxInitialScore) {
      return false;
    }
    if (filters.minResidualScore && risk.residualScoring.riskLevel < filters.minResidualScore) {
      return false;
    }
    if (filters.maxResidualScore && risk.residualScoring.riskLevel > filters.maxResidualScore) {
      return false;
    }
    
    // Agreed mitigation filter
    if (filters.hasAgreedMitigation !== undefined) {
      const hasMitigation = !!risk.agreedMitigation;
      if (filters.hasAgreedMitigation !== hasMitigation) return false;
    }
    
    // Oversight ownership filter
    if (filters.oversightOwnership?.length) {
      const ownershipMatch = filters.oversightOwnership.some(filterOwner => 
        risk.proposedOversightOwnership.some(riskOwner => 
          riskOwner.toLowerCase() === filterOwner.toLowerCase()
        )
      );
      if (!ownershipMatch) return false;
    }
    
    // Search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const searchableText = [
        risk.risk,
        risk.riskDescription,
        risk.riskCategory,
        risk.agreedMitigation,
        risk.exampleMitigations,
        ...risk.proposedOversightOwnership,
        ...risk.proposedSupport,
        risk.notes
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(searchLower)) return false;
    }
    
    return true;
  });
};

// Helper function to apply sorting
const applySort = (risks: Risk[], sort: RiskSort): Risk[] => {
  const sorted = [...risks];
  
  sorted.sort((a, b) => {
    let comparison = 0;
    
    switch (sort.field) {
      case 'risk':
        comparison = a.risk.localeCompare(b.risk);
        break;
      case 'riskCategory':
        comparison = a.riskCategory.localeCompare(b.riskCategory);
        break;
      case 'initialRiskLevel':
        comparison = a.initialScoring.riskLevel - b.initialScoring.riskLevel;
        break;
      case 'residualRiskLevel':
        comparison = a.residualScoring.riskLevel - b.residualScoring.riskLevel;
        break;
      case 'riskReduction':
        comparison = a.riskReduction - b.riskReduction;
        break;
    }
    
    return sort.direction === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
};

// Helper function to calculate statistics
const calculateStatistics = (risks: Risk[]): RiskStatistics => {
  const stats: RiskStatistics = {
    totalRisks: risks.length,
    byCategory: {} as Record<string, number>,
    byInitialLevel: {} as Record<string, number>,
    byResidualLevel: {} as Record<string, number>,
    averageRiskReduction: 0,
    criticalRisksCount: 0,
    highRisksCount: 0,
    mitigatedRisksCount: 0
  };
  
  let totalReduction = 0;
  
  risks.forEach(risk => {
    // By category
    stats.byCategory[risk.riskCategory] = (stats.byCategory[risk.riskCategory] || 0) + 1;
    
    // By initial level
    stats.byInitialLevel[risk.initialScoring.riskLevelCategory] = 
      (stats.byInitialLevel[risk.initialScoring.riskLevelCategory] || 0) + 1;
    
    // By residual level
    stats.byResidualLevel[risk.residualScoring.riskLevelCategory] = 
      (stats.byResidualLevel[risk.residualScoring.riskLevelCategory] || 0) + 1;
    
    // Risk reduction
    totalReduction += risk.riskReduction;
    
    // Critical risks (residual)
    if (risk.residualScoring.riskLevelCategory === 'Critical') {
      stats.criticalRisksCount++;
    }
    
    // High risks (residual)
    if (risk.residualScoring.riskLevelCategory === 'High') {
      stats.highRisksCount++;
    }
    
    // Mitigated risks
    if (risk.agreedMitigation) {
      stats.mitigatedRisksCount++;
    }
  });
  
  stats.averageRiskReduction = risks.length > 0 ? totalReduction / risks.length : 0;
  
  return stats;
};

export const useRiskStore = create<RiskState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        risks: [],
        filteredRisks: [],
        selectedRisk: null,
        filters: {},
        sort: { field: 'residualRiskLevel', direction: 'desc' },
        searchTerm: '',
        isLoading: false,
        error: null,
        statistics: null,
        
        // Load risks from API
        loadRisks: async () => {
          set({ isLoading: true, error: null });
          
          try {
            // Fetch all risks from API (not paginated)
            const response = await axios.get('/api/v1/risks?limit=1000');
            const risks: Risk[] = response.data.data || [];
            
            // Apply initial filters and sorting
            const filtered = applyFilters(risks, get().filters, get().searchTerm);
            const sorted = applySort(filtered, get().sort);
            const statistics = calculateStatistics(risks);
            
            set({ 
              risks, 
              filteredRisks: sorted,
              statistics,
              isLoading: false 
            });
          } catch (error) {
            console.error('Failed to load risks:', error);
            set({ 
              error: error instanceof Error ? error : new Error('Failed to load risks from server'),
              isLoading: false 
            });
          }
        },
        
        // Select a risk
        selectRisk: (riskId) => {
          const risk = riskId ? get().risks.find(r => r.id === riskId) : null;
          set({ selectedRisk: risk });
        },
        
        // Set filters
        setFilters: (filters) => {
          const filtered = applyFilters(get().risks, filters, get().searchTerm);
          const sorted = applySort(filtered, get().sort);
          set({ filters, filteredRisks: sorted });
        },
        
        // Set sort
        setSort: (sort) => {
          const sorted = applySort(get().filteredRisks, sort);
          set({ sort, filteredRisks: sorted });
        },
        
        // Set search term
        setSearchTerm: (searchTerm) => {
          const filtered = applyFilters(get().risks, get().filters, searchTerm);
          const sorted = applySort(filtered, get().sort);
          set({ searchTerm, filteredRisks: sorted });
        },
        
        // Create risk
        createRisk: async (riskInput) => {
          set({ isLoading: true, error: null });
          
          try {
            // Validate risk
            const errors = validateRisk(riskInput);
            if (errors.length > 0) {
              throw new RiskValidationError('multiple', riskInput, 'validation', errors.join(', '));
            }
            
            // Send to API
            const response = await axios.post('/api/v1/risks', riskInput);
            const newRisk: Risk = response.data.data;
            
            // Add to state
            const risks = [...get().risks, newRisk];
            const filtered = applyFilters(risks, get().filters, get().searchTerm);
            const sorted = applySort(filtered, get().sort);
            const statistics = calculateStatistics(risks);
            
            set({ 
              risks, 
              filteredRisks: sorted,
              statistics,
              isLoading: false 
            });
          } catch (error) {
            console.error('Failed to create risk:', error);
            set({ 
              error: error instanceof Error ? error : new Error('Failed to create risk'),
              isLoading: false 
            });
          }
        },
        
        // Update risk
        updateRisk: async (riskUpdate) => {
          set({ isLoading: true, error: null });
          
          try {
            // Send update to API
            const response = await axios.put(`/api/v1/risks/${riskUpdate.id}`, riskUpdate);
            const updatedRisk: Risk = response.data.data;
            
            // Update in state
            const risks = get().risks.map(risk => 
              risk.id === updatedRisk.id ? updatedRisk : risk
            );
            
            const filtered = applyFilters(risks, get().filters, get().searchTerm);
            const sorted = applySort(filtered, get().sort);
            const statistics = calculateStatistics(risks);
            
            set({ 
              risks, 
              filteredRisks: sorted,
              statistics,
              isLoading: false 
            });
            
            // Update selected risk if it's the one being updated
            if (get().selectedRisk?.id === updatedRisk.id) {
              set({ selectedRisk: updatedRisk });
            }
          } catch (error) {
            console.error('Failed to update risk:', error);
            set({ 
              error: error instanceof Error ? error : new Error('Failed to update risk'),
              isLoading: false 
            });
            throw error; // Re-throw to let caller handle
          }
        },
        
        // Delete risk
        deleteRisk: async (riskId) => {
          set({ isLoading: true, error: null });
          
          try {
            // Send delete to API
            await axios.delete(`/api/v1/risks/${riskId}`);
            
            // Remove from state
            const risks = get().risks.filter(risk => risk.id !== riskId);
            const filtered = applyFilters(risks, get().filters, get().searchTerm);
            const sorted = applySort(filtered, get().sort);
            const statistics = calculateStatistics(risks);
            
            set({ 
              risks, 
              filteredRisks: sorted,
              statistics,
              isLoading: false 
            });
            
            // Clear selected risk if it's the one being deleted
            if (get().selectedRisk?.id === riskId) {
              set({ selectedRisk: null });
            }
          } catch (error) {
            console.error('Failed to delete risk:', error);
            set({ 
              error: error instanceof Error ? error : new Error('Failed to delete risk'),
              isLoading: false 
            });
            throw error; // Re-throw to let caller handle
          }
        },
        
        // Update risk controls (relationship management)
        updateRiskControls: async (riskId, controlIds) => {
          set({ isLoading: true, error: null });
          
          try {
            // Update controls for this risk
            await axios.put(`/api/v1/risks/${riskId}/controls`, {
              controlIds
            });
            
            // Update local state
            const risks = get().risks.map(risk => 
              risk.id === riskId 
                ? { ...risk, relatedControlIds: controlIds }
                : risk
            );
            
            const filtered = applyFilters(risks, get().filters, get().searchTerm);
            const sorted = applySort(filtered, get().sort);
            const statistics = calculateStatistics(risks);
            
            set({ 
              risks, 
              filteredRisks: sorted,
              statistics,
              isLoading: false 
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error : new Error('Failed to update risk controls'),
              isLoading: false 
            });
          }
        },
        
        // Refresh statistics
        refreshStatistics: () => {
          const statistics = calculateStatistics(get().risks);
          set({ statistics });
        },
        
        // Clear error
        clearError: () => {
          set({ error: null });
        },
        
        // Get statistics
        getStatistics: () => {
          return get().statistics;
        }
      }),
      {
        name: 'risk-store',
        partialize: (state) => ({
          filters: state.filters,
          sort: state.sort
        })
      }
    )
  )
);