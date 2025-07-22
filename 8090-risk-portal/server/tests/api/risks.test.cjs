const request = require('supertest');
const express = require('express');
const risksApi = require('../../api/v1/risks.cjs');
const { errorHandler } = require('../../middleware/errorHandler.cjs');
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

// Create test app
function createTestApp() {
  const app = express();
  app.use(express.json());
  
  // Initialize risk API with mock provider
  const mockProvider = new MockPersistenceProvider();
  const mockDriveService = {};
  risksApi.initializeService(mockDriveService, 'test-file-id');
  
  // Mount routes
  app.use('/api/v1/risks', risksApi.router);
  app.use(errorHandler);
  
  return { app, mockProvider };
}

describe('Risk API Endpoints', () => {
  let app;
  let mockProvider;
  
  beforeEach(() => {
    const testSetup = createTestApp();
    app = testSetup.app;
    mockProvider = testSetup.mockProvider;
  });
  
  describe('GET /api/v1/risks', () => {
    test('returns all risks with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/risks')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1
      });
    });
    
    test('filters risks by category', async () => {
      const response = await request(app)
        .get('/api/v1/risks?category=Security and Data Risks')
        .expect(200);
      
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].riskCategory).toBe('Security and Data Risks');
    });
    
    test('sorts risks by residual risk level descending', async () => {
      const response = await request(app)
        .get('/api/v1/risks?sort=-residualRiskLevel')
        .expect(200);
      
      expect(response.body.data[0].residualScoring.riskLevel).toBe(10);
      expect(response.body.data[1].residualScoring.riskLevel).toBe(6);
    });
    
    test('supports field filtering', async () => {
      const response = await request(app)
        .get('/api/v1/risks?fields=id,risk,riskCategory')
        .expect(200);
      
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('risk');
      expect(response.body.data[0]).toHaveProperty('riskCategory');
      expect(response.body.data[0]).not.toHaveProperty('riskDescription');
    });
  });
  
  describe('GET /api/v1/risks/:id', () => {
    test('returns risk by ID', async () => {
      const response = await request(app)
        .get('/api/v1/risks/RISK-SENSITIVE-INFORMATION-LEAKAGE')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.risk).toBe('Sensitive Information Leakage');
    });
    
    test('returns 404 for non-existent risk', async () => {
      const response = await request(app)
        .get('/api/v1/risks/RISK-NONEXISTENT')
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RISK_NOT_FOUND');
    });
  });
  
  describe('POST /api/v1/risks', () => {
    test('creates new risk with valid data', async () => {
      const newRisk = {
        risk: 'Data Quality Issues',
        riskCategory: 'Accuracy',
        riskDescription: 'Poor data quality affecting AI predictions',
        initialScoring: { likelihood: 3, impact: 3 }
      };
      
      const response = await request(app)
        .post('/api/v1/risks')
        .send(newRisk)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('RISK-DATA-QUALITY-ISSUES');
      expect(response.body.data.risk).toBe('Data Quality Issues');
    });
    
    test('returns validation error for missing required field', async () => {
      const invalidRisk = {
        riskCategory: 'Accuracy',
        riskDescription: 'Missing risk name'
      };
      
      const response = await request(app)
        .post('/api/v1/risks')
        .send(invalidRisk)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
  
  describe('PUT /api/v1/risks/:id', () => {
    test('updates existing risk', async () => {
      const updates = {
        residualScoring: { likelihood: 1, impact: 2 },
        notes: 'Updated notes'
      };
      
      const response = await request(app)
        .put('/api/v1/risks/RISK-AI-BIAS-DISCRIMINATION')
        .send(updates)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.residualScoring.riskLevel).toBe(2);
      expect(response.body.data.notes).toBe('Updated notes');
    });
    
    test('returns 404 for non-existent risk', async () => {
      const response = await request(app)
        .put('/api/v1/risks/RISK-NONEXISTENT')
        .send({ notes: 'Update' })
        .expect(404);
      
      expect(response.body.error.code).toBe('RISK_NOT_FOUND');
    });
  });
  
  describe('DELETE /api/v1/risks/:id', () => {
    test('deletes existing risk', async () => {
      await request(app)
        .delete('/api/v1/risks/RISK-AI-BIAS-DISCRIMINATION')
        .expect(204);
      
      // Verify risk is deleted
      await request(app)
        .get('/api/v1/risks/RISK-AI-BIAS-DISCRIMINATION')
        .expect(404);
    });
    
    test('returns 404 for non-existent risk', async () => {
      const response = await request(app)
        .delete('/api/v1/risks/RISK-NONEXISTENT')
        .expect(404);
      
      expect(response.body.error.code).toBe('RISK_NOT_FOUND');
    });
  });
  
  describe('Special endpoints', () => {
    test('GET /api/v1/risks/statistics returns risk statistics', async () => {
      const response = await request(app)
        .get('/api/v1/risks/statistics')
        .expect(200);
      
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('byCategory');
      expect(response.body.data).toHaveProperty('byRiskLevel');
    });
    
    test('GET /api/v1/risks/high-risks returns high risks', async () => {
      const response = await request(app)
        .get('/api/v1/risks/high-risks?threshold=8')
        .expect(200);
      
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].residualScoring.riskLevel).toBeGreaterThanOrEqual(8);
    });
    
    test('GET /api/v1/risks/without-controls returns unmitigated risks', async () => {
      // Add a risk without controls
      await request(app)
        .post('/api/v1/risks')
        .send({
          risk: 'Unmitigated Risk',
          riskCategory: 'Other Risks',
          riskDescription: 'Risk without controls'
        });
      
      const response = await request(app)
        .get('/api/v1/risks/without-controls')
        .expect(200);
      
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.some(r => r.risk === 'Unmitigated Risk')).toBe(true);
    });
  });
});

// Run the tests
if (require.main === module) {
  require('jest-cli/bin/jest');
}