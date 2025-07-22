/**
 * Test the complete lifecycle of a risk with detailed output
 */

require('dotenv').config();
const assert = require('assert');
const { TestSetup } = require('./setup.cjs');
const GoogleDrivePersistenceProvider = require('../persistence/GoogleDrivePersistenceProvider.cjs');
const { generateRiskId } = require('../utils/idGenerator.cjs');

async function runRiskLifecycleTest() {
  console.log('=== RISK LIFECYCLE TEST ===\n');
  
  const testSetup = new TestSetup();
  let provider;
  let snapshot;
  let testRiskId;
  
  try {
    // Initialize
    console.log('🔧 Initializing test environment...');
    await testSetup.initialize();
    provider = new GoogleDrivePersistenceProvider(
      testSetup.getDriveService(),
      testSetup.getTestFileId()
    );
    
    // Create snapshot
    console.log('📸 Creating snapshot before tests...\n');
    snapshot = await testSetup.createSnapshot();
    
    // Step 1: CREATE RISK
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 1: CREATE NEW RISK');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const testRiskName = '[TEST] AI Model Hallucination Risk';
    testRiskId = generateRiskId(testRiskName);
    
    const newRisk = {
      id: testRiskId,
      risk: testRiskName,
      riskCategory: 'Accuracy',
      riskDescription: 'AI models may generate plausible-sounding but factually incorrect information',
      initialScoring: {
        likelihood: 4,
        impact: 4,
        riskLevel: 16,
        riskLevelCategory: 'High'
      },
      exampleMitigations: 'Implement fact-checking, use RAG architecture',
      agreedMitigation: 'Deploy RAG with validated knowledge base',
      proposedOversightOwnership: ['AI Team', 'Quality Assurance'],
      proposedSupport: ['Engineering', 'Legal'],
      notes: 'Critical risk for customer-facing applications',
      residualScoring: {
        likelihood: 2,
        impact: 3,
        riskLevel: 6,
        riskLevelCategory: 'Medium'
      },
      relatedControlIds: [],
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    console.log('📝 Risk to create:');
    console.log(JSON.stringify(newRisk, null, 2));
    
    const createdRisk = await provider.createRisk(newRisk);
    console.log('\n✅ Risk created successfully!');
    console.log(`ID: ${createdRisk.id}`);
    
    // Verify creation
    const afterCreate = await provider.getRiskById(testRiskId);
    console.log('\n🔍 Verification - Risk after creation:');
    console.log(`- ID: ${afterCreate.id}`);
    console.log(`- Name: ${afterCreate.risk}`);
    console.log(`- Category: ${afterCreate.riskCategory}`);
    console.log(`- Description: ${afterCreate.riskDescription}`);
    console.log(`- Initial Risk Level: ${afterCreate.initialScoring.riskLevel} (${afterCreate.initialScoring.riskLevelCategory})`);
    console.log(`- Residual Risk Level: ${afterCreate.residualScoring.riskLevel} (${afterCreate.residualScoring.riskLevelCategory})`);
    
    // Step 2: UPDATE RISK
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 2: UPDATE RISK');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const updatedRisk = {
      ...afterCreate,
      riskDescription: afterCreate.riskDescription + ' - UPDATED: Now includes deepfakes and synthetic media',
      residualScoring: {
        likelihood: 1,
        impact: 2,
        riskLevel: 2,
        riskLevelCategory: 'Low'
      },
      agreedMitigation: afterCreate.agreedMitigation + ' + Add watermarking for AI-generated content',
      notes: afterCreate.notes + ' - UPDATE: Added deepfake detection requirements',
      lastUpdated: new Date().toISOString()
    };
    
    console.log('📝 Updates to apply:');
    console.log('- Description: Adding deepfakes and synthetic media');
    console.log('- Residual Risk: 6 → 2 (Medium → Low)');
    console.log('- Mitigation: Adding watermarking requirement');
    console.log('- Notes: Adding deepfake detection requirements');
    
    await provider.updateRisk(testRiskId, updatedRisk);
    console.log('\n✅ Risk updated successfully!');
    
    // Verify update
    const afterUpdate = await provider.getRiskById(testRiskId);
    console.log('\n🔍 Verification - Risk after update:');
    console.log(`- Description: ${afterUpdate.riskDescription}`);
    console.log(`- Residual Risk Level: ${afterUpdate.residualScoring.riskLevel} (${afterUpdate.residualScoring.riskLevelCategory})`);
    console.log(`- Agreed Mitigation: ${afterUpdate.agreedMitigation}`);
    console.log(`- Notes: ${afterUpdate.notes}`);
    
    console.log('\n📊 Changes summary:');
    console.log(`- Description ${afterCreate.riskDescription.includes('deepfakes') ? '❌' : '✅'} → ${afterUpdate.riskDescription.includes('deepfakes') ? '✅' : '❌'} (deepfakes added)`);
    console.log(`- Residual Risk: ${afterCreate.residualScoring.riskLevel} → ${afterUpdate.residualScoring.riskLevel}`);
    console.log(`- Risk Category: ${afterCreate.residualScoring.riskLevelCategory} → ${afterUpdate.residualScoring.riskLevelCategory}`);
    
    // Step 3: DELETE RISK
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 3: DELETE RISK');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log(`🗑️  Deleting risk: ${testRiskId}`);
    await provider.deleteRisk(testRiskId);
    console.log('✅ Risk deleted successfully!');
    
    // Verify deletion
    try {
      await provider.getRiskById(testRiskId);
      console.log('❌ ERROR: Risk still exists after deletion!');
      assert.fail('Risk should not exist after deletion');
    } catch (error) {
      if (error.statusCode === 404) {
        console.log('✅ Verification: Risk no longer exists (404 error as expected)');
      } else {
        throw error;
      }
    }
    
    // Final verification
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('FINAL VERIFICATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const allRisks = await provider.getAllRisks();
    const testRiskStillExists = allRisks.find(r => r.id === testRiskId);
    
    if (testRiskStillExists) {
      console.log('❌ ERROR: Test risk still in the list!');
      assert.fail('Test risk should not be in the list');
    } else {
      console.log('✅ Confirmed: Test risk completely removed from the system');
      console.log(`✅ Total risks in system: ${allRisks.length}`);
    }
    
    console.log('\n🎉 ALL TESTS PASSED!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    throw error;
  } finally {
    // Cleanup
    try {
      console.log('\n🧹 Cleaning up...');
      await testSetup.cleanup();
      console.log('✅ Cleanup complete');
    } catch (error) {
      console.error('Cleanup failed:', error.message);
    }
  }
}

// Run the test
runRiskLifecycleTest().catch(console.error);