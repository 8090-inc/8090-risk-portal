import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useRiskStore } from '../riskStore';
import { useControlStore } from '../controlStore';
import { useRelationshipStore } from '../relationshipStore';
import { useUIStore } from '../uiStore';
import { initializeStores } from '../index';

// Mock the extracted data
vi.mock('../../data/extracted-excel-data.json', () => ({
  default: {
    riskMap: [
      {
        riskCategory: 'Behavioral Risks',
        risk: 'Test Risk',
        riskDescription: 'Test Description',
        initialLikelihood: 4,
        initialImpact: 5,
        initialRiskLevel: 20,
        riskLevelCategory: 'Critical',
        exampleMitigations: 'Test Mitigations',
        agreedMitigation: 'Test Agreed Mitigation',
        proposedOversightOwnership: 'Test Owner',
        proposedSupport: 'Test Support',
        notes: 'Test Notes',
        residualLikelihood: 2,
        residualImpact: 3,
        residualRiskLevel: 6
      }
    ],
    controlsMapping: [
      {
        mitigationID: 'TEST-01',
        mitigationDescription: 'Test Control',
        category: 'Accuracy & Judgment',
        cfrPart11Annex11: 'Test CFR',
        hipaaSafeguard: 'Test HIPAA',
        gdprArticle: 'Test GDPR',
        euAiActArticle: 'Test EU AI',
        nist80053: 'Test NIST',
        soc2TSC: 'Test SOC2'
      }
    ],
    riskCategories: ['Behavioral Risks'],
    scoringMethodology: 'Test Methodology'
  }
}));

describe('State Management Stores', () => {
  beforeEach(() => {
    // Reset stores
    useRiskStore.setState({
      risks: [],
      filteredRisks: [],
      selectedRisk: null,
      filters: {},
      sort: { field: 'residualRiskLevel', direction: 'desc' },
      searchTerm: '',
      isLoading: false,
      error: null,
      statistics: null
    });
    
    useControlStore.setState({
      controls: [],
      filteredControls: [],
      selectedControl: null,
      filters: {},
      sort: { field: 'mitigationID', direction: 'asc' },
      searchTerm: '',
      isLoading: false,
      error: null,
      statistics: null
    });
    
    useUIStore.setState({
      notifications: [],
      globalLoading: false,
      loadingMessage: ''
    });
  });
  
  describe('RiskStore', () => {
    it('should load risks from Excel data', async () => {
      const { loadRisks, risks } = useRiskStore.getState();
      
      await act(async () => {
        await loadRisks();
      });
      
      const state = useRiskStore.getState();
      expect(state.risks).toHaveLength(1);
      expect(state.risks[0].risk).toBe('Test Risk');
      expect(state.risks[0].riskReduction).toBe(14); // 20 - 6
      expect(state.risks[0].mitigationEffectiveness).toBe('High');
    });
    
    it('should filter risks correctly', async () => {
      const { loadRisks, setFilters } = useRiskStore.getState();
      
      await act(async () => {
        await loadRisks();
      });
      
      act(() => {
        setFilters({ riskLevels: ['Critical'] });
      });
      
      const state = useRiskStore.getState();
      expect(state.filteredRisks).toHaveLength(1); // Initial level is Critical
      
      act(() => {
        setFilters({ riskLevels: ['Medium'] });
      });
      
      const state2 = useRiskStore.getState();
      expect(state2.filteredRisks).toHaveLength(1);
    });
    
    it('should search risks correctly', async () => {
      const { loadRisks, setSearchTerm } = useRiskStore.getState();
      
      await act(async () => {
        await loadRisks();
      });
      
      act(() => {
        setSearchTerm('Test Risk');
      });
      
      const state = useRiskStore.getState();
      expect(state.filteredRisks).toHaveLength(1);
      
      act(() => {
        setSearchTerm('Nonexistent');
      });
      
      const state2 = useRiskStore.getState();
      expect(state2.filteredRisks).toHaveLength(0);
    });
    
    it('should calculate statistics correctly', async () => {
      const { loadRisks } = useRiskStore.getState();
      
      await act(async () => {
        await loadRisks();
      });
      
      const state = useRiskStore.getState();
      expect(state.statistics).toMatchObject({
        totalRisks: 1,
        criticalRisksCount: 0, // Residual is Medium
        mitigatedRisksCount: 1,
        averageRiskReduction: 14
      });
    });
  });
  
  describe('ControlStore', () => {
    it('should load controls from Excel data', async () => {
      const { loadControls } = useControlStore.getState();
      
      await act(async () => {
        await loadControls();
      });
      
      const state = useControlStore.getState();
      expect(state.controls).toHaveLength(1);
      expect(state.controls[0].mitigationID).toBe('TEST-01');
      expect(state.controls[0].category).toBe('Accuracy & Judgment');
    });
    
    it('should update control implementation status', async () => {
      const { loadControls, updateControl } = useControlStore.getState();
      
      await act(async () => {
        await loadControls();
      });
      
      await act(async () => {
        await updateControl({
          mitigationID: 'TEST-01',
          implementationStatus: 'Implemented'
        });
      });
      
      const state = useControlStore.getState();
      expect(state.controls[0].implementationStatus).toBe('Implemented');
    });
  });
  
  describe('RelationshipStore', () => {
    it('should build relationships between risks and controls', async () => {
      const { loadRisks } = useRiskStore.getState();
      const { loadControls } = useControlStore.getState();
      const { loadRelationships } = useRelationshipStore.getState();
      
      await act(async () => {
        await loadRisks();
        await loadControls();
      });
      
      const risks = useRiskStore.getState().risks;
      const controls = useControlStore.getState().controls;
      
      await act(async () => {
        await loadRelationships(risks, controls);
      });
      
      const state = useRelationshipStore.getState();
      expect(state.coverageAnalysis).toBeDefined();
      expect(state.coverageAnalysis?.totalRisks).toBe(1);
      expect(state.coverageAnalysis?.totalControls).toBe(1);
    });
  });
  
  describe('UIStore', () => {
    it('should manage notifications', () => {
      const { addNotification, removeNotification, notifications } = useUIStore.getState();
      
      act(() => {
        addNotification({
          type: 'error',
          title: 'Test Error',
          message: 'Test error message',
          dismissible: true
        });
      });
      
      const state = useUIStore.getState();
      expect(state.notifications).toHaveLength(1);
      expect(state.notifications[0].title).toBe('Test Error');
      
      const notifId = state.notifications[0].id;
      
      act(() => {
        removeNotification(notifId);
      });
      
      const state2 = useUIStore.getState();
      expect(state2.notifications).toHaveLength(0);
    });
    
    it('should toggle sidebar', () => {
      const { toggleSidebar } = useUIStore.getState();
      
      expect(useUIStore.getState().sidebarCollapsed).toBe(false);
      
      act(() => {
        toggleSidebar();
      });
      
      expect(useUIStore.getState().sidebarCollapsed).toBe(true);
    });
    
    it('should manage modals', () => {
      const { openModal, closeModal, closeAllModals } = useUIStore.getState();
      
      act(() => {
        openModal('createRisk');
        openModal('editControl');
      });
      
      const state = useUIStore.getState();
      expect(state.modals.createRisk).toBe(true);
      expect(state.modals.editControl).toBe(true);
      
      act(() => {
        closeModal('createRisk');
      });
      
      const state2 = useUIStore.getState();
      expect(state2.modals.createRisk).toBe(false);
      expect(state2.modals.editControl).toBe(true);
      
      act(() => {
        closeAllModals();
      });
      
      const state3 = useUIStore.getState();
      expect(state3.modals.createRisk).toBe(false);
      expect(state3.modals.editControl).toBe(false);
    });
  });
  
  describe('Store Initialization', () => {
    it('should initialize all stores', async () => {
      await act(async () => {
        await initializeStores();
      });
      
      const riskState = useRiskStore.getState();
      const controlState = useControlStore.getState();
      const relationshipState = useRelationshipStore.getState();
      
      expect(riskState.risks).toHaveLength(1);
      expect(controlState.controls).toHaveLength(1);
      expect(relationshipState.coverageAnalysis).toBeDefined();
    });
  });
});