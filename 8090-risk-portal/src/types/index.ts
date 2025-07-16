// Central export for all types

// Risk types (excluding RiskValidationError which conflicts with error.types)
export { 
  type Risk,
  type RiskScoring,
  type RiskLevelCategory,
  type RiskLikelihood,
  type RiskImpact,
  type RiskCategory,
  type RiskFilters,
  type RiskSort,
  type RiskStatistics,
  type CreateRiskInput,
  type UpdateRiskInput,
  type RiskValidation,
  type RiskValidationError as RiskValidationErrorInterface
} from './risk.types';

// Control types (excluding ControlValidationError which conflicts with error.types)
export {
  type Control,
  type ControlCategory,
  type ControlFilters,
  type ControlSort,
  type ControlStatistics,
  type ControlAssessment,
  type CreateControlInput,
  type UpdateControlInput,
  type ControlValidation,
  type ControlValidationError as ControlValidationErrorInterface,
  type ComplianceMatrix,
  type ControlImplementationPlan
} from './control.types';

// Relationship types
export * from './relationship.types';

// Error types (including the class versions of validation errors)
export * from './error.types';

// Auth types
export * from './auth.types';

// Common types used across the application
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'analyst' | 'viewer';
  department?: string;
  lastLogin?: Date;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  entityType: 'risk' | 'control' | 'relationship' | 'user';
  entityId: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  ipAddress?: string;
  userAgent?: string;
}

export interface FilterOption<T = string> {
  value: T;
  label: string;
  count?: number;
  icon?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

export interface SortParams<T = string> {
  field: T;
  direction: 'asc' | 'desc';
}

export interface SearchParams {
  query: string;
  fields?: string[];
  fuzzy?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: import('./error.types').AppError;
  metadata?: {
    timestamp: Date;
    requestId: string;
    duration: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface DashboardMetrics {
  totalRisks: number;
  totalControls: number;
  criticalRisks: number;
  implementedControls: number;
  riskReductionPercentage: number;
  complianceScore: number;
  lastUpdated: Date;
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'excel' | 'pdf';
  includeRelationships: boolean;
  includeMetadata: boolean;
  filters?: Record<string, any>;
}

// Enum-like constants
export const RISK_LEVELS = {
  LOW: { min: 1, max: 5, label: 'Low', color: '#28A745' },
  MEDIUM: { min: 6, max: 10, label: 'Medium', color: '#FFC107' },
  HIGH: { min: 11, max: 15, label: 'High', color: '#FD7E14' },
  CRITICAL: { min: 16, max: 25, label: 'Critical', color: '#DC3545' }
} as const;

export const COMPLIANCE_FRAMEWORKS = {
  CFR_PART_11: '21 CFR Part 11',
  HIPAA: 'HIPAA',
  GDPR: 'GDPR',
  EU_AI_ACT: 'EU AI Act',
  NIST_800_53: 'NIST 800-53',
  SOC_2: 'SOC 2'
} as const;

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys];

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;