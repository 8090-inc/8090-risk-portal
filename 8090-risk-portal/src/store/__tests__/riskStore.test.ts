import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRiskStore } from '../riskStore';

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
    risks: [
    {
      id: 'AIR-01',
      risk: 'Test Risk 1',
      riskCategory: 'AI Human Impact Risks' as const,
      riskDescription: 'Test description',
      initialScoring: {
        likelihood: 4,
        impact: 5,
        riskLevel: 20,
        riskLevelCategory: 'Critical'
      },
      residualScoring: {
        likelihood: 2,
        impact: 3,
        riskLevel: 6,
        riskLevelCategory: 'Medium'
      },
      relatedControlIds: ['CTRL-01', 'CTRL-02'],
      riskReduction: 14,
      riskReductionPercentage: 70,
      mitigationEffectiveness: 'High',
      proposedOversightOwnership: ['Test Owner'],
      proposedSupport: ['Test Support'],
      agreedMitigation: 'Test mitigation',
      notes: 'Test notes',
      exampleMitigations: '',
      createdAt: new Date('2024-01-01'),
      lastUpdated: new Date('2024-01-15')
    },
    {
      id: 'AIR-02',
      risk: 'Test Risk 2',
      riskCategory: 'Security and Data Risks' as const,
      riskDescription: 'Test description 2',
      initialScoring: {
        likelihood: 3,
        impact: 3,
        riskLevel: 9,
        riskLevelCategory: 'Medium'
      },
      residualScoring: {
        likelihood: 2,
        impact: 2,
        riskLevel: 4,
        riskLevelCategory: 'Low'
      },
      relatedControlIds: ['CTRL-03'],
      riskReduction: 5,
      riskReductionPercentage: 55,
      mitigationEffectiveness: 'Medium',
      proposedOversightOwnership: ['Test Owner 2'],
      proposedSupport: ['Test Support 2'],
      agreedMitigation: 'Test mitigation 2',
      notes: 'Test notes 2',
      exampleMitigations: '',
      createdAt: new Date('2024-01-01'),
      lastUpdated: new Date('2024-01-10')
    }
    ],
    controls: []
  })),
  validateRisk: vi.fn(() => [])
}));

describe('Risk Store', () => {
  beforeEach(() => {
    // Reset store state
    useRiskStore.setState({
      risks: [],
      isLoading: false,
      error: null
    });
  });

  describe('loadRisks', () => {
    it('should load risks successfully', async () => {
      const { loadRisks } = useRiskStore.getState();
      
      await loadRisks();
      
      const state = useRiskStore.getState();
      expect(state.risks).toHaveLength(2);
      expect(state.risks[0].id).toBe('AIR-01');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle loading state transitions', async () => {
      const { loadRisks } = useRiskStore.getState();
      
      // Initial state should not be loading
      expect(useRiskStore.getState().isLoading).toBe(false);
      
      // Call and await loadRisks
      await loadRisks();
      
      // After completion, loading should be false
      const finalState = useRiskStore.getState();
      expect(finalState.isLoading).toBe(false);
      expect(finalState.risks).toHaveLength(2);
    });
  });

  describe('selectRisk', () => {
    beforeEach(async () => {
      const { loadRisks } = useRiskStore.getState();
      await loadRisks();
    });

    it('should select risk by id', () => {
      const { selectRisk } = useRiskStore.getState();
      
      selectRisk('AIR-01');
      
      const state = useRiskStore.getState();
      expect(state.selectedRisk).toBeDefined();
      expect(state.selectedRisk?.id).toBe('AIR-01');
      expect(state.selectedRisk?.risk).toBe('Test Risk 1');
    });

    it('should clear selection when null is passed', () => {
      const { selectRisk } = useRiskStore.getState();
      
      selectRisk('AIR-01');
      selectRisk(null);
      
      const state = useRiskStore.getState();
      expect(state.selectedRisk).toBeNull();
    });
  });

  describe('getStatistics', () => {
    beforeEach(async () => {
      const { loadRisks } = useRiskStore.getState();
      await loadRisks();
    });

    it('should calculate statistics correctly', () => {
      const state = useRiskStore.getState();
      const stats = state.statistics;
      
      expect(stats).toBeDefined();
      expect(stats?.totalRisks).toBe(2);
      expect(stats?.byCategory['AI Human Impact Risks']).toBe(1);
      expect(stats?.byCategory['Security and Data Risks']).toBe(1);
      expect(stats?.byResidualLevel['Medium']).toBe(1);
      expect(stats?.byResidualLevel['Low']).toBe(1);
      expect(stats?.criticalRisksCount).toBe(0);
      expect(stats?.highRisksCount).toBe(0);
    });
  });

  describe('createRisk', () => {
    it('should create a new risk', async () => {
      const { createRisk, loadRisks } = useRiskStore.getState();
      await loadRisks();
      
      const newRisk = {
        risk: 'New Test Risk',
        riskCategory: 'AI Human Impact Risks' as const,
        riskDescription: 'New test description',
        initialScoring: {
          likelihood: 5 as const,
          impact: 5 as const,
          riskLevel: 25,
          riskLevelCategory: 'Critical' as const
        },
        residualScoring: {
          likelihood: 3 as const,
          impact: 3 as const,
          riskLevel: 9,
          riskLevelCategory: 'Medium' as const
        },
        proposedOversightOwnership: ['New Owner'],
        proposedSupport: ['New Support'],
        agreedMitigation: 'New mitigation',
        notes: 'New notes',
        exampleMitigations: '',
        riskReduction: 16,
        riskReductionPercentage: 64,
        relatedControlIds: []
      };
      
      await createRisk(newRisk);
      
      const state = useRiskStore.getState();
      expect(state.risks).toHaveLength(3);
      expect(state.risks.find(r => r.risk === 'New Test Risk')).toBeDefined();
    });
  });

  describe('updateRisk', () => {
    beforeEach(async () => {
      const { loadRisks } = useRiskStore.getState();
      await loadRisks();
    });

    it('should update an existing risk', async () => {
      const { updateRisk } = useRiskStore.getState();
      
      await updateRisk({
        id: 'AIR-01',
        risk: 'Updated Risk Name',
        notes: 'Updated notes'
      });
      
      const state = useRiskStore.getState();
      const updatedRisk = state.risks.find(r => r.id === 'AIR-01');
      expect(updatedRisk?.risk).toBe('Updated Risk Name');
      expect(updatedRisk?.notes).toBe('Updated notes');
    });

    it('should not update non-existent risk', async () => {
      const { updateRisk } = useRiskStore.getState();
      const initialState = useRiskStore.getState().risks;
      
      await updateRisk({
        id: 'AIR-999',
        risk: 'Should not update'
      });
      
      const state = useRiskStore.getState();
      expect(state.risks).toEqual(initialState);
    });
  });

  describe('deleteRisk', () => {
    beforeEach(async () => {
      const { loadRisks } = useRiskStore.getState();
      await loadRisks();
    });

    it('should delete a risk', async () => {
      const { deleteRisk } = useRiskStore.getState();
      
      await deleteRisk('AIR-01');
      
      const state = useRiskStore.getState();
      expect(state.risks).toHaveLength(1);
      expect(state.risks.find(r => r.id === 'AIR-01')).toBeUndefined();
    });
  });
});