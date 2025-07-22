import { describe, it, expect } from 'vitest';
import { 
  Risk, 
  Control, 
  isApiError,
  isValidationError
} from '../index';
import { RiskValidationError, ControlValidationError } from '../error.types';
import { 
  transformRiskMapRow, 
  transformControlRow, 
  validateRisk, 
  validateControl,
  getRiskLevelCategory,
  calculateMitigationEffectiveness 
} from '../../utils/dataTransformers';
import extractedData from '../../data/extracted-excel-data.json';

describe('TypeScript Types', () => {
  describe('Risk Types', () => {
    it('should transform Excel risk data to Risk type', () => {
      const firstRisk = extractedData.riskMap[0];
      const transformed = transformRiskMapRow(firstRisk);
      
      expect(transformed).toMatchObject({
        id: expect.any(String),
        riskCategory: 'Behavioral Risks',
        risk: 'Accuracy',
        initialScoring: {
          likelihood: 4,
          impact: 5,
          riskLevel: 20,
          riskLevelCategory: 'Critical'
        },
        residualScoring: {
          likelihood: 2,
          impact: 3,
          riskLevel: 6,
          riskLevelCategory: 'Medium'
        },
        riskReduction: 14,
        mitigationEffectiveness: 'High'
      });
    });
    
    it('should validate risk data correctly', () => {
      const validRisk: Partial<Risk> = {
        risk: 'Test Risk',
        riskCategory: 'Other Risks',
        riskDescription: 'Test description',
        initialScoring: {
          likelihood: 3,
          impact: 4,
          riskLevel: 12,
          riskLevelCategory: 'High'
        }
      };
      
      const errors = validateRisk(validRisk);
      expect(errors).toHaveLength(0);
    });
    
    it('should catch validation errors', () => {
      const invalidRisk: Partial<Risk> = {
        risk: '',
        initialScoring: {
          likelihood: 6 as any, // Invalid
          impact: 0 as any, // Invalid
          riskLevel: 0,
          riskLevelCategory: 'Low'
        }
      };
      
      const errors = validateRisk(invalidRisk);
      expect(errors).toContain('Risk name is required');
      expect(errors).toContain('Initial likelihood must be between 1 and 5');
      expect(errors).toContain('Initial impact must be between 1 and 5');
    });
  });
  
  describe('Control Types', () => {
    it('should transform Excel control data to Control type', () => {
      const firstControl = extractedData.controlsMapping[0];
      const transformed = transformControlRow(firstControl as any);
      
      expect(transformed).toMatchObject({
        mitigationID: 'ACC-01',
        category: 'Accuracy & Judgment',
        compliance: {
          cfrPart11Annex11: expect.any(String),
          hipaaSafeguard: expect.any(String),
          gdprArticle: expect.any(String),
          euAiActArticle: expect.any(String),
          nist80053: expect.any(String),
          soc2TSC: expect.any(String)
        },
        implementationStatus: 'Planned'
      });
    });
    
    it('should validate control data correctly', () => {
      const validControl: Partial<Control> = {
        mitigationID: 'TEST-01',
        mitigationDescription: 'Test control description',
        category: 'Governance & Compliance'
      };
      
      const errors = validateControl(validControl);
      expect(errors).toHaveLength(0);
    });
  });
  
  describe('Error Types', () => {
    it('should create RiskValidationError correctly', () => {
      const error = new RiskValidationError(
        'likelihood',
        10,
        'range',
        'Likelihood must be between 1 and 5'
      );
      
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('RiskValidationError');
      expect(error.field).toBe('likelihood');
      expect(error.value).toBe(10);
      expect(error.rule).toBe('range');
    });
    
    it('should create ControlValidationError correctly', () => {
      const error = new ControlValidationError(
        'mitigationID',
        '',
        'required',
        'Control ID is required'
      );
      
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ControlValidationError');
      expect(error.field).toBe('mitigationID');
    });
    
    it('should identify error types correctly', () => {
      const validationError = new RiskValidationError('test', 'value', 'rule', 'message');
      const regularError = new Error('Regular error');
      
      expect(isValidationError(validationError)).toBe(true);
      expect(isValidationError(regularError)).toBe(false);
      expect(isApiError(regularError)).toBe(false);
    });
  });
  
  describe('Utility Functions', () => {
    it('should calculate risk level category correctly', () => {
      expect(getRiskLevelCategory(25)).toBe('Critical');
      expect(getRiskLevelCategory(16)).toBe('Critical');
      expect(getRiskLevelCategory(15)).toBe('High');
      expect(getRiskLevelCategory(11)).toBe('High');
      expect(getRiskLevelCategory(10)).toBe('Medium');
      expect(getRiskLevelCategory(6)).toBe('Medium');
      expect(getRiskLevelCategory(5)).toBe('Low');
      expect(getRiskLevelCategory(1)).toBe('Low');
    });
    
    it('should calculate mitigation effectiveness correctly', () => {
      expect(calculateMitigationEffectiveness(20, 6)).toBe('High'); // 70% reduction
      expect(calculateMitigationEffectiveness(10, 5)).toBe('Medium'); // 50% reduction
      expect(calculateMitigationEffectiveness(10, 8)).toBe('Low'); // 20% reduction
    });
  });
  
  describe('Data Integrity', () => {
    it('should have all risk categories from Excel data', () => {
      const categories = new Set(extractedData.riskMap.map(r => r.riskCategory));
      expect(categories.size).toBe(6);
      expect(categories.has('Behavioral Risks')).toBe(true);
      expect(categories.has('Transparency Risks')).toBe(true);
      expect(categories.has('Security and Data Risks')).toBe(true);
    });
    
    it('should have all control categories from Excel data', () => {
      const categories = new Set(extractedData.controlsMapping.map(c => c.category).filter(Boolean));
      expect(categories.size).toBe(4);
      expect(categories.has('Accuracy & Judgment')).toBe(true);
      expect(categories.has('Security & Data Privacy')).toBe(true);
    });
  });
});