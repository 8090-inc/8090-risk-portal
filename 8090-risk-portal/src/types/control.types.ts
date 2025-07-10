// Control-related types based on Excel data structure

export type ControlCategory = 
  | 'Accuracy & Judgment'
  | 'Security & Data Privacy'
  | 'Audit & Traceability'
  | 'Governance & Compliance';

export interface Control {
  // Identity
  mitigationID: string; // e.g., ACC-01, SEC-01
  
  // Core fields from Excel
  mitigationDescription: string;
  category: ControlCategory;
  
  // Compliance mappings
  compliance: {
    cfrPart11Annex11: string;      // 21 CFR Part 11 / Annex 11 Clause
    hipaaSafeguard: string;         // HIPAA Safeguard
    gdprArticle: string;            // GDPR Article
    euAiActArticle: string;         // EU AI Act Article
    nist80053: string;              // NIST 800-53 Control Family
    soc2TSC: string;                // SOC 2 TSC
  };
  
  // Relationships
  relatedRiskIds: string[];
  
  // Implementation status
  implementationStatus?: 'Implemented' | 'In Progress' | 'Planned' | 'Not Started';
  implementationDate?: Date;
  implementationNotes?: string;
  
  // Effectiveness
  effectiveness?: 'High' | 'Medium' | 'Low' | 'Not Assessed';
  lastAssessmentDate?: Date;
  nextAssessmentDate?: Date;
  
  // Metadata
  lastUpdated?: Date;
  createdAt?: Date;
}

// Control filtering options
export interface ControlFilters {
  categories?: ControlCategory[];
  implementationStatus?: Control['implementationStatus'][];
  effectiveness?: Control['effectiveness'][];
  searchTerm?: string;
  hasCompliance?: {
    cfrPart11?: boolean;
    hipaa?: boolean;
    gdpr?: boolean;
    euAiAct?: boolean;
    nist?: boolean;
    soc2?: boolean;
  };
  relatedToRisk?: string; // Risk ID
}

export type ControlSortField = 
  | 'mitigationID'
  | 'category'
  | 'implementationStatus'
  | 'effectiveness';

export interface ControlSort {
  field: ControlSortField;
  direction: 'asc' | 'desc';
}

// Control statistics
export interface ControlStatistics {
  totalControls: number;
  byCategory: Record<ControlCategory, number>;
  byImplementationStatus: Record<string, number>;
  byEffectiveness: Record<string, number>;
  complianceCoverage: {
    cfrPart11: number;
    hipaa: number;
    gdpr: number;
    euAiAct: number;
    nist: number;
    soc2: number;
  };
}

// Control assessment
export interface ControlAssessment {
  controlId: string;
  assessmentDate: Date;
  assessedBy: string;
  effectiveness: Control['effectiveness'];
  findings: string;
  recommendations: string;
  nextReviewDate: Date;
}

// Control validation
export interface ControlValidation {
  isValid: boolean;
  errors: ControlValidationError[];
}

export interface ControlValidationError {
  field: keyof Control;
  message: string;
  severity: 'error' | 'warning';
}

// Helper types for control operations
export type CreateControlInput = Omit<Control, 'relatedRiskIds' | 'lastUpdated' | 'createdAt'>;
export type UpdateControlInput = Partial<CreateControlInput> & { mitigationID: string };

// Control matrix for compliance view
export interface ComplianceMatrix {
  controlId: string;
  controlName: string;
  frameworks: {
    framework: string;
    requirement: string;
    status: 'Compliant' | 'Partial' | 'Non-Compliant' | 'Not Applicable';
  }[];
}

// Control implementation plan
export interface ControlImplementationPlan {
  controlId: string;
  plannedDate: Date;
  assignedTo: string;
  resources: string[];
  milestones: {
    name: string;
    dueDate: Date;
    status: 'Completed' | 'In Progress' | 'Not Started';
  }[];
  dependencies: string[]; // Other control IDs
  estimatedCost?: number;
  actualCost?: number;
}