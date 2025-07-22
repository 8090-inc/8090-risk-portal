const request = require('supertest');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_FILE_ID = '1d9axEzm_RAZ2Ors7O-ZIVJu4n9y0tH2s';
const TEST_PORT = 8081; // Use different port to avoid conflicts

describe('End-to-End API Integration Tests', () => {
  let app;
  let server;
  let driveService;
  
  beforeAll(async () => {
    // Initialize Google Drive service
    const credentials = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../../service-account-key.json'), 'utf8')
    );
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    
    driveService = google.drive({ version: 'v3', auth });
    
    // Create Express app with real services
    const express = require('express');
    app = express();
    
    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Mock authentication for tests
    app.use((req, res, next) => {
      req.user = {
        email: 'test.user@dompe.com',
        id: 'test.user',
        name: 'test.user',
        role: 'admin',
        source: 'test'
      };
      next();
    });
    
    // Initialize and mount API routes
    const apiRouter = require('../../api/index.cjs');
    apiRouter.initializeServices(driveService, TEST_FILE_ID);
    app.use('/api', apiRouter.router);
    
    // Error handler
    const { errorHandler } = require('../../middleware/errorHandler.cjs');
    app.use(errorHandler);
    
    // Start server
    server = app.listen(TEST_PORT);
    console.log(`Test server running on port ${TEST_PORT}`);
  });
  
  afterAll(async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  });
  
  describe('Risk CRUD Operations', () => {
    let testRiskId;
    const testRiskData = {
      risk: '[TEST] E2E Integration Test Risk',
      riskCategory: 'Other Risks',
      riskDescription: 'This is a test risk created by automated E2E testing',
      initialScoring: { likelihood: 3, impact: 3 },
      proposedOversightOwnership: ['Test Owner'],
      proposedSupport: ['Test Support'],
      agreedMitigation: 'Test mitigation',
      notes: 'Created at ' + new Date().toISOString()
    };
    
    test('CREATE: Should create a new risk and persist to Google Drive', async () => {
      const response = await request(app)
        .post('/api/v1/risks')
        .send(testRiskData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: expect.stringMatching(/^RISK-TEST-E2E-INTEGRATION-TEST-RISK$/),
        risk: testRiskData.risk,
        riskCategory: testRiskData.riskCategory,
        initialScoring: expect.objectContaining({
          likelihood: 3,
          impact: 3,
          riskLevel: 9
        })
      });
      
      testRiskId = response.body.data.id;
      console.log('Created risk:', testRiskId);
    });
    
    test('READ: Should retrieve the created risk from Google Drive', async () => {
      // Wait a moment for cache to expire or force refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await request(app)
        .get(`/api/v1/risks/${testRiskId}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testRiskId);
      expect(response.body.data.risk).toBe(testRiskData.risk);
      expect(response.body.data.notes).toBe(testRiskData.notes);
    });
    
    test('UPDATE: Should update the risk and persist changes', async () => {
      const updates = {
        residualScoring: { likelihood: 1, impact: 2 },
        notes: 'Updated at ' + new Date().toISOString(),
        agreedMitigation: 'Updated mitigation strategy'
      };
      
      const response = await request(app)
        .put(`/api/v1/risks/${testRiskId}`)
        .send(updates)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.residualScoring.riskLevel).toBe(2);
      expect(response.body.data.notes).toBe(updates.notes);
      expect(response.body.data.agreedMitigation).toBe(updates.agreedMitigation);
    });
    
    test('VERIFY UPDATE: Should read back updated data from Google Drive', async () => {
      // Force cache refresh by waiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await request(app)
        .get(`/api/v1/risks/${testRiskId}`)
        .expect(200);
      
      expect(response.body.data.residualScoring.riskLevel).toBe(2);
      expect(response.body.data.agreedMitigation).toBe('Updated mitigation strategy');
    });
    
    test('LIST: Should include test risk in filtered results', async () => {
      const response = await request(app)
        .get('/api/v1/risks?category=Other Risks')
        .expect(200);
      
      const testRisks = response.body.data.filter(r => r.id === testRiskId);
      expect(testRisks).toHaveLength(1);
      expect(testRisks[0].risk).toBe(testRiskData.risk);
    });
    
    test('DELETE: Should delete the risk from Google Drive', async () => {
      await request(app)
        .delete(`/api/v1/risks/${testRiskId}`)
        .expect(204);
      
      console.log('Deleted risk:', testRiskId);
    });
    
    test('VERIFY DELETE: Should not find deleted risk', async () => {
      // Force cache refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await request(app)
        .get(`/api/v1/risks/${testRiskId}`)
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RISK_NOT_FOUND');
    });
  });
  
  describe('Control CRUD Operations', () => {
    let testControlId = 'TEST-99';
    const testControlData = {
      mitigationID: testControlId,
      mitigationDescription: '[TEST] E2E Integration Test Control',
      category: 'Governance & Compliance',
      implementationStatus: 'In Progress',
      effectiveness: 'Medium',
      implementationNotes: 'Test implementation notes',
      compliance: {
        gdprArticle: 'Art. 25',
        nist80053: 'AC-1'
      }
    };
    
    test('CREATE: Should create a new control', async () => {
      const response = await request(app)
        .post('/api/v1/controls')
        .send(testControlData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.mitigationID).toBe(testControlId);
      console.log('Created control:', testControlId);
    });
    
    test('UPDATE: Should update control with relationships', async () => {
      const updates = {
        effectiveness: 'High',
        implementationStatus: 'Implemented',
        implementationNotes: 'Successfully implemented and tested'
      };
      
      const response = await request(app)
        .put(`/api/v1/controls/${testControlId}`)
        .send(updates)
        .expect(200);
      
      expect(response.body.data.effectiveness).toBe('High');
      expect(response.body.data.implementationStatus).toBe('Implemented');
    });
    
    test('DELETE: Should delete the control', async () => {
      await request(app)
        .delete(`/api/v1/controls/${testControlId}`)
        .expect(204);
      
      console.log('Deleted control:', testControlId);
    });
  });
  
  describe('Relationship Operations', () => {
    let riskId1, riskId2, controlId1;
    
    beforeAll(async () => {
      // Create test entities
      const risk1 = await request(app)
        .post('/api/v1/risks')
        .send({
          risk: '[TEST] Relationship Test Risk 1',
          riskCategory: 'Other Risks',
          riskDescription: 'Test risk for relationships'
        });
      riskId1 = risk1.body.data.id;
      
      const risk2 = await request(app)
        .post('/api/v1/risks')
        .send({
          risk: '[TEST] Relationship Test Risk 2',
          riskCategory: 'Other Risks',
          riskDescription: 'Another test risk'
        });
      riskId2 = risk2.body.data.id;
      
      const control1 = await request(app)
        .post('/api/v1/controls')
        .send({
          mitigationID: 'TEST-98',
          mitigationDescription: '[TEST] Relationship Test Control',
          category: 'Security & Data Privacy'
        });
      controlId1 = control1.body.data.mitigationID;
    });
    
    afterAll(async () => {
      // Cleanup
      await request(app).delete(`/api/v1/risks/${riskId1}`);
      await request(app).delete(`/api/v1/risks/${riskId2}`);
      await request(app).delete(`/api/v1/controls/${controlId1}`);
    });
    
    test('Should create risk-control relationships', async () => {
      const response = await request(app)
        .put(`/api/v1/risks/${riskId1}/controls`)
        .send({ controlIds: [controlId1] })
        .expect(200);
      
      expect(response.body.data.controls).toHaveLength(1);
      expect(response.body.data.controls[0].mitigationID).toBe(controlId1);
    });
    
    test('Should retrieve relationships from both directions', async () => {
      // Check from risk side
      const riskControls = await request(app)
        .get(`/api/v1/risks/${riskId1}/controls`)
        .expect(200);
      
      expect(riskControls.body.data.controls).toHaveLength(1);
      
      // Check from control side
      const controlRisks = await request(app)
        .get(`/api/v1/controls/${controlId1}/risks`)
        .expect(200);
      
      expect(controlRisks.body.data.risks).toHaveLength(1);
      expect(controlRisks.body.data.risks[0].id).toBe(riskId1);
    });
    
    test('Should validate relationships', async () => {
      const response = await request(app)
        .get('/api/v1/relationships/validate')
        .expect(200);
      
      expect(response.body.data.valid).toBe(true);
      expect(response.body.data.issueCount).toBe(0);
    });
  });
  
  describe('Advanced Query Features', () => {
    test('Should support pagination', async () => {
      const page1 = await request(app)
        .get('/api/v1/risks?page=1&limit=5')
        .expect(200);
      
      expect(page1.body.meta.page).toBe(1);
      expect(page1.body.meta.limit).toBe(5);
      expect(page1.body.data.length).toBeLessThanOrEqual(5);
    });
    
    test('Should support sorting', async () => {
      const response = await request(app)
        .get('/api/v1/risks?sort=-residualRiskLevel')
        .expect(200);
      
      // Verify descending order
      for (let i = 1; i < response.body.data.length; i++) {
        const prevRisk = response.body.data[i - 1].residualScoring?.riskLevel || 0;
        const currRisk = response.body.data[i].residualScoring?.riskLevel || 0;
        expect(prevRisk).toBeGreaterThanOrEqual(currRisk);
      }
    });
    
    test('Should support field filtering', async () => {
      const response = await request(app)
        .get('/api/v1/risks?fields=id,risk,riskCategory')
        .expect(200);
      
      if (response.body.data.length > 0) {
        const risk = response.body.data[0];
        expect(Object.keys(risk)).toEqual(['id', 'risk', 'riskCategory']);
      }
    });
    
    test('Should provide statistics', async () => {
      const response = await request(app)
        .get('/api/v1/risks/statistics')
        .expect(200);
      
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('byCategory');
      expect(response.body.data).toHaveProperty('byRiskLevel');
      expect(response.body.data).toHaveProperty('averageResidualRisk');
    });
  });
});

// Run the tests
if (require.main === module) {
  require('jest-cli/bin/jest');
}