// Risk-related types based on Excel data structure

export type RiskLikelihood = 1 | 2 | 3 | 4 | 5;
export type RiskImpact = 1 | 2 | 3 | 4 | 5;
export type RiskScore = number; // 1-25 based on Likelihood × Impact

export type RiskLevelCategory = 'Low' | 'Medium' | 'High' | 'Critical';

export type RiskCategory = 
  | 'Behavioral Risks'
  | 'Transparency Risks'
  | 'Security and Data Risks'
  | 'Other Risks'
  | 'Business/Cost Related Risks'
  | 'AI Human Impact Risks';

export interface RiskScoring {
  likelihood: RiskLikelihood;
  impact: RiskImpact;
  riskLevel: RiskScore;
  riskLevelCategory: RiskLevelCategory;
}

export interface Risk {
  // Identity
  id: string; // Generated from risk name
  
  // Core fields from Excel
  riskCategory: RiskCategory;
  risk: string;
  riskDescription: string;
  
  // Initial risk assessment
  initialScoring: RiskScoring;
  
  // Mitigation
  exampleMitigations: string;
  agreedMitigation: string;
  
  // Governance
  proposedOversightOwnership: string;
  proposedSupport: string;
  notes: string;
  
  // Residual risk after mitigation
  residualScoring: RiskScoring;
  
  // Calculated fields
  riskReduction: number; // initialRiskLevel - residualRiskLevel
  riskReductionPercentage: number; // percentage reduction from initial to residual
  mitigationEffectiveness: 'High' | 'Medium' | 'Low'; // Based on risk reduction
  
  // Relationships
  relatedControlIds: string[];
  
  // Metadata
  lastUpdated?: Date;
  createdAt?: Date;
}

// Risk filtering and sorting options
export interface RiskFilters {
  categories?: RiskCategory[];
  riskLevels?: RiskLevelCategory[];
  minInitialScore?: number;
  maxInitialScore?: number;
  minResidualScore?: number;
  maxResidualScore?: number;
  searchTerm?: string;
  hasAgreedMitigation?: boolean;
  oversightOwnership?: string[];
}

export type RiskSortField = 
  | 'risk'
  | 'riskCategory'
  | 'initialRiskLevel'
  | 'residualRiskLevel'
  | 'riskReduction';

export interface RiskSort {
  field: RiskSortField;
  direction: 'asc' | 'desc';
}

// Risk summary statistics
export interface RiskStatistics {
  totalRisks: number;
  byCategory: Record<RiskCategory, number>;
  byInitialLevel: Record<RiskLevelCategory, number>;
  byResidualLevel: Record<RiskLevelCategory, number>;
  averageRiskReduction: number;
  criticalRisksCount: number;
  highRisksCount: number;
  mitigatedRisksCount: number;
}

// Risk matrix cell for heatmap visualization
export interface RiskMatrixCell {
  likelihood: RiskLikelihood;
  impact: RiskImpact;
  score: RiskScore;
  level: RiskLevelCategory;
  riskCount: number;
  risks: Risk[];
}

// Risk timeline for tracking changes
export interface RiskHistoryEntry {
  riskId: string;
  timestamp: Date;
  field: keyof Risk;
  oldValue: any;
  newValue: any;
  changedBy: string;
  changeReason?: string;
}

// Risk validation rules
export interface RiskValidation {
  isValid: boolean;
  errors: RiskValidationError[];
}

export interface RiskValidationError {
  field: keyof Risk;
  message: string;
  severity: 'error' | 'warning';
}

// Helper type for risk creation/update
export type CreateRiskInput = Omit<Risk, 'id' | 'relatedControlIds' | 'riskReduction' | 'mitigationEffectiveness' | 'lastUpdated' | 'createdAt'>;
export type UpdateRiskInput = Partial<CreateRiskInput> & { id: string };

// Risk export format
export interface RiskExport {
  risks: Risk[];
  exportDate: Date;
  exportedBy: string;
  filters?: RiskFilters;
  format: 'json' | 'csv' | 'excel';
}