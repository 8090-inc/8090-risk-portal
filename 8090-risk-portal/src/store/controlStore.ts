import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  Control, 
  ControlFilters, 
  ControlSort, 
  ControlStatistics,
  ControlValidationError,
  CreateControlInput,
  UpdateControlInput,
  ControlAssessment
} from '../types';
import { transformExcelData, validateControl } from '../utils/dataTransformers';
import extractedData from '../data/extracted-excel-data.json';

interface ControlState {
  // Data
  controls: Control[];
  filteredControls: Control[];
  selectedControl: Control | null;
  
  // UI State
  filters: ControlFilters;
  sort: ControlSort;
  searchTerm: string;
  isLoading: boolean;
  error: Error | null;
  
  // Statistics
  statistics: ControlStatistics | null;
  
  // Actions
  loadControls: () => Promise<void>;
  selectControl: (controlId: string | null) => void;
  setFilters: (filters: ControlFilters) => void;
  setSort: (sort: ControlSort) => void;
  setSearchTerm: (term: string) => void;
  createControl: (control: CreateControlInput) => Promise<void>;
  updateControl: (control: UpdateControlInput) => Promise<void>;
  deleteControl: (controlId: string) => Promise<void>;
  assessControl: (assessment: ControlAssessment) => Promise<void>;
  refreshStatistics: () => void;
  clearError: () => void;
}

// Helper function to apply filters
const applyFilters = (controls: Control[], filters: ControlFilters, searchTerm: string): Control[] => {
  return controls.filter(control => {
    // Category filter
    if (filters.categories?.length && !filters.categories.includes(control.category)) {
      return false;
    }
    
    // Implementation status filter
    if (filters.implementationStatus?.length) {
      if (!control.implementationStatus || 
          !filters.implementationStatus.includes(control.implementationStatus)) {
        return false;
      }
    }
    
    // Effectiveness filter
    if (filters.effectiveness?.length) {
      if (!control.effectiveness || 
          !filters.effectiveness.includes(control.effectiveness)) {
        return false;
      }
    }
    
    // Compliance filters
    if (filters.hasCompliance) {
      if (filters.hasCompliance.cfrPart11 && !control.compliance.cfrPart11Annex11) {
        return false;
      }
      if (filters.hasCompliance.hipaa && !control.compliance.hipaaSafeguard) {
        return false;
      }
      if (filters.hasCompliance.gdpr && !control.compliance.gdprArticle) {
        return false;
      }
      if (filters.hasCompliance.euAiAct && !control.compliance.euAiActArticle) {
        return false;
      }
      if (filters.hasCompliance.nist && !control.compliance.nist80053) {
        return false;
      }
      if (filters.hasCompliance.soc2 && !control.compliance.soc2TSC) {
        return false;
      }
    }
    
    // Related to risk filter
    if (filters.relatedToRisk && !control.relatedRiskIds.includes(filters.relatedToRisk)) {
      return false;
    }
    
    // Search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const searchableText = [
        control.mitigationID,
        control.mitigationDescription,
        control.category,
        control.implementationNotes || '',
        Object.values(control.compliance).join(' ')
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(searchLower)) return false;
    }
    
    return true;
  });
};

// Helper function to apply sorting
const applySort = (controls: Control[], sort: ControlSort): Control[] => {
  const sorted = [...controls];
  
  sorted.sort((a, b) => {
    let comparison = 0;
    
    switch (sort.field) {
      case 'mitigationID':
        comparison = a.mitigationID.localeCompare(b.mitigationID);
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'implementationStatus':
        const statusA = a.implementationStatus || 'Not Started';
        const statusB = b.implementationStatus || 'Not Started';
        comparison = statusA.localeCompare(statusB);
        break;
      case 'effectiveness':
        const effA = a.effectiveness || 'Not Assessed';
        const effB = b.effectiveness || 'Not Assessed';
        comparison = effA.localeCompare(effB);
        break;
    }
    
    return sort.direction === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
};

// Helper function to calculate statistics
const calculateStatistics = (controls: Control[]): ControlStatistics => {
  const stats: ControlStatistics = {
    totalControls: controls.length,
    byCategory: {} as Record<string, number>,
    byImplementationStatus: {} as Record<string, number>,
    byEffectiveness: {} as Record<string, number>,
    complianceCoverage: {
      cfrPart11: 0,
      hipaa: 0,
      gdpr: 0,
      euAiAct: 0,
      nist: 0,
      soc2: 0
    }
  };
  
  controls.forEach(control => {
    // By category
    stats.byCategory[control.category] = (stats.byCategory[control.category] || 0) + 1;
    
    // By implementation status
    const status = control.implementationStatus || 'Not Started';
    stats.byImplementationStatus[status] = (stats.byImplementationStatus[status] || 0) + 1;
    
    // By effectiveness
    const effectiveness = control.effectiveness || 'Not Assessed';
    stats.byEffectiveness[effectiveness] = (stats.byEffectiveness[effectiveness] || 0) + 1;
    
    // Compliance coverage
    if (control.compliance.cfrPart11Annex11) stats.complianceCoverage.cfrPart11++;
    if (control.compliance.hipaaSafeguard) stats.complianceCoverage.hipaa++;
    if (control.compliance.gdprArticle) stats.complianceCoverage.gdpr++;
    if (control.compliance.euAiActArticle) stats.complianceCoverage.euAiAct++;
    if (control.compliance.nist80053) stats.complianceCoverage.nist++;
    if (control.compliance.soc2TSC) stats.complianceCoverage.soc2++;
  });
  
  return stats;
};

export const useControlStore = create<ControlState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        controls: [],
        filteredControls: [],
        selectedControl: null,
        filters: {},
        sort: { field: 'mitigationID', direction: 'asc' },
        searchTerm: '',
        isLoading: false,
        error: null,
        statistics: null,
        
        // Load controls from Excel data
        loadControls: async () => {
          set({ isLoading: true, error: null });
          
          try {
            // Transform Excel data to Control objects
            const { controls } = transformExcelData(extractedData as any);
            
            // Apply initial filters and sorting
            const filtered = applyFilters(controls, get().filters, get().searchTerm);
            const sorted = applySort(filtered, get().sort);
            const statistics = calculateStatistics(controls);
            
            set({ 
              controls, 
              filteredControls: sorted,
              statistics,
              isLoading: false 
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error : new Error('Failed to load controls'),
              isLoading: false 
            });
          }
        },
        
        // Select a control
        selectControl: (controlId) => {
          const control = controlId ? get().controls.find(c => c.mitigationID === controlId) : null;
          set({ selectedControl: control });
        },
        
        // Set filters
        setFilters: (filters) => {
          const filtered = applyFilters(get().controls, filters, get().searchTerm);
          const sorted = applySort(filtered, get().sort);
          set({ filters, filteredControls: sorted });
        },
        
        // Set sort
        setSort: (sort) => {
          const sorted = applySort(get().filteredControls, sort);
          set({ sort, filteredControls: sorted });
        },
        
        // Set search term
        setSearchTerm: (searchTerm) => {
          const filtered = applyFilters(get().controls, get().filters, searchTerm);
          const sorted = applySort(filtered, get().sort);
          set({ searchTerm, filteredControls: sorted });
        },
        
        // Create control
        createControl: async (controlInput) => {
          set({ isLoading: true, error: null });
          
          try {
            // Validate control
            const errors = validateControl(controlInput);
            if (errors.length > 0) {
              throw new ControlValidationError('multiple', controlInput, 'validation', errors.join(', '));
            }
            
            // Create control object
            const newControl: Control = {
              ...controlInput,
              relatedRiskIds: [],
              createdAt: new Date(),
              lastUpdated: new Date()
            };
            
            // Add to state
            const controls = [...get().controls, newControl];
            const filtered = applyFilters(controls, get().filters, get().searchTerm);
            const sorted = applySort(filtered, get().sort);
            const statistics = calculateStatistics(controls);
            
            set({ 
              controls, 
              filteredControls: sorted,
              statistics,
              isLoading: false 
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error : new Error('Failed to create control'),
              isLoading: false 
            });
          }
        },
        
        // Update control
        updateControl: async (controlUpdate) => {
          set({ isLoading: true, error: null });
          
          try {
            const controls = get().controls.map(control => 
              control.mitigationID === controlUpdate.mitigationID 
                ? { 
                    ...control, 
                    ...controlUpdate,
                    lastUpdated: new Date()
                  }
                : control
            );
            
            const filtered = applyFilters(controls, get().filters, get().searchTerm);
            const sorted = applySort(filtered, get().sort);
            const statistics = calculateStatistics(controls);
            
            set({ 
              controls, 
              filteredControls: sorted,
              statistics,
              isLoading: false 
            });
            
            // Update selected control if it's the one being updated
            if (get().selectedControl?.mitigationID === controlUpdate.mitigationID) {
              const updatedControl = controls.find(c => c.mitigationID === controlUpdate.mitigationID);
              set({ selectedControl: updatedControl || null });
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error : new Error('Failed to update control'),
              isLoading: false 
            });
          }
        },
        
        // Delete control
        deleteControl: async (controlId) => {
          set({ isLoading: true, error: null });
          
          try {
            const controls = get().controls.filter(control => control.mitigationID !== controlId);
            const filtered = applyFilters(controls, get().filters, get().searchTerm);
            const sorted = applySort(filtered, get().sort);
            const statistics = calculateStatistics(controls);
            
            set({ 
              controls, 
              filteredControls: sorted,
              statistics,
              isLoading: false 
            });
            
            // Clear selected control if it's the one being deleted
            if (get().selectedControl?.mitigationID === controlId) {
              set({ selectedControl: null });
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error : new Error('Failed to delete control'),
              isLoading: false 
            });
          }
        },
        
        // Assess control effectiveness
        assessControl: async (assessment) => {
          set({ isLoading: true, error: null });
          
          try {
            const controls = get().controls.map(control => 
              control.mitigationID === assessment.controlId 
                ? { 
                    ...control, 
                    effectiveness: assessment.effectiveness,
                    lastAssessmentDate: assessment.assessmentDate,
                    nextAssessmentDate: assessment.nextReviewDate,
                    lastUpdated: new Date()
                  }
                : control
            );
            
            const filtered = applyFilters(controls, get().filters, get().searchTerm);
            const sorted = applySort(filtered, get().sort);
            const statistics = calculateStatistics(controls);
            
            set({ 
              controls, 
              filteredControls: sorted,
              statistics,
              isLoading: false 
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error : new Error('Failed to assess control'),
              isLoading: false 
            });
          }
        },
        
        // Refresh statistics
        refreshStatistics: () => {
          const statistics = calculateStatistics(get().controls);
          set({ statistics });
        },
        
        // Clear error
        clearError: () => {
          set({ error: null });
        }
      }),
      {
        name: 'control-store',
        partialize: (state) => ({
          filters: state.filters,
          sort: state.sort
        })
      }
    )
  )
);