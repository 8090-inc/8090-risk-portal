// Use Case type definitions

export interface UseCase {
  id: string;
  title: string;
  description?: string;
  businessArea?: string;
  aiCategories?: string[];
  
  objective?: {
    currentState?: string;
    futureState?: string;
    solution?: string;
    benefits?: string;
  };
  
  impact?: {
    impactPoints?: string[];
    costSaving?: number;
    effortMonths?: number;
  };
  
  execution?: {
    functionsImpacted?: string[];
    dataRequirements?: string;
    aiComplexity?: 'Low' | 'Medium' | 'High';
    feasibility?: 'Low' | 'Medium' | 'High';
    value?: 'Low' | 'Medium' | 'High';
    risk?: 'Low' | 'Medium' | 'High';
  };
  
  status?: string;
  implementationStart?: string;
  implementationEnd?: string;
  owner?: string;
  stakeholders?: string[];
  notes?: string;
  
  // Audit fields
  createdDate?: string;
  createdBy?: string;
  lastUpdated?: string;
  lastUpdatedBy?: string;
  
  // Related entities
  relatedRiskIds?: string[];
  riskCount?: number;
}

export interface UseCaseFilters {
  businessArea?: string;
  aiCategory?: string;
  status?: string;
  owner?: string;
  search?: string;
}

export interface UseCaseStatistics {
  total: number;
  byStatus: Record<string, number>;
  byBusinessArea: Record<string, number>;
  byAiCategory: Record<string, number>;
  totalCostSaving: number;
  averageEffortMonths: number;
}

// Valid values for dropdowns
export const VALID_BUSINESS_AREAS = [
  'General',
  'Medical',
  'R&D',
  'Commercial',
  'Manufacturing',
  'Pharmacovigilance',
  'Legal',
  'Clinical',
  'Quality Management',
  'Supply Chain',
  'Finance'
];

export const VALID_AI_CATEGORIES = [
  'Content Generation',
  'Data Analysis',
  'Image Analysis',
  'Natural Language Processing',
  'Speech Recognition',
  'Machine Learning',
  'Computer Vision',
  'Predictive Analytics',
  'Process Automation',
  'Decision Support'
];

export const VALID_STATUSES = [
  'Concept',
  'Under Review',
  'Approved',
  'In Development',
  'Pilot',
  'In Production',
  'On Hold',
  'Cancelled'
];

export const VALID_COMPLEXITIES = ['Low', 'Medium', 'High'];
export const VALID_LEVELS = ['Low', 'Medium', 'High'];