// Relationship types for connecting risks and controls

import { Risk, RiskCategory, RiskLevelCategory } from './risk.types';
import { Control, ControlCategory } from './control.types';

// Risk-Control relationship
export interface RiskControlRelationship {
  riskId: string;
  controlId: string;
  relationshipType: 'mitigates' | 'monitors' | 'prevents';
  effectiveness: 'High' | 'Medium' | 'Low' | 'Unknown';
  notes?: string;
  establishedDate: Date;
  lastReviewedDate?: Date;
}

// Risk-Risk relationship (for dependent or related risks)
export interface RiskRelationship {
  sourceRiskId: string;
  targetRiskId: string;
  relationshipType: 'causes' | 'increases' | 'depends-on' | 'related-to';
  strength: 'Strong' | 'Medium' | 'Weak';
  bidirectional: boolean;
  notes?: string;
}

// Control-Control relationship (for dependent controls)
export interface ControlRelationship {
  sourceControlId: string;
  targetControlId: string;
  relationshipType: 'depends-on' | 'enhances' | 'conflicts-with' | 'replaces';
  notes?: string;
}

// Aggregated view of relationships
export interface RiskControlMatrix {
  risks: {
    id: string;
    name: string;
    category: RiskCategory;
    initialLevel: RiskLevelCategory;
    residualLevel: RiskLevelCategory;
  }[];
  controls: {
    id: string;
    name: string;
    category: ControlCategory;
    implementationStatus: Control['implementationStatus'];
  }[];
  relationships: {
    riskId: string;
    controlId: string;
    effectiveness: RiskControlRelationship['effectiveness'];
  }[];
}

// Coverage analysis
export interface CoverageAnalysis {
  totalRisks: number;
  totalControls: number;
  risksWithControls: number;
  risksWithoutControls: number;
  controlsWithoutRisks: number;
  averageControlsPerRisk: number;
  coveragePercentage: number;
  gaps: CoverageGap[];
}

export interface CoverageGap {
  type: 'uncovered-risk' | 'ineffective-control' | 'over-controlled';
  riskId?: string;
  controlId?: string;
  severity: 'High' | 'Medium' | 'Low';
  recommendation: string;
}

// Impact analysis
export interface ImpactAnalysis {
  controlId: string;
  impactedRisks: {
    riskId: string;
    riskName: string;
    currentLevel: RiskLevelCategory;
    projectedLevel: RiskLevelCategory;
    reduction: number;
  }[];
  overallImpact: 'High' | 'Medium' | 'Low';
  costBenefitRatio?: number;
}

// Network graph data structure for visualization
export interface NetworkNode {
  id: string;
  type: 'risk' | 'control';
  label: string;
  category: RiskCategory | ControlCategory;
  level?: RiskLevelCategory; // For risks
  status?: Control['implementationStatus']; // For controls
  x?: number; // For positioning
  y?: number;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  type: 'risk-control' | 'risk-risk' | 'control-control';
  label?: string;
  strength?: number; // 0-1 for visualization
  bidirectional?: boolean;
}

export interface NetworkGraph {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  layout?: 'force' | 'hierarchical' | 'circular';
}

// Relationship validation
export interface RelationshipValidation {
  isValid: boolean;
  errors: RelationshipValidationError[];
  warnings: RelationshipValidationWarning[];
}

export interface RelationshipValidationError {
  type: 'missing-relationship' | 'invalid-relationship' | 'circular-dependency';
  sourceId: string;
  targetId?: string;
  message: string;
}

export interface RelationshipValidationWarning {
  type: 'weak-coverage' | 'redundant-control' | 'high-dependency';
  entityId: string;
  message: string;
  suggestion: string;
}

// Relationship statistics
export interface RelationshipStatistics {
  totalRelationships: number;
  byType: Record<string, number>;
  averageEffectiveness: number;
  strongRelationships: number;
  weakRelationships: number;
  reviewNeeded: number;
}