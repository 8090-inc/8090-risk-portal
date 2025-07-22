/**
 * Simple Relationships Test
 * Minimal test to verify relationships sheet functionality
 */

// Load test environment variables first
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env.test') });

const { spawn } = require('child_process');
const axios = require('axios');

// Test configuration
const SERVER_PORT = 8085;
const BASE_URL = `http://localhost:${SERVER_PORT}`;
const API_URL = `${BASE_URL}/api/v1`;

// Set environment for test server
process.env.PORT = SERVER_PORT;
process.env.NODE_ENV = 'test';

describe('Simple Relationships Test', () => {
  let serverProcess;
  
  // Start the actual server
  beforeAll(async () => {
    console.log('Starting server on port', SERVER_PORT);
    console.log('Using test file ID:', process.env.GOOGLE_DRIVE_FILE_ID);
    
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
  
  test('Create risk, control, and link them', async () => {
    const timestamp = Date.now();
    
    // 1. Create a risk
    console.log('\n=== CREATING RISK ===');
    const riskData = {
      risk: `Simple Relationship Test Risk ${timestamp}`,
      riskCategory: 'Other Risks',
      riskDescription: 'Testing relationships functionality',
      initialScoring: { likelihood: 3, impact: 3 }
    };
    
    const riskResponse = await axios.post(`${API_URL}/risks`, riskData);
    expect(riskResponse.status).toBe(201);
    const riskId = riskResponse.data.data.id;
    console.log('✅ Created risk:', riskId);
    
    // 2. Create a control
    console.log('\n=== CREATING CONTROL ===');
    const controlId = 'TEST-' + (90 + Math.floor(Math.random() * 9)); // TEST-90 to TEST-99
    const controlData = {
      mitigationID: controlId,
      mitigationDescription: `Simple Test Control ${timestamp}`,
      category: 'Test Controls',
      implementationStatus: 'Planned'
    };
    
    const controlResponse = await axios.post(`${API_URL}/controls`, controlData);
    expect(controlResponse.status).toBe(201);
    console.log('✅ Created control:', controlId);
    
    // 3. Link them
    console.log('\n=== LINKING CONTROL TO RISK ===');
    const linkResponse = await axios.put(`${API_URL}/risks/${riskId}/controls`, {
      controlIds: [controlId]
    });
    expect(linkResponse.status).toBe(200);
    console.log('✅ Linked control to risk');
    
    // 4. Verify the link exists
    console.log('\n=== VERIFYING RELATIONSHIP ===');
    const verifyResponse = await axios.get(`${API_URL}/risks/${riskId}/controls`);
    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.data.data.controls).toHaveLength(1);
    expect(verifyResponse.data.data.controls[0].mitigationID).toBe(controlId);
    console.log('✅ Relationship verified');
    
    // 5. Clean up
    console.log('\n=== CLEANING UP ===');
    await axios.delete(`${API_URL}/risks/${riskId}`);
    await axios.delete(`${API_URL}/controls/${controlId}`);
    console.log('✅ Cleaned up test data');
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ SIMPLE RELATIONSHIPS TEST PASSED');
    console.log('The relationships sheet is working correctly!');
    console.log('='.repeat(50));
  });
});