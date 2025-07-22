import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  RiskControlRelationship,
  RiskRelationship,
  ControlRelationship,
  CoverageAnalysis,
  ImpactAnalysis,
  NetworkGraph,
  RelationshipValidation,
  Risk,
  Control
} from '../types';

interface RelationshipState {
  // Data
  riskControlRelationships: RiskControlRelationship[];
  riskRelationships: RiskRelationship[];
  controlRelationships: ControlRelationship[];
  
  // Analysis
  coverageAnalysis: CoverageAnalysis | null;
  impactAnalyses: Map<string, ImpactAnalysis>;
  networkGraph: NetworkGraph | null;
  
  // UI State
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  loadRelationships: (risks: Risk[], controls: Control[]) => Promise<void>;
  createRiskControlRelationship: (relationship: RiskControlRelationship) => Promise<void>;
  updateRiskControlRelationship: (
    riskId: string, 
    controlId: string, 
    updates: Partial<RiskControlRelationship>
  ) => Promise<void>;
  deleteRiskControlRelationship: (riskId: string, controlId: string) => Promise<void>;
  createRiskRelationship: (relationship: RiskRelationship) => Promise<void>;
  createControlRelationship: (relationship: ControlRelationship) => Promise<void>;
  analyzeCoverage: (risks: Risk[], controls: Control[]) => void;
  analyzeImpact: (controlId: string, risks: Risk[]) => void;
  generateNetworkGraph: (risks: Risk[], controls: Control[]) => void;
  validateRelationships: () => RelationshipValidation;
  clearError: () => void;
}

// Helper to create risk-control relationships from mapping
const createRiskControlRelationships = (
  riskToControls: Map<string, string[]>
): RiskControlRelationship[] => {
  const relationships: RiskControlRelationship[] = [];
  
  riskToControls.forEach((controlIds, riskId) => {
    controlIds.forEach(controlId => {
      relationships.push({
        riskId,
        controlId,
        relationshipType: 'mitigates',
        effectiveness: 'Unknown', // Default until assessed
        establishedDate: new Date()
      });
    });
  });
  
  return relationships;
};

// Helper to analyze coverage
const analyzeCoverage = (
  relationships: RiskControlRelationship[],
  risks: Risk[],
  controls: Control[]
): CoverageAnalysis => {
  const risksWithControls = new Set(relationships.map(r => r.riskId));
  const controlsWithRisks = new Set(relationships.map(r => r.controlId));
  
  const risksWithoutControls = risks.filter(r => !risksWithControls.has(r.id));
  const controlsWithoutRisks = controls.filter(c => !controlsWithRisks.has(c.mitigationID));
  
  const gaps: CoverageAnalysis['gaps'] = [];
  
  // Identify uncovered critical/high risks
  risksWithoutControls.forEach(risk => {
    if (risk.residualScoring.riskLevelCategory === 'Critical' || 
        risk.residualScoring.riskLevelCategory === 'High') {
      gaps.push({
        type: 'uncovered-risk',
        riskId: risk.id,
        severity: risk.residualScoring.riskLevelCategory === 'Critical' ? 'High' : 'Medium',
        recommendation: `Assign controls to mitigate ${risk.risk}`
      });
    }
  });
  
  // Identify ineffective controls
  relationships.forEach(rel => {
    if (rel.effectiveness === 'Low') {
      gaps.push({
        type: 'ineffective-control',
        riskId: rel.riskId,
        controlId: rel.controlId,
        severity: 'Medium',
        recommendation: `Review and improve effectiveness of control ${rel.controlId}`
      });
    }
  });
  
  // Calculate average controls per risk
  const controlsPerRisk = risks.map(risk => 
    relationships.filter(r => r.riskId === risk.id).length
  );
  const avgControlsPerRisk = controlsPerRisk.reduce((a, b) => a + b, 0) / risks.length;
  
  return {
    totalRisks: risks.length,
    totalControls: controls.length,
    risksWithControls: risksWithControls.size,
    risksWithoutControls: risksWithoutControls.length,
    controlsWithoutRisks: controlsWithoutRisks.length,
    averageControlsPerRisk: avgControlsPerRisk,
    coveragePercentage: (risksWithControls.size / risks.length) * 100,
    gaps
  };
};

export const useRelationshipStore = create<RelationshipState>()(
  devtools(
    (set, get) => ({
      // Initial state
      riskControlRelationships: [],
      riskRelationships: [],
      controlRelationships: [],
      coverageAnalysis: null,
      impactAnalyses: new Map(),
      networkGraph: null,
      isLoading: false,
      error: null,
      
      // Load relationships
      loadRelationships: async (risks, controls) => {
        set({ isLoading: true, error: null });
        
        try {
          // Extract relationships from risks and controls data
          const riskToControls = new Map<string, string[]>();
          
          // Build mapping from risks' relatedControlIds
          risks.forEach(risk => {
            if (risk.relatedControlIds && risk.relatedControlIds.length > 0) {
              riskToControls.set(risk.id, risk.relatedControlIds);
            }
          });
          
          // Create risk-control relationships
          const riskControlRelationships = createRiskControlRelationships(
            riskToControls
          );
          
          // Analyze coverage
          const coverageAnalysis = analyzeCoverage(riskControlRelationships, risks, controls);
          
          set({ 
            riskControlRelationships,
            coverageAnalysis,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error : new Error('Failed to load relationships'),
            isLoading: false 
          });
        }
      },
      
      // Create risk-control relationship
      createRiskControlRelationship: async (relationship) => {
        set({ isLoading: true, error: null });
        
        try {
          const relationships = [...get().riskControlRelationships, relationship];
          set({ 
            riskControlRelationships: relationships,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error : new Error('Failed to create relationship'),
            isLoading: false 
          });
        }
      },
      
      // Update risk-control relationship
      updateRiskControlRelationship: async (riskId, controlId, updates) => {
        set({ isLoading: true, error: null });
        
        try {
          const relationships = get().riskControlRelationships.map(rel => 
            rel.riskId === riskId && rel.controlId === controlId
              ? { ...rel, ...updates, lastReviewedDate: new Date() }
              : rel
          );
          
          set({ 
            riskControlRelationships: relationships,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error : new Error('Failed to update relationship'),
            isLoading: false 
          });
        }
      },
      
      // Delete risk-control relationship
      deleteRiskControlRelationship: async (riskId, controlId) => {
        set({ isLoading: true, error: null });
        
        try {
          const relationships = get().riskControlRelationships.filter(
            rel => !(rel.riskId === riskId && rel.controlId === controlId)
          );
          
          set({ 
            riskControlRelationships: relationships,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error : new Error('Failed to delete relationship'),
            isLoading: false 
          });
        }
      },
      
      // Create risk-risk relationship
      createRiskRelationship: async (relationship) => {
        set({ isLoading: true, error: null });
        
        try {
          const relationships = [...get().riskRelationships, relationship];
          set({ 
            riskRelationships: relationships,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error : new Error('Failed to create risk relationship'),
            isLoading: false 
          });
        }
      },
      
      // Create control-control relationship
      createControlRelationship: async (relationship) => {
        set({ isLoading: true, error: null });
        
        try {
          const relationships = [...get().controlRelationships, relationship];
          set({ 
            controlRelationships: relationships,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error : new Error('Failed to create control relationship'),
            isLoading: false 
          });
        }
      },
      
      // Analyze coverage
      analyzeCoverage: (risks, controls) => {
        const analysis = analyzeCoverage(get().riskControlRelationships, risks, controls);
        set({ coverageAnalysis: analysis });
      },
      
      // Analyze impact of a control
      analyzeImpact: (controlId, risks) => {
        const relationships = get().riskControlRelationships.filter(
          rel => rel.controlId === controlId
        );
        
        const impactedRisks = relationships.map(rel => {
          const risk = risks.find(r => r.id === rel.riskId);
          if (!risk) return null;
          
          // Estimate impact based on relationship effectiveness
          let reduction = 0;
          switch (rel.effectiveness) {
            case 'High': reduction = 0.7; break;
            case 'Medium': reduction = 0.4; break;
            case 'Low': reduction = 0.2; break;
            default: reduction = 0;
          }
          
          const projectedScore = Math.max(
            1,
            Math.round(risk.residualScoring.riskLevel * (1 - reduction))
          );
          
          return {
            riskId: risk.id,
            riskName: risk.risk,
            currentLevel: risk.residualScoring.riskLevelCategory,
            projectedLevel: projectedScore <= 5 ? 'Low' : 
                           projectedScore <= 10 ? 'Medium' :
                           projectedScore <= 15 ? 'High' : 'Critical',
            reduction: risk.residualScoring.riskLevel - projectedScore
          };
        }).filter(Boolean) as ImpactAnalysis['impactedRisks'];
        
        const overallImpact = impactedRisks.length === 0 ? 'Low' :
                             impactedRisks.some(r => r.reduction >= 5) ? 'High' :
                             impactedRisks.some(r => r.reduction >= 3) ? 'Medium' : 'Low';
        
        const analysis: ImpactAnalysis = {
          controlId,
          impactedRisks,
          overallImpact
        };
        
        const analyses = new Map(get().impactAnalyses);
        analyses.set(controlId, analysis);
        set({ impactAnalyses: analyses });
      },
      
      // Generate network graph
      generateNetworkGraph: (risks, controls) => {
        const nodes: NetworkGraph['nodes'] = [];
        const edges: NetworkGraph['edges'] = [];
        
        // Add risk nodes
        risks.forEach(risk => {
          nodes.push({
            id: risk.id,
            type: 'risk',
            label: risk.risk,
            category: risk.riskCategory,
            level: risk.residualScoring.riskLevelCategory
          });
        });
        
        // Add control nodes
        controls.forEach(control => {
          nodes.push({
            id: control.mitigationID,
            type: 'control',
            label: control.mitigationID,
            category: control.category,
            status: control.implementationStatus
          });
        });
        
        // Add risk-control edges
        get().riskControlRelationships.forEach((rel, index) => {
          edges.push({
            id: `rc_${index}`,
            source: rel.riskId,
            target: rel.controlId,
            type: 'risk-control',
            label: rel.effectiveness,
            strength: rel.effectiveness === 'High' ? 1 :
                     rel.effectiveness === 'Medium' ? 0.6 :
                     rel.effectiveness === 'Low' ? 0.3 : 0.1
          });
        });
        
        // Add risk-risk edges
        get().riskRelationships.forEach((rel, index) => {
          edges.push({
            id: `rr_${index}`,
            source: rel.sourceRiskId,
            target: rel.targetRiskId,
            type: 'risk-risk',
            label: rel.relationshipType,
            strength: rel.strength === 'Strong' ? 1 :
                     rel.strength === 'Medium' ? 0.6 : 0.3,
            bidirectional: rel.bidirectional
          });
        });
        
        set({ 
          networkGraph: {
            nodes,
            edges,
            layout: 'force'
          }
        });
      },
      
      // Validate relationships
      validateRelationships: () => {
        const errors: RelationshipValidation['errors'] = [];
        const warnings: RelationshipValidation['warnings'] = [];
        
        // Check for circular dependencies in risk relationships
        const riskRels = get().riskRelationships;
        riskRels.forEach(rel => {
          const reverse = riskRels.find(
            r => r.sourceRiskId === rel.targetRiskId && 
                 r.targetRiskId === rel.sourceRiskId
          );
          if (reverse && rel.relationshipType === 'depends-on') {
            errors.push({
              type: 'circular-dependency',
              sourceId: rel.sourceRiskId,
              targetId: rel.targetRiskId,
              message: 'Circular dependency detected between risks'
            });
          }
        });
        
        // Check for weak coverage
        const riskControlRels = get().riskControlRelationships;
        const riskCoverage = new Map<string, number>();
        
        riskControlRels.forEach(rel => {
          riskCoverage.set(rel.riskId, (riskCoverage.get(rel.riskId) || 0) + 1);
        });
        
        riskCoverage.forEach((count, riskId) => {
          if (count === 1) {
            warnings.push({
              type: 'weak-coverage',
              entityId: riskId,
              message: 'Risk has only one control',
              suggestion: 'Consider adding additional controls for redundancy'
            });
          }
        });
        
        return {
          isValid: errors.length === 0,
          errors,
          warnings
        };
      },
      
      // Clear error
      clearError: () => {
        set({ error: null });
      }
    })
  )
);