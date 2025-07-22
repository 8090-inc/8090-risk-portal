// Excel data type definitions based on backend parser structure

export interface RiskMapRow {
  id?: string;
  riskCategory: string;
  risk: string;
  riskDescription: string;
  initialLikelihood: number;
  initialImpact: number;
  initialRiskLevel: number;
  initialRiskCategory?: string;
  exampleMitigations?: string;
  agreedMitigation?: string;
  proposedOversightOwnership?: string;
  proposedSupport?: string;
  notes?: string;
  residualLikelihood: number;
  residualImpact: number;
  residualRiskLevel: number;
  residualRiskCategory?: string;
}

export interface ControlsMappingRow {
  mitigationID: string;
  mitigationDescription: string;
  category?: string;
  cfrPart11Annex11?: string;
  hipaaSafeguard?: string;
  gdprArticle?: string;
  euAiActArticle?: string;
  nist80053?: string;
  soc2TSC?: string;
}

export interface ExcelData {
  riskMap: RiskMapRow[];
  controlsMapping: ControlsMappingRow[];
  relationships?: {
    controlId: string;
    riskId: string;
    linkType?: string;
    effectiveness?: string;
    notes?: string;
    createdDate?: string;
    lastUpdated?: string;
  }[];
}