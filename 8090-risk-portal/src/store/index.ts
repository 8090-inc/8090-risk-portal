// Central export for all stores
export { useRiskStore } from './riskStore';
export { useControlStore } from './controlStore';
export { useRelationshipStore } from './relationshipStore';
export { useUIStore } from './uiStore';
export { useFilterStore } from './filterStore';
export { useAuthStore, useCurrentUser, useIsAuthenticated, useAuthLoading, useAuthError } from './authStore';
export { useUseCaseStore } from './useCaseStore';

// Import stores for initialization
import { useRiskStore } from './riskStore';
import { useControlStore } from './controlStore';
import { useRelationshipStore } from './relationshipStore';
import { useUIStore } from './uiStore';

// Store initialization helper
export const initializeStores = async () => {
  const { loadRisks } = useRiskStore.getState();
  const { loadControls } = useControlStore.getState();
  const { loadRelationships } = useRelationshipStore.getState();
  const { setGlobalLoading, showError } = useUIStore.getState();
  
  setGlobalLoading(true, 'Loading risk portal data...');
  
  try {
    // Load risks and controls in parallel
    await Promise.all([
      loadRisks(),
      loadControls()
    ]);
    
    // Load relationships after risks and controls are loaded
    const risks = useRiskStore.getState().risks;
    const controls = useControlStore.getState().controls;
    await loadRelationships(risks, controls);
    
    setGlobalLoading(false);
  } catch (error) {
    setGlobalLoading(false);
    showError(
      'Failed to load data',
      error instanceof Error ? error.message : 'An unknown error occurred'
    );
    throw error;
  }
};

// Selector hooks for common use cases
export const useRiskStatistics = () => useRiskStore(state => state.statistics);
export const useControlStatistics = () => useControlStore(state => state.statistics);
export const useCoverageAnalysis = () => useRelationshipStore(state => state.coverageAnalysis);
export const useNotifications = () => useUIStore(state => state.notifications);
export const useActiveView = () => useUIStore(state => state.activeView);

// Combined selectors
export const useDashboardData = () => {
  const riskStats = useRiskStatistics();
  const controlStats = useControlStatistics();
  const coverage = useCoverageAnalysis();
  
  return {
    totalRisks: riskStats?.totalRisks || 0,
    totalControls: controlStats?.totalControls || 0,
    criticalRisks: riskStats?.criticalRisksCount || 0,
    implementedControls: controlStats?.byImplementationStatus['Implemented'] || 0,
    coveragePercentage: coverage?.coveragePercentage || 0,
    averageRiskReduction: riskStats?.averageRiskReduction || 0
  };
};