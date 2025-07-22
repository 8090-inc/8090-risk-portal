/**
 * Tests for GoogleDrivePersistenceProvider
 */

require('dotenv').config();
const assert = require('assert');
const { TestSetup, TEST_RISK_PREFIX, TEST_CONTROL_PATTERN } = require('./setup.cjs');
const GoogleDrivePersistenceProvider = require('../persistence/GoogleDrivePersistenceProvider.cjs');
const { generateRiskId } = require('../utils/idGenerator.cjs');

async function runPersistenceTests() {
  console.log('=== PERSISTENCE PROVIDER TESTS ===\n');
  
  const testSetup = new TestSetup();
  let provider;
  let snapshot;
  let passed = 0;
  let failed = 0;
  
  async function test(name, fn) {
    console.log(`\nTest: ${name}`);
    console.log('-'.repeat(60));
    try {
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (error) {
      console.log('❌ FAILED');
      console.log('Error:', error.message);
      console.log('Stack:', error.stack);
      failed++;
    }
  }
  
  try {
    // Initialize test environment
    console.log('Initializing test environment...');
    await testSetup.initialize();
    provider = new GoogleDrivePersistenceProvider(
      testSetup.getDriveService(),
      testSetup.getTestFileId()
    );
    
    // Create snapshot before tests
    console.log('Creating snapshot before tests...');
    snapshot = await testSetup.createSnapshot();
    console.log('Snapshot created\n');
    
    // READ TESTS
    await test('Get all risks', async () => {
      const risks = await provider.getAllRisks();
      console.log(`Found ${risks.length} risks`);
      assert(Array.isArray(risks));
      assert(risks.length > 0);
      assert(risks[0].id);
      assert(risks[0].risk);
    });
    
    await test('Get risk by ID', async () => {
      const risks = await provider.getAllRisks();
      const firstRisk = risks[0];
      const retrieved = await provider.getRiskById(firstRisk.id);
      console.log(`Retrieved risk: ${retrieved.risk}`);
      assert.strictEqual(retrieved.id, firstRisk.id);
      assert.strictEqual(retrieved.risk, firstRisk.risk);
    });
    
    await test('Get non-existent risk throws 404', async () => {
      try {
        await provider.getRiskById('RISK-NONEXISTENT-9999');
        assert.fail('Should have thrown 404 error');
      } catch (error) {
        assert.strictEqual(error.statusCode, 404);
        assert.strictEqual(error.code, 'RISK_NOT_FOUND');
        console.log('Correctly threw 404 error');
      }
    });
    
    await test('Get all controls', async () => {
      const controls = await provider.getAllControls();
      console.log(`Found ${controls.length} controls`);
      assert(Array.isArray(controls));
      assert(controls.length > 0);
      assert(controls[0].mitigationID);
    });
    
    await test('Get control by ID', async () => {
      const controls = await provider.getAllControls();
      const firstControl = controls[0];
      const retrieved = await provider.getControlById(firstControl.mitigationID);
      console.log(`Retrieved control: ${retrieved.mitigationID}`);
      assert.strictEqual(retrieved.mitigationID, firstControl.mitigationID);
    });
    
    // CREATE TESTS
    await test('Create new risk', async () => {
      const testRisk = {
        id: generateRiskId(`${TEST_RISK_PREFIX} Test Risk Creation`),
        risk: `${TEST_RISK_PREFIX} Test Risk Creation`,
        riskCategory: 'Other Risks',
        riskDescription: `${TEST_RISK_PREFIX} This is a test risk created by automated testing`,
        initialScoring: {
          likelihood: 3,
          impact: 3,
          riskLevel: 9,
          riskLevelCategory: 'Medium'
        },
        residualScoring: {
          likelihood: 2,
          impact: 2,
          riskLevel: 4,
          riskLevelCategory: 'Low'
        },
        relatedControlIds: [],
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      const created = await provider.createRisk(testRisk);
      console.log(`Created risk: ${created.id}`);
      assert.strictEqual(created.id, testRisk.id);
      
      // Verify it exists
      const retrieved = await provider.getRiskById(created.id);
      assert.strictEqual(retrieved.risk, testRisk.risk);
    });
    
    await test('Create duplicate risk throws error', async () => {
      const risks = await provider.getAllRisks();
      const existingRisk = risks[0];
      
      try {
        await provider.createRisk(existingRisk);
        assert.fail('Should have thrown duplicate error');
      } catch (error) {
        assert.strictEqual(error.statusCode, 422);
        assert.strictEqual(error.code, 'DUPLICATE_RISK_NAME');
        console.log('Correctly threw duplicate error');
      }
    });
    
    await test('Create new control', async () => {
      const testControl = {
        mitigationID: 'TEST-99',
        mitigationDescription: `${TEST_RISK_PREFIX} Test control`,
        category: 'Test Category',
        relatedRiskIds: [],
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      const created = await provider.createControl(testControl);
      console.log(`Created control: ${created.mitigationID}`);
      assert.strictEqual(created.mitigationID, testControl.mitigationID);
    });
    
    // UPDATE TESTS
    await test('Update risk', async () => {
      // First create a risk to update
      const riskToUpdate = {
        id: generateRiskId(`${TEST_RISK_PREFIX} Risk For Update`),
        risk: `${TEST_RISK_PREFIX} Risk For Update`,
        riskCategory: 'Other Risks',
        riskDescription: 'Original description',
        initialScoring: { likelihood: 3, impact: 3, riskLevel: 9, riskLevelCategory: 'Medium' },
        residualScoring: { likelihood: 2, impact: 2, riskLevel: 4, riskLevelCategory: 'Low' },
        relatedControlIds: [],
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      const created = await provider.createRisk(riskToUpdate);
      console.log(`Created risk for update test: ${created.id}`);
      
      const testRisk = created;
      
      const updated = {
        ...testRisk,
        riskDescription: testRisk.riskDescription + ' - UPDATED',
        lastUpdated: new Date().toISOString()
      };
      
      const result = await provider.updateRisk(testRisk.id, updated);
      console.log(`Updated risk: ${result.id}`);
      
      // Verify update
      const retrieved = await provider.getRiskById(testRisk.id);
      assert(retrieved.riskDescription.includes('UPDATED'));
    });
    
    // RELATIONSHIP TESTS
    await test('Build relationships from control data', async () => {
      const risks = await provider.getAllRisks();
      const controls = await provider.getAllControls();
      
      // Find a control with related risks
      const controlWithRisks = controls.find(c => c.relatedRiskIds && c.relatedRiskIds.length > 0);
      
      if (controlWithRisks) {
        console.log(`Control ${controlWithRisks.mitigationID} has ${controlWithRisks.relatedRiskIds.length} related risks`);
        
        // Check if risk has this control in its relatedControlIds
        const relatedRisk = risks.find(r => controlWithRisks.relatedRiskIds.includes(r.id));
        if (relatedRisk) {
          console.log(`Risk ${relatedRisk.id} has ${relatedRisk.relatedControlIds.length} related controls`);
          // Note: This might be empty because relationships are built from control data
        }
      } else {
        console.log('No controls with related risks found');
      }
    });
    
    // TRANSACTION TESTS
    await test('Transaction rollback', async () => {
      await provider.beginTransaction();
      
      const testRisk = {
        id: generateRiskId(`${TEST_RISK_PREFIX} Transaction Test`),
        risk: `${TEST_RISK_PREFIX} Transaction Test`,
        riskCategory: 'Other Risks',
        riskDescription: 'Should be rolled back',
        initialScoring: { likelihood: 1, impact: 1, riskLevel: 1, riskLevelCategory: 'Low' },
        residualScoring: { likelihood: 1, impact: 1, riskLevel: 1, riskLevelCategory: 'Low' },
        relatedControlIds: []
      };
      
      await provider.createRisk(testRisk);
      console.log('Created risk in transaction');
      
      await provider.rollbackTransaction();
      console.log('Rolled back transaction');
      
      // Verify risk doesn't exist
      try {
        await provider.getRiskById(testRisk.id);
        assert.fail('Risk should not exist after rollback');
      } catch (error) {
        assert.strictEqual(error.statusCode, 404);
        console.log('Risk correctly not found after rollback');
      }
    });
    
    // DELETE TESTS (run last)
    await test('Delete risk', async () => {
      // First create a risk to delete
      const riskToDelete = {
        id: generateRiskId(`${TEST_RISK_PREFIX} Risk For Deletion`),
        risk: `${TEST_RISK_PREFIX} Risk For Deletion`,
        riskCategory: 'Other Risks',
        riskDescription: 'This risk will be deleted',
        initialScoring: { likelihood: 1, impact: 1, riskLevel: 1, riskLevelCategory: 'Low' },
        residualScoring: { likelihood: 1, impact: 1, riskLevel: 1, riskLevelCategory: 'Low' },
        relatedControlIds: [],
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      const created = await provider.createRisk(riskToDelete);
      console.log(`Created risk for deletion test: ${created.id}`);
      
      const testRisk = created;
      
      await provider.deleteRisk(testRisk.id);
      console.log(`Deleted risk: ${testRisk.id}`);
      
      // Verify deletion
      try {
        await provider.getRiskById(testRisk.id);
        assert.fail('Risk should not exist after deletion');
      } catch (error) {
        assert.strictEqual(error.statusCode, 404);
        console.log('Risk correctly deleted');
      }
    });
    
    await test('Delete control', async () => {
      // First create a control to delete
      const controlToDelete = {
        mitigationID: 'TEST-98',
        mitigationDescription: `${TEST_RISK_PREFIX} Control for deletion`,
        category: 'Test Category',
        relatedRiskIds: [],
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      const created = await provider.createControl(controlToDelete);
      console.log(`Created control for deletion test: ${created.mitigationID}`);
      
      const testControl = created;
      
      await provider.deleteControl(testControl.mitigationID);
      console.log(`Deleted control: ${testControl.mitigationID}`);
      
      // Verify deletion
      try {
        await provider.getControlById(testControl.mitigationID);
        assert.fail('Control should not exist after deletion');
      } catch (error) {
        assert.strictEqual(error.statusCode, 404);
        console.log('Control correctly deleted');
      }
    });
    
  } catch (error) {
    console.error('\n❌ Test setup failed:', error);
    failed++;
  } finally {
    // Clean up and restore snapshot
    try {
      console.log('\nCleaning up test data...');
      await testSetup.cleanup();
      console.log('Cleanup complete');
    } catch (error) {
      console.error('Cleanup failed:', error.message);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`Tests passed: ${passed}`);
    console.log(`Tests failed: ${failed}`);
    console.log('='.repeat(60));
    
    if (failed > 0) {
      process.exit(1);
    }
  }
}

// Run tests
runPersistenceTests().catch(console.error);