/**
 * Real End-to-End Integration Test
 * Tests the actual server with real Google Drive persistence
 */

// Load test environment variables first
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env.test') });

const { spawn } = require('child_process');
const axios = require('axios');

// Test configuration
const SERVER_PORT = 8082;
const BASE_URL = `http://localhost:${SERVER_PORT}`;
const API_URL = `${BASE_URL}/api/v1`;

// Set environment for test server
process.env.PORT = SERVER_PORT;
process.env.NODE_ENV = 'test';

describe('Real E2E Integration with Google Drive', () => {
  let serverProcess;
  
  // Start the actual server
  beforeAll(async () => {
    console.log('Starting real server on port', SERVER_PORT);
    console.log('Using test file ID:', process.env.GOOGLE_DRIVE_FILE_ID);
    
    serverProcess = spawn('node', [path.join(__dirname, '../../../server.cjs')], {
      env: {
        ...process.env,
        PORT: SERVER_PORT,
        NODE_ENV: 'test',
        GOOGLE_DRIVE_FILE_ID: process.env.GOOGLE_DRIVE_FILE_ID // Pass test file ID to server
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
      console.log('Stopping server...');
      serverProcess.kill('SIGTERM');
      await new Promise(resolve => {
        serverProcess.on('exit', resolve);
        setTimeout(resolve, 2000); // Fallback timeout
      });
    }
  });
  
  // Helper function to wait for server to be ready
  async function waitForServer(maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await axios.get(`${BASE_URL}/health`);
        if (response.data.status === 'ok') {
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
  
  describe('Complete Risk Lifecycle with Google Drive Persistence', () => {
    let createdRiskId;
    const testRiskData = {
      risk: 'E2E Integration Test Risk',
      riskCategory: 'Other Risks',
      riskDescription: 'This risk tests real Google Drive persistence',
      initialScoring: {
        likelihood: 4,
        impact: 4
      },
      proposedOversightOwnership: ['E2E Test Owner'],
      proposedSupport: ['E2E Test Team'],
      agreedMitigation: 'E2E test mitigation strategy',
      notes: 'Created by real E2E test at ' + new Date().toISOString()
    };
    
    test('1. CREATE - Should create risk and save to Google Drive', async () => {
      console.log('\n=== CREATE RISK TEST ===');
      console.log('Creating risk:', testRiskData.risk);
      
      const response = await axios.post(`${API_URL}/risks`, testRiskData);
      
      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toMatchObject({
        risk: testRiskData.risk,
        riskCategory: testRiskData.riskCategory,
        riskDescription: testRiskData.riskDescription,
        initialScoring: {
          likelihood: 4,
          impact: 4,
          riskLevel: 16
        }
      });
      
      createdRiskId = response.data.data.id;
      console.log('Created risk with ID:', createdRiskId);
      console.log('Full risk data:', JSON.stringify(response.data.data, null, 2));
    });
    
    test('2. READ - Should retrieve risk from Google Drive (after cache expiry)', async () => {
      console.log('\n=== READ RISK TEST ===');
      console.log('Waiting 6 seconds for cache to expire...');
      await new Promise(resolve => setTimeout(resolve, 6000)); // Wait for 5-minute cache to be bypassed in test
      
      console.log('Reading risk:', createdRiskId);
      const response = await axios.get(`${API_URL}/risks/${createdRiskId}`);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.id).toBe(createdRiskId);
      expect(response.data.data.risk).toBe(testRiskData.risk);
      expect(response.data.data.notes).toBe(testRiskData.notes);
      
      console.log('Successfully read risk from Google Drive');
      console.log('Risk data:', JSON.stringify(response.data.data, null, 2));
    });
    
    test('3. UPDATE - Should update risk and persist to Google Drive', async () => {
      console.log('\n=== UPDATE RISK TEST ===');
      
      const updates = {
        residualScoring: {
          likelihood: 2,
          impact: 3
        },
        notes: 'Updated by E2E test at ' + new Date().toISOString(),
        agreedMitigation: 'Updated mitigation - controls implemented successfully'
      };
      
      console.log('Updating risk with:', JSON.stringify(updates, null, 2));
      const response = await axios.put(`${API_URL}/risks/${createdRiskId}`, updates);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.residualScoring).toMatchObject({
        likelihood: 2,
        impact: 3,
        riskLevel: 6
      });
      expect(response.data.data.notes).toBe(updates.notes);
      expect(response.data.data.agreedMitigation).toBe(updates.agreedMitigation);
      
      console.log('Risk updated successfully');
      console.log('Updated risk:', JSON.stringify(response.data.data, null, 2));
    });
    
    test('4. VERIFY UPDATE - Should read updated data from Google Drive', async () => {
      console.log('\n=== VERIFY UPDATE TEST ===');
      console.log('Waiting 6 seconds for cache to expire...');
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      console.log('Verifying updated risk:', createdRiskId);
      const response = await axios.get(`${API_URL}/risks/${createdRiskId}`);
      
      expect(response.status).toBe(200);
      expect(response.data.data.residualScoring.riskLevel).toBe(6);
      expect(response.data.data.agreedMitigation).toContain('controls implemented successfully');
      
      console.log('Verified - updates persisted to Google Drive');
      console.log('Persisted data:', JSON.stringify(response.data.data, null, 2));
    });
    
    test('5. LIST - Should find risk in list with filters', async () => {
      console.log('\n=== LIST RISKS TEST ===');
      
      const response = await axios.get(`${API_URL}/risks`, {
        params: {
          category: 'Other Risks',
          page: 1,
          limit: 100
        }
      });
      
      expect(response.status).toBe(200);
      const ourRisk = response.data.data.find(r => r.id === createdRiskId);
      expect(ourRisk).toBeDefined();
      expect(ourRisk.risk).toBe(testRiskData.risk);
      
      console.log(`Found our risk in list of ${response.data.data.length} risks`);
      console.log('Our risk:', JSON.stringify(ourRisk, null, 2));
    });
    
    test('6. DELETE - Should delete risk from Google Drive', async () => {
      console.log('\n=== DELETE RISK TEST ===');
      console.log('Deleting risk:', createdRiskId);
      
      const response = await axios.delete(`${API_URL}/risks/${createdRiskId}`);
      expect(response.status).toBe(204);
      
      console.log('Risk deleted successfully');
    });
    
    test('7. VERIFY DELETE - Should not find deleted risk', async () => {
      console.log('\n=== VERIFY DELETE TEST ===');
      console.log('Waiting 6 seconds for cache to expire...');
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      console.log('Trying to read deleted risk:', createdRiskId);
      try {
        await axios.get(`${API_URL}/risks/${createdRiskId}`);
        fail('Should have thrown 404 error');
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.success).toBe(false);
        expect(error.response.data.error.code).toBe('RISK_NOT_FOUND');
        console.log('Confirmed - risk not found in Google Drive');
      }
    });
  });
  
  describe('Control Lifecycle', () => {
    const testControlId = 'TEST-' + (90 + Math.floor(Math.random() * 9));
    const testControlData = {
      mitigationID: testControlId,
      mitigationDescription: '[TEST] Real E2E Test Control',
      category: 'Governance & Compliance',
      implementationStatus: 'In Progress',
      effectiveness: 'Medium',
      implementationNotes: 'E2E test control implementation',
      compliance: {
        gdprArticle: 'Art. 32',
        nist80053: 'SC-1'
      }
    };
    
    test('Should create, update, and delete control', async () => {
      console.log('\n=== CONTROL LIFECYCLE TEST ===');
      
      // Create
      console.log('Creating control:', testControlId);
      const createResponse = await axios.post(`${API_URL}/controls`, testControlData);
      expect(createResponse.status).toBe(201);
      expect(createResponse.data.data.mitigationID).toBe(testControlId);
      
      // Update
      console.log('Updating control effectiveness to High');
      const updateResponse = await axios.put(`${API_URL}/controls/${testControlId}`, {
        effectiveness: 'High',
        implementationStatus: 'Implemented'
      });
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data.data.effectiveness).toBe('High');
      
      // Delete
      console.log('Deleting control:', testControlId);
      const deleteResponse = await axios.delete(`${API_URL}/controls/${testControlId}`);
      expect(deleteResponse.status).toBe(204);
      
      console.log('Control lifecycle completed successfully');
    });
  });
  
  describe('API Features', () => {
    test('Should support pagination', async () => {
      const response = await axios.get(`${API_URL}/risks`, {
        params: { page: 1, limit: 5 }
      });
      
      expect(response.data.meta.page).toBe(1);
      expect(response.data.meta.limit).toBe(5);
      expect(response.data.data.length).toBeLessThanOrEqual(5);
      console.log(`Pagination working: ${response.data.data.length} risks on page 1`);
    });
    
    test('Should provide statistics', async () => {
      const response = await axios.get(`${API_URL}/risks/statistics`);
      
      expect(response.data.data).toHaveProperty('total');
      expect(response.data.data).toHaveProperty('byCategory');
      expect(response.data.data).toHaveProperty('averageResidualRisk');
      console.log('Statistics:', JSON.stringify(response.data.data, null, 2));
    });
  });
});

// Run the test
if (require.main === module) {
  require('jest-cli/bin/jest');
}