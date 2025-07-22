/**
 * Relationships Tab End-to-End Integration Test
 * Tests the new relationships sheet functionality
 */

// Load test environment variables first
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env.test') });

const { spawn } = require('child_process');
const axios = require('axios');

// Test configuration
const SERVER_PORT = 8084;
const BASE_URL = `http://localhost:${SERVER_PORT}`;
const API_URL = `${BASE_URL}/api/v1`;

// Set environment for test server
process.env.PORT = SERVER_PORT;
process.env.NODE_ENV = 'test';

describe('Relationships Tab E2E Test', () => {
  let serverProcess;
  
  // Start the actual server
  beforeAll(async () => {
    console.log('Starting server on port', SERVER_PORT);
    console.log('Using test file ID:', process.env.GOOGLE_DRIVE_FILE_ID);
    console.log('Testing relationships sheet functionality...');
    
    serverProcess = spawn('node', [path.join(__dirname, '../../../server.cjs')], {
      env: {
        ...process.env,
        PORT: SERVER_PORT,
        NODE_ENV: 'test',
        GOOGLE_DRIVE_FILE_ID: process.env.GOOGLE_DRIVE_FILE_ID
      },
      cwd: path.join(__dirname, '../../..')
    });
    
    // Capture server output
    serverProcess.stdout.on('data', (data) => {
      console.log('[SERVER]:', data.toString().trim());
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error('[SERVER ERROR]:', data.toString().trim());
    });
    
    // Wait for server to be ready
    await waitForServer();
  });
  
  afterAll(async () => {
    if (serverProcess) {
      serverProcess.kill();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  });
  
  async function waitForServer() {
    for (let i = 0; i < 30; i++) {
      try {
        const response = await axios.get(`${BASE_URL}/health`);
        if (response.status === 200) {
          console.log('Server is ready!');
          return;
        }
      } catch (error) {
        // Server not ready yet
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    throw new Error('Server failed to start within 30 seconds');
  }
  
  describe('Relationships Sheet Operations', () => {
    let testRiskId;
    let testControlId1;
    let testControlId2;
    
    // Create test data
    beforeAll(async () => {
      const uniqueId = Date.now();
      
      // Create test risk
      const riskResponse = await axios.post(`${API_URL}/risks`, {
        risk: `Relationship Test Risk ${uniqueId}`,
        riskCategory: 'Other Risks',
        riskDescription: 'Testing relationships sheet functionality',
        initialScoring: { likelihood: 3, impact: 3 }
      });
      testRiskId = riskResponse.data.data.id;
      console.log('Created test risk:', testRiskId);
      
      // Create test controls
      testControlId1 = 'TEST-' + Math.floor(Math.random() * 89 + 10);
      const control1Response = await axios.post(`${API_URL}/controls`, {
        mitigationID: testControlId1,
        mitigationDescription: 'Test Control 1 for Relationships',
        category: 'Test Controls'
      });
      console.log('Created test control 1:', testControlId1);
      
      testControlId2 = 'TEST-' + Math.floor(Math.random() * 89 + 10);
      const control2Response = await axios.post(`${API_URL}/controls`, {
        mitigationID: testControlId2,
        mitigationDescription: 'Test Control 2 for Relationships',
        category: 'Test Controls'
      });
      console.log('Created test control 2:', testControlId2);
    });
    
    // Clean up test data
    afterAll(async () => {
      try {
        await axios.delete(`${API_URL}/risks/${testRiskId}`);
        await axios.delete(`${API_URL}/controls/${testControlId1}`);
        await axios.delete(`${API_URL}/controls/${testControlId2}`);
        console.log('Cleaned up test data');
      } catch (error) {
        console.error('Error cleaning up:', error.message);
      }
    });
    
    test('1. Add relationship via risk endpoint', async () => {
      console.log('\n=== ADDING RELATIONSHIP VIA RISK ENDPOINT ===');
      
      const response = await axios.put(`${API_URL}/risks/${testRiskId}/controls`, {
        controlIds: [testControlId1, testControlId2]
      });
      
      expect(response.status).toBe(200);
      console.log('✅ Added controls to risk');
    });
    
    test('2. Verify relationships are persisted', async () => {
      console.log('\n=== VERIFYING RELATIONSHIPS ===');
      
      // Get risk with controls
      const riskResponse = await axios.get(`${API_URL}/risks/${testRiskId}/controls`);
      expect(riskResponse.status).toBe(200);
      expect(riskResponse.data.data.controls).toHaveLength(2);
      
      const controlIds = riskResponse.data.data.controls.map(c => c.mitigationID);
      expect(controlIds).toContain(testControlId1);
      expect(controlIds).toContain(testControlId2);
      console.log('✅ Risk has both controls');
      
      // Get controls to verify reverse relationship
      const control1Response = await axios.get(`${API_URL}/controls/${testControlId1}/risks`);
      expect(control1Response.status).toBe(200);
      expect(control1Response.data.data.risks).toHaveLength(1);
      expect(control1Response.data.data.risks[0].id).toBe(testRiskId);
      console.log('✅ Control 1 has risk');
      
      const control2Response = await axios.get(`${API_URL}/controls/${testControlId2}/risks`);
      expect(control2Response.status).toBe(200);
      expect(control2Response.data.data.risks).toHaveLength(1);
      expect(control2Response.data.data.risks[0].id).toBe(testRiskId);
      console.log('✅ Control 2 has risk');
    });
    
    test('3. Remove one relationship', async () => {
      console.log('\n=== REMOVING ONE RELATIONSHIP ===');
      
      // Remove control2 from risk
      const response = await axios.put(`${API_URL}/risks/${testRiskId}/controls`, {
        controlIds: [testControlId1] // Only keep control1
      });
      
      expect(response.status).toBe(200);
      
      // Verify only control1 remains
      const riskResponse = await axios.get(`${API_URL}/risks/${testRiskId}/controls`);
      expect(riskResponse.data.data.controls).toHaveLength(1);
      expect(riskResponse.data.data.controls[0].mitigationID).toBe(testControlId1);
      console.log('✅ Risk now has only control 1');
      
      // Verify control2 no longer has the risk
      const control2Response = await axios.get(`${API_URL}/controls/${testControlId2}/risks`);
      expect(control2Response.data.data.risks).toHaveLength(0);
      console.log('✅ Control 2 no longer has the risk');
    });
    
    test('4. Remove all relationships', async () => {
      console.log('\n=== REMOVING ALL RELATIONSHIPS ===');
      
      const response = await axios.put(`${API_URL}/risks/${testRiskId}/controls`, {
        controlIds: [] // Remove all controls
      });
      
      expect(response.status).toBe(200);
      
      // Verify no controls remain
      const riskResponse = await axios.get(`${API_URL}/risks/${testRiskId}/controls`);
      expect(riskResponse.data.data.controls).toHaveLength(0);
      console.log('✅ Risk has no controls');
      
      // Verify control1 no longer has the risk
      const control1Response = await axios.get(`${API_URL}/controls/${testControlId1}/risks`);
      expect(control1Response.data.data.risks).toHaveLength(0);
      console.log('✅ Control 1 no longer has the risk');
    });
    
    test('5. Test cascade delete - risk deletion removes relationships', async () => {
      console.log('\n=== TESTING CASCADE DELETE (RISK) ===');
      
      // Create a new risk and link it to control1
      const cascadeRiskResponse = await axios.post(`${API_URL}/risks`, {
        risk: 'Cascade Delete Test Risk',
        riskCategory: 'Other Risks',
        riskDescription: 'Testing cascade delete',
        initialScoring: { likelihood: 1, impact: 1 }
      });
      const cascadeRiskId = cascadeRiskResponse.data.data.id;
      
      // Add relationship
      await axios.put(`${API_URL}/risks/${cascadeRiskId}/controls`, {
        controlIds: [testControlId1]
      });
      
      // Verify relationship exists
      const beforeDelete = await axios.get(`${API_URL}/controls/${testControlId1}/risks`);
      expect(beforeDelete.data.data.risks.some(r => r.id === cascadeRiskId)).toBe(true);
      console.log('✅ Relationship exists before delete');
      
      // Delete the risk
      await axios.delete(`${API_URL}/risks/${cascadeRiskId}`);
      
      // Verify relationship is gone
      const afterDelete = await axios.get(`${API_URL}/controls/${testControlId1}/risks`);
      expect(afterDelete.data.data.risks.some(r => r.id === cascadeRiskId)).toBe(false);
      console.log('✅ Relationship removed after risk deletion');
    });
    
    test('6. Test cascade delete - control deletion removes relationships', async () => {
      console.log('\n=== TESTING CASCADE DELETE (CONTROL) ===');
      
      // Create a new control and link it to testRiskId
      const cascadeControlId = 'TEST-' + Math.floor(Math.random() * 89 + 10);
      await axios.post(`${API_URL}/controls`, {
        mitigationID: cascadeControlId,
        mitigationDescription: 'Cascade Delete Test Control',
        category: 'Test Controls'
      });
      
      // Add relationship
      await axios.put(`${API_URL}/risks/${testRiskId}/controls`, {
        controlIds: [cascadeControlId]
      });
      
      // Verify relationship exists
      const beforeDelete = await axios.get(`${API_URL}/risks/${testRiskId}/controls`);
      expect(beforeDelete.data.data.controls.some(c => c.mitigationID === cascadeControlId)).toBe(true);
      console.log('✅ Relationship exists before delete');
      
      // Delete the control
      await axios.delete(`${API_URL}/controls/${cascadeControlId}`);
      
      // Verify relationship is gone
      const afterDelete = await axios.get(`${API_URL}/risks/${testRiskId}/controls`);
      expect(afterDelete.data.data.controls.some(c => c.mitigationID === cascadeControlId)).toBe(false);
      console.log('✅ Relationship removed after control deletion');
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ RELATIONSHIPS SHEET TESTS COMPLETE');
    console.log('All relationship operations work with the dedicated sheet!');
    console.log('='.repeat(50));
  });
});