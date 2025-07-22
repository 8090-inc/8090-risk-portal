/**
 * Persistent End-to-End Integration Test
 * Creates test data and LEAVES IT in Google Drive for verification
 */

// Load test environment variables first
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env.test') });

const { spawn } = require('child_process');
const axios = require('axios');

// Test configuration
const SERVER_PORT = 8083;
const BASE_URL = `http://localhost:${SERVER_PORT}`;
const API_URL = `${BASE_URL}/api/v1`;

// Set environment for test server
process.env.PORT = SERVER_PORT;
process.env.NODE_ENV = 'test';

describe('Persistent E2E Test - KEEPS DATA IN GOOGLE DRIVE', () => {
  let serverProcess;
  
  // Start the actual server
  beforeAll(async () => {
    console.log('Starting server on port', SERVER_PORT);
    console.log('Using test file ID:', process.env.GOOGLE_DRIVE_FILE_ID);
    console.log('⚠️  WARNING: This test will CREATE and KEEP data in the test file!');
    
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
  
  describe('Create and Keep Test Data', () => {
    let createdRiskId;
    let createdControlId;
    
    const timestamp = new Date().toISOString();
    const uniqueId = Date.now();
    const testRiskData = {
      risk: `Persistent Test Risk ${uniqueId}`,
      riskCategory: 'Other Risks',
      riskDescription: `This is a persistent test risk created at ${timestamp}. This should remain in the Google Drive file for manual verification.`,
      initialScoring: {
        likelihood: 5,
        impact: 5
      },
      proposedOversightOwnership: ['Test Team'],
      proposedSupport: ['QA Team'],
      agreedMitigation: 'This is test data for verifying Google Drive persistence',
      notes: `Created by persistent E2E test at ${timestamp}`
    };
    
    test('1. CREATE RISK - Will persist in Google Drive', async () => {
      console.log('\n=== CREATING PERSISTENT RISK ===');
      console.log('Risk name:', testRiskData.risk);
      
      const response = await axios.post(`${API_URL}/risks`, testRiskData);
      
      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      
      createdRiskId = response.data.data.id;
      console.log('✅ Created risk with ID:', createdRiskId);
      console.log('Risk details:', JSON.stringify(response.data.data, null, 2));
    });
    
    test('2. UPDATE RISK - Add more information', async () => {
      console.log('\n=== UPDATING PERSISTENT RISK ===');
      
      const updates = {
        residualScoring: {
          likelihood: 3,
          impact: 3
        },
        notes: testRiskData.notes + '\n\nUPDATED: Risk has been reviewed and controls applied.',
        agreedMitigation: testRiskData.agreedMitigation + '\n\nAdditional controls have been implemented.'
      };
      
      const response = await axios.put(`${API_URL}/risks/${createdRiskId}`, updates);
      
      expect(response.status).toBe(200);
      console.log('✅ Risk updated successfully');
      console.log('Updated fields:', JSON.stringify(updates, null, 2));
    });
    
    test('3. CREATE CONTROL - Will persist in Google Drive', async () => {
      console.log('\n=== CREATING PERSISTENT CONTROL ===');
      
      createdControlId = 'TEST-' + Math.floor(Math.random() * 89 + 10);
      const testControlData = {
        mitigationID: createdControlId,
        mitigationDescription: 'Persistent Test Control - DO NOT DELETE',
        category: 'Test Controls',
        implementationStatus: 'Implemented',
        effectiveness: 'High',
        compliance: {
          gdprArticle: 'Art. 32 - Security of processing',
          nist80053: 'AC-1 - Access Control Policy',
          hipaaSafeguard: '§ 164.308(a)(1) - Security Management',
          soc2TSC: 'CC1.1 - Control Environment'
        }
      };
      
      console.log('Control ID:', createdControlId);
      const response = await axios.post(`${API_URL}/controls`, testControlData);
      
      expect(response.status).toBe(201);
      console.log('✅ Created control:', createdControlId);
      console.log('Control details:', JSON.stringify(response.data.data, null, 2));
    });
    
    test('4. LINK CONTROL TO RISK', async () => {
      console.log('\n=== LINKING CONTROL TO RISK ===');
      
      const response = await axios.put(`${API_URL}/risks/${createdRiskId}/controls`, {
        controlIds: [createdControlId]
      });
      
      expect(response.status).toBe(200);
      console.log('✅ Linked control', createdControlId, 'to risk', createdRiskId);
    });
    
    test('5. VERIFY DATA EXISTS', async () => {
      console.log('\n=== VERIFYING PERSISTENT DATA ===');
      
      // Wait a moment for cache to clear
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verify risk exists
      const riskResponse = await axios.get(`${API_URL}/risks/${createdRiskId}`);
      expect(riskResponse.status).toBe(200);
      console.log('✅ Risk exists in Google Drive');
      
      // Verify control exists
      const controlResponse = await axios.get(`${API_URL}/controls/${createdControlId}`);
      expect(controlResponse.status).toBe(200);
      console.log('✅ Control exists in Google Drive');
      
      // Verify relationship
      const riskControlsResponse = await axios.get(`${API_URL}/risks/${createdRiskId}/controls`);
      expect(riskControlsResponse.status).toBe(200);
      expect(riskControlsResponse.data.data.controls).toHaveLength(1);
      expect(riskControlsResponse.data.data.controls[0].mitigationID).toBe(createdControlId);
      console.log('✅ Risk-Control relationship exists');
      
      console.log('\n' + '='.repeat(50));
      console.log('✅ TEST COMPLETE - DATA PERSISTED TO GOOGLE DRIVE');
      console.log('='.repeat(50));
      console.log('\nCreated items:');
      console.log(`- Risk: ${createdRiskId} - "${testRiskData.risk}"`);
      console.log(`- Control: ${createdControlId} - "Persistent Test Control"`);
      console.log('\nGoogle Drive Test File:');
      console.log(`https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_DRIVE_FILE_ID}/edit`);
      console.log('\n⚠️  Remember to manually check the Google Drive file!');
      console.log('='.repeat(50));
    });
  });
});