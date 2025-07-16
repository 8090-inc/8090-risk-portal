import type { 
  Risk, 
  Control, 
  RiskScoring,
  RiskLevelCategory,
  RiskCategory,
  ControlCategory,
  RiskLikelihood,
  RiskImpact
} from '../types';
import type { 
  RiskMapRow, 
  ControlsMappingRow, 
  ExcelDataV2 as ExcelData 
} from '../services/excel/excelParserV2';
import { parseOwners } from '../constants/riskOwners';

// Generate a URL-safe ID from a string
export const generateId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
};

// Determine risk level category based on score
export const getRiskLevelCategory = (score: number): RiskLevelCategory => {
  if (score >= 16) return 'Critical';
  if (score >= 11) return 'High';
  if (score >= 6) return 'Medium';
  return 'Low';
};

// Calculate mitigation effectiveness
export const calculateMitigationEffectiveness = (
  initialScore: number, 
  residualScore: number
): 'High' | 'Medium' | 'Low' => {
  const reduction = initialScore - residualScore;
  const percentReduction = (reduction / initialScore) * 100;
  
  if (percentReduction >= 70) return 'High';
  if (percentReduction >= 40) return 'Medium';
  return 'Low';
};

// Transform Excel risk data to Risk type
export const transformRiskMapRow = (row: RiskMapRow, relatedControlIds: string[] = []): Risk => {
  const id = generateId(row.risk);
  
  const initialScoring: RiskScoring = {
    likelihood: (row.initialLikelihood || 3) as RiskLikelihood,
    impact: (row.initialImpact || 3) as RiskImpact,
    riskLevel: row.initialRiskLevel || 9,
    riskLevelCategory: getRiskLevelCategory(row.initialRiskLevel || 9)
  };
  
  const residualScoring: RiskScoring = {
    likelihood: (row.residualLikelihood || 2) as RiskLikelihood,
    impact: (row.residualImpact || 2) as RiskImpact,
    riskLevel: row.residualRiskLevel || 4,
    riskLevelCategory: getRiskLevelCategory(row.residualRiskLevel || 4)
  };
  
  const riskReduction = initialScoring.riskLevel - residualScoring.riskLevel;
  const riskReductionPercentage = initialScoring.riskLevel > 0 
    ? Math.round((riskReduction / initialScoring.riskLevel) * 100)
    : 0;
  
  return {
    id,
    riskCategory: row.riskCategory as RiskCategory,
    risk: row.risk,
    riskDescription: row.riskDescription,
    initialScoring,
    exampleMitigations: row.exampleMitigations,
    agreedMitigation: row.agreedMitigation,
    proposedOversightOwnership: parseOwners(row.proposedOversightOwnership),
    proposedSupport: parseOwners(row.proposedSupport),
    notes: row.notes,
    residualScoring,
    riskReduction,
    riskReductionPercentage,
    mitigationEffectiveness: calculateMitigationEffectiveness(
      initialScoring.riskLevel,
      residualScoring.riskLevel
    ),
    relatedControlIds,
    createdAt: new Date(),
    lastUpdated: new Date()
  };
};

// Transform Excel control data to Control type
export const transformControlRow = (row: ControlsMappingRow, relatedRiskIds: string[] = []): Control => {
  return {
    mitigationID: row.mitigationID,
    mitigationDescription: row.mitigationDescription,
    category: (row.category || 'Uncategorized') as ControlCategory,
    compliance: {
      cfrPart11Annex11: row.cfrPart11Annex11,
      hipaaSafeguard: row.hipaaSafeguard,
      gdprArticle: row.gdprArticle,
      euAiActArticle: row.euAiActArticle,
      nist80053: row.nist80053,
      soc2TSC: row.soc2TSC
    },
    relatedRiskIds,
    implementationStatus: 'Planned', // Default status
    createdAt: new Date(),
    lastUpdated: new Date()
  };
};

// Build risk-control relationships from Excel data
export const buildRelationships = (data: ExcelData): {
  riskToControls: Map<string, string[]>;
  controlToRisks: Map<string, string[]>;
} => {
  const riskToControls = new Map<string, string[]>();
  const controlToRisks = new Map<string, string[]>();
  
  // Simple keyword-based matching for now
  data.riskMap.forEach((risk: RiskMapRow) => {
    const riskId = generateId(risk.risk);
    const relatedControls: string[] = [];
    
    data.controlsMapping.forEach((control: ControlsMappingRow) => {
      const riskKeywords = risk.risk.toLowerCase().split(' ').filter((w: string) => w.length > 3);
      const controlDesc = control.mitigationDescription.toLowerCase();
      
      // Check if control description mentions risk keywords
      const isRelated = riskKeywords.some((keyword: string) => controlDesc.includes(keyword));
      
      // Also check specific mappings based on risk categories
      const categoryMatch = (
        (risk.riskCategory === 'Behavioral Risks' && control.category === 'Accuracy & Judgment') ||
        (risk.riskCategory === 'Security and Data Risks' && control.category === 'Security & Data Privacy') ||
        (risk.riskCategory === 'Transparency Risks' && control.category === 'Audit & Traceability')
      );
      
      if (isRelated || categoryMatch) {
        relatedControls.push(control.mitigationID);
        
        // Update control to risks mapping
        const existingRisks = controlToRisks.get(control.mitigationID) || [];
        if (!existingRisks.includes(riskId)) {
          existingRisks.push(riskId);
          controlToRisks.set(control.mitigationID, existingRisks);
        }
      }
    });
    
    if (relatedControls.length > 0) {
      riskToControls.set(riskId, relatedControls);
    }
  });
  
  return { riskToControls, controlToRisks };
};

// Transform all Excel data to application types
export const transformExcelData = (data: ExcelData): {
  risks: Risk[];
  controls: Control[];
  relationships: {
    riskToControls: Map<string, string[]>;
    controlToRisks: Map<string, string[]>;
  };
} => {
  const { riskToControls, controlToRisks } = buildRelationships(data);
  
  const risks = data.riskMap.map((row: RiskMapRow) => {
    const riskId = generateId(row.risk);
    const relatedControlIds = riskToControls.get(riskId) || [];
    return transformRiskMapRow(row, relatedControlIds);
  });
  
  const controls = data.controlsMapping.map((row: ControlsMappingRow) => {
    const relatedRiskIds = controlToRisks.get(row.mitigationID) || [];
    return transformControlRow(row, relatedRiskIds);
  });
  
  return {
    risks,
    controls,
    relationships: { riskToControls, controlToRisks }
  };
};

// Validate risk data
export const validateRisk = (risk: Partial<Risk>): string[] => {
  const errors: string[] = [];
  
  if (!risk.risk) errors.push('Risk name is required');
  if (!risk.riskCategory) errors.push('Risk category is required');
  if (!risk.riskDescription) errors.push('Risk description is required');
  
  if (risk.initialScoring) {
    const { likelihood, impact } = risk.initialScoring;
    if (!likelihood || likelihood < 1 || likelihood > 5) {
      errors.push('Initial likelihood must be between 1 and 5');
    }
    if (!impact || impact < 1 || impact > 5) {
      errors.push('Initial impact must be between 1 and 5');
    }
  } else {
    errors.push('Initial scoring is required');
  }
  
  return errors;
};

// Validate control data
export const validateControl = (control: Partial<Control>): string[] => {
  const errors: string[] = [];
  
  if (!control.mitigationID) errors.push('Control ID is required');
  if (!control.mitigationDescription) errors.push('Control description is required');
  if (!control.category) errors.push('Control category is required');
  
  return errors;
};