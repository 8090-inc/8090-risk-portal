import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useControlStore } from '../controlStore';

// Mock the extracted Excel data
vi.mock('../../data/extracted-excel-data.json', () => ({
  default: {
    riskMap: [],
    controlCatalog: []
  }
}));

// Mock the data transformers
vi.mock('../../utils/dataTransformers', () => ({
  transformExcelData: vi.fn(() => ({
    risks: [],
    controls: [
    {
      mitigationID: 'CTRL-01',
      mitigationDescription: 'Test Control 1',
      category: 'Technical Controls',
      implementationStatus: 'Implemented',
      effectiveness: 'High',
      relatedRiskIds: ['AIR-01', 'AIR-02'],
      compliance: {
        cfrPart11Annex11: '11.10',
        hipaaSafeguard: 'Technical',
        gdprArticle: 'Article 32',
        euAiActArticle: 'Article 15',
        nist80053: 'AC-2',
        soc2TSC: 'CC6.1'
      },
      complianceScore: 0.85,
      createdAt: new Date('2024-01-01'),
      lastUpdated: new Date('2024-01-15')
    },
    {
      mitigationID: 'CTRL-02',
      mitigationDescription: 'Test Control 2',
      category: 'Administrative Controls',
      implementationStatus: 'In Progress',
      effectiveness: 'Medium',
      relatedRiskIds: ['AIR-03'],
      compliance: {
        cfrPart11Annex11: '',
        hipaaSafeguard: 'Administrative',
        gdprArticle: 'Article 30',
        euAiActArticle: '',
        nist80053: 'AU-3',
        soc2TSC: 'CC7.1'
      },
      complianceScore: 0.60,
      createdAt: new Date('2024-01-05'),
      lastUpdated: new Date('2024-01-20')
    }
    ]
  })),
  validateControl: vi.fn(() => [])
}));

describe('Control Store', () => {
  beforeEach(() => {
    // Reset store state
    useControlStore.setState({
      controls: [],
      isLoading: false,
      error: null,
      lastFetch: null,
      statistics: null
    });
  });

  describe('loadControls', () => {
    it('should load controls successfully', async () => {
      const { loadControls } = useControlStore.getState();
      
      await loadControls();
      
      const state = useControlStore.getState();
      expect(state.controls).toHaveLength(2);
      expect(state.controls[0].mitigationID).toBe('CTRL-01');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should calculate statistics after loading', async () => {
      const { loadControls } = useControlStore.getState();
      
      await loadControls();
      
      const state = useControlStore.getState();
      expect(state.statistics).toBeDefined();
      expect(state.statistics?.totalControls).toBe(2);
      expect(state.statistics?.byCategory['Technical Controls']).toBe(1);
      expect(state.statistics?.byCategory['Administrative Controls']).toBe(1);
      expect(state.statistics?.byImplementationStatus['Implemented']).toBe(1);
      expect(state.statistics?.byImplementationStatus['In Progress']).toBe(1);
    });
  });

  describe('selectControl', () => {
    beforeEach(async () => {
      const { loadControls } = useControlStore.getState();
      await loadControls();
    });

    it('should select control by id', () => {
      const { selectControl } = useControlStore.getState();
      
      selectControl('CTRL-01');
      
      const state = useControlStore.getState();
      expect(state.selectedControl).toBeDefined();
      expect(state.selectedControl?.mitigationID).toBe('CTRL-01');
      expect(state.selectedControl?.mitigationDescription).toBe('Test Control 1');
    });

    it('should clear selection when null is passed', () => {
      const { selectControl } = useControlStore.getState();
      
      selectControl('CTRL-01');
      selectControl(null);
      
      const state = useControlStore.getState();
      expect(state.selectedControl).toBeNull();
    });
  });

  describe('filtering by category', () => {
    beforeEach(async () => {
      const { loadControls } = useControlStore.getState();
      await loadControls();
    });

    it('should filter controls by category', () => {
      const { setFilters } = useControlStore.getState();
      
      setFilters({ categories: ['Technical Controls'] });
      
      const state = useControlStore.getState();
      expect(state.filteredControls).toHaveLength(1);
      expect(state.filteredControls[0].mitigationID).toBe('CTRL-01');
    });

    it('should return empty array for non-existent category', () => {
      const { setFilters } = useControlStore.getState();
      
      setFilters({ categories: ['Non-existent Category'] });
      
      const state = useControlStore.getState();
      expect(state.filteredControls).toHaveLength(0);
    });
  });

  describe('filtering by status', () => {
    beforeEach(async () => {
      const { loadControls } = useControlStore.getState();
      await loadControls();
    });

    it('should filter controls by status', () => {
      const { setFilters } = useControlStore.getState();
      
      setFilters({ implementationStatus: ['Implemented'] });
      
      const state = useControlStore.getState();
      expect(state.filteredControls).toHaveLength(1);
      expect(state.filteredControls[0].mitigationID).toBe('CTRL-01');
    });
  });

  describe('filtering controls for risk', () => {
    beforeEach(async () => {
      const { loadControls } = useControlStore.getState();
      await loadControls();
    });

    it('should filter controls for a specific risk', () => {
      const state = useControlStore.getState();
      
      // Filter controls that have AIR-01 in their relatedRiskIds
      const controlsForRisk = state.controls.filter(c => 
        c.relatedRiskIds.includes('AIR-01')
      );
      
      expect(controlsForRisk).toHaveLength(1);
      expect(controlsForRisk[0].mitigationID).toBe('CTRL-01');
    });

    it('should return empty array for risk with no controls', () => {
      const state = useControlStore.getState();
      
      const controlsForRisk = state.controls.filter(c => 
        c.relatedRiskIds.includes('AIR-999')
      );
      
      expect(controlsForRisk).toHaveLength(0);
    });
  });

  describe('updateControl', () => {
    beforeEach(async () => {
      const { loadControls } = useControlStore.getState();
      await loadControls();
    });

    it('should update an existing control', async () => {
      const { updateControl } = useControlStore.getState();
      
      await updateControl({
        mitigationID: 'CTRL-01',
        implementationStatus: 'Planned',
        effectiveness: 'Low'
      });
      
      const state = useControlStore.getState();
      const updatedControl = state.controls.find(c => c.mitigationID === 'CTRL-01');
      expect(updatedControl?.implementationStatus).toBe('Planned');
      expect(updatedControl?.effectiveness).toBe('Low');
    });

    it('should recalculate statistics after update', async () => {
      const { updateControl } = useControlStore.getState();
      
      await updateControl({
        mitigationID: 'CTRL-01',
        implementationStatus: 'Not Implemented'
      });
      
      const state = useControlStore.getState();
      expect(state.statistics?.byImplementationStatus['Implemented']).toBe(undefined);
      expect(state.statistics?.byImplementationStatus['Not Implemented']).toBe(1);
    });
  });

  describe('compliance score calculations', () => {
    beforeEach(async () => {
      const { loadControls } = useControlStore.getState();
      await loadControls();
    });

    it('should have correct compliance coverage', () => {
      const state = useControlStore.getState();
      
      // CTRL-01 has most compliance mappings, CTRL-02 has fewer
      expect(state.statistics?.complianceCoverage.cfrPart11).toBe(1); // Only CTRL-01
      expect(state.statistics?.complianceCoverage.hipaa).toBe(2); // Both controls
      expect(state.statistics?.complianceCoverage.gdpr).toBe(2); // Both controls
      expect(state.statistics?.complianceCoverage.euAiAct).toBe(1); // Only CTRL-01
      expect(state.statistics?.complianceCoverage.nist).toBe(2); // Both controls
      expect(state.statistics?.complianceCoverage.soc2).toBe(2); // Both controls
    });

    it('should count controls by effectiveness', () => {
      const state = useControlStore.getState();
      
      expect(state.statistics?.byEffectiveness['High']).toBe(1);
      expect(state.statistics?.byEffectiveness['Medium']).toBe(1);
      // Low effectiveness is not present in test data, so it won't be in the stats
      expect(state.statistics?.byEffectiveness['Low']).toBeUndefined();
    });
  });
});