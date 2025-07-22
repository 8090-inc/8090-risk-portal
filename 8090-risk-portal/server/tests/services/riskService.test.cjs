const RiskService = require('../../services/RiskService.cjs');
const ApiError = require('../../errors/ApiError.cjs');
const { ErrorCodes } = require('../../errors/errorCodes.cjs');

// Mock persistence provider
class MockPersistenceProvider {
  constructor() {
    this.risks = [
      {
        id: 'RISK-SENSITIVE-INFORMATION-LEAKAGE',
        risk: 'Sensitive Information Leakage',
        riskCategory: 'Security and Data Risks',
        riskDescription: 'AI systems may inadvertently expose sensitive data',
        initialScoring: { likelihood: 4, impact: 5, riskLevel: 20 },
        residualScoring: { likelihood: 2, impact: 5, riskLevel: 10 },
        relatedControlIds: ['SEC-01', 'SEC-02'],
        proposedOversightOwnership: ['CTO'],
        proposedSupport: ['Security Team'],
        agreedMitigation: 'Implement data encryption',
        notes: ''
      },
      {
        id: 'RISK-AI-BIAS-DISCRIMINATION',
        risk: 'AI Bias & Discrimination',
        riskCategory: 'AI Human Impact Risks',
        riskDescription: 'AI models may exhibit bias',
        initialScoring: { likelihood: 3, impact: 4, riskLevel: 12 },
        residualScoring: { likelihood: 2, impact: 3, riskLevel: 6 },
        relatedControlIds: ['ACC-01'],
        proposedOversightOwnership: ['AI Ethics Board'],
        proposedSupport: ['Data Science Team'],
        agreedMitigation: 'Regular bias audits',
        notes: ''
      },
      {
        id: 'RISK-SYSTEM-DOWNTIME',
        risk: 'System Downtime',
        riskCategory: 'Business/Cost Related Risks',
        riskDescription: 'AI system unavailability',
        initialScoring: { likelihood: 2, impact: 4, riskLevel: 8 },
        residualScoring: { likelihood: 1, impact: 4, riskLevel: 4 },
        relatedControlIds: [],
        proposedOversightOwnership: ['Operations'],
        proposedSupport: ['DevOps Team'],
        agreedMitigation: 'Implement redundancy',
        notes: 'Low priority'
      }
    ];
  }
  
  async getAllRisks() {
    return [...this.risks];
  }
  
  async getRiskById(id) {
    const risk = this.risks.find(r => r.id === id);
    if (!risk) {
      throw new ApiError(404, ErrorCodes.RISK_NOT_FOUND, { id });
    }
    return { ...risk };
  }
  
  async createRisk(risk) {
    this.risks.push({ ...risk });
    return { ...risk };
  }
  
  async updateRisk(id, updates) {
    const index = this.risks.findIndex(r => r.id === id);
    if (index === -1) {
      throw new ApiError(404, ErrorCodes.RISK_NOT_FOUND, { id });
    }
    this.risks[index] = { ...this.risks[index], ...updates };
    return { ...this.risks[index] };
  }
  
  async deleteRisk(id) {
    const index = this.risks.findIndex(r => r.id === id);
    if (index === -1) {
      throw new ApiError(404, ErrorCodes.RISK_NOT_FOUND, { id });
    }
    this.risks.splice(index, 1);
  }
}

describe('RiskService', () => {
  let riskService;
  let mockProvider;
  
  beforeEach(() => {
    mockProvider = new MockPersistenceProvider();
    riskService = new RiskService(mockProvider);
  });
  
  describe('getAllRisks', () => {
    test('returns all risks with pagination', async () => {
      const result = await riskService.getAllRisks({
        pagination: { page: 1, limit: 2 }
      });
      
      expect(result.risks).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.totalPages).toBe(2);
    });
    
    test('filters risks by category', async () => {
      const result = await riskService.getAllRisks({
        filters: { category: 'Security and Data Risks' }
      });
      
      expect(result.risks).toHaveLength(1);
      expect(result.risks[0].riskCategory).toBe('Security and Data Risks');
    });
    
    test('filters risks by score range', async () => {
      const result = await riskService.getAllRisks({
        filters: { minScore: 5, maxScore: 15 }
      });
      
      expect(result.risks).toHaveLength(2);
      expect(result.risks.every(r => 
        r.residualScoring.riskLevel >= 5 && 
        r.residualScoring.riskLevel <= 15
      )).toBe(true);
    });
    
    test('sorts risks by residual risk level descending', async () => {
      const result = await riskService.getAllRisks({
        sort: '-residualRiskLevel'
      });
      
      expect(result.risks[0].residualScoring.riskLevel).toBe(10);
      expect(result.risks[1].residualScoring.riskLevel).toBe(6);
      expect(result.risks[2].residualScoring.riskLevel).toBe(4);
    });
    
    test('filters risks without controls', async () => {
      const result = await riskService.getAllRisks({
        filters: { hasControls: false }
      });
      
      expect(result.risks).toHaveLength(1);
      expect(result.risks[0].id).toBe('RISK-SYSTEM-DOWNTIME');
    });
  });
  
  describe('getRiskById', () => {
    test('returns risk by ID', async () => {
      const risk = await riskService.getRiskById('RISK-SENSITIVE-INFORMATION-LEAKAGE');
      
      expect(risk.risk).toBe('Sensitive Information Leakage');
      expect(risk.relatedControlIds).toEqual(['SEC-01', 'SEC-02']);
    });
    
    test('throws error for non-existent risk', async () => {
      await expect(
        riskService.getRiskById('RISK-NONEXISTENT')
      ).rejects.toThrow(ApiError);
    });
  });
  
  describe('createRisk', () => {
    test('creates new risk with generated ID', async () => {
      const newRisk = await riskService.createRisk({
        risk: 'Data Quality Issues',
        riskCategory: 'Accuracy',
        riskDescription: 'Poor data quality affecting AI predictions',
        initialScoring: { likelihood: 3, impact: 3 }
      });
      
      expect(newRisk.id).toBe('RISK-DATA-QUALITY-ISSUES');
      expect(newRisk.initialScoring.riskLevel).toBe(9);
      expect(newRisk.residualScoring.riskLevel).toBe(9);
      expect(newRisk.relatedControlIds).toEqual([]);
    });
    
    test('throws error for duplicate risk name', async () => {
      await expect(
        riskService.createRisk({
          risk: 'Sensitive Information Leakage',
          riskCategory: 'Security and Data Risks',
          riskDescription: 'Duplicate risk'
        })
      ).rejects.toThrow(ApiError);
    });
    
    test('throws error for missing required field', async () => {
      await expect(
        riskService.createRisk({
          riskCategory: 'Accuracy',
          riskDescription: 'Missing risk name'
        })
      ).rejects.toThrow(ApiError);
    });
  });
  
  describe('updateRisk', () => {
    test('updates risk successfully', async () => {
      const updated = await riskService.updateRisk('RISK-SYSTEM-DOWNTIME', {
        residualScoring: { likelihood: 1, impact: 2 },
        notes: 'Updated notes'
      });
      
      expect(updated.residualScoring.riskLevel).toBe(2);
      expect(updated.notes).toBe('Updated notes');
    });
    
    test('prevents changing risk name that would change ID', async () => {
      await expect(
        riskService.updateRisk('RISK-SYSTEM-DOWNTIME', {
          risk: 'Different Risk Name'
        })
      ).rejects.toThrow(ApiError);
    });
    
    test('throws error for non-existent risk', async () => {
      await expect(
        riskService.updateRisk('RISK-NONEXISTENT', {
          notes: 'Updated'
        })
      ).rejects.toThrow(ApiError);
    });
  });
  
  describe('deleteRisk', () => {
    test('deletes risk successfully', async () => {
      await riskService.deleteRisk('RISK-SYSTEM-DOWNTIME');
      
      const result = await riskService.getAllRisks();
      expect(result.total).toBe(2);
      expect(result.risks.find(r => r.id === 'RISK-SYSTEM-DOWNTIME')).toBeUndefined();
    });
    
    test('throws error for non-existent risk', async () => {
      await expect(
        riskService.deleteRisk('RISK-NONEXISTENT')
      ).rejects.toThrow(ApiError);
    });
  });
  
  describe('business logic methods', () => {
    test('getHighRisks returns risks above threshold', async () => {
      const highRisks = await riskService.getHighRisks(8);
      
      expect(highRisks).toHaveLength(1);
      expect(highRisks[0].id).toBe('RISK-SENSITIVE-INFORMATION-LEAKAGE');
    });
    
    test('getRisksWithoutControls returns unmitigated risks', async () => {
      const unmitigated = await riskService.getRisksWithoutControls();
      
      expect(unmitigated).toHaveLength(1);
      expect(unmitigated[0].id).toBe('RISK-SYSTEM-DOWNTIME');
    });
    
    test('getRiskStatistics returns correct stats', async () => {
      const stats = await riskService.getRiskStatistics();
      
      expect(stats.total).toBe(3);
      expect(stats.byCategory['Security and Data Risks']).toBe(1);
      expect(stats.byCategory['AI Human Impact Risks']).toBe(1);
      expect(stats.byCategory['Business/Cost Related Risks']).toBe(1);
      expect(stats.byRiskLevel.veryLow).toBe(1); // 4
      expect(stats.byRiskLevel.low).toBe(2); // 6 and 10
      expect(stats.withControls).toBe(2);
      expect(stats.withoutControls).toBe(1);
      expect(stats.averageResidualRisk).toBe(6.7); // (10+6+4)/3
    });
  });
});

// Run the tests
if (require.main === module) {
  require('jest-cli/bin/jest');
}