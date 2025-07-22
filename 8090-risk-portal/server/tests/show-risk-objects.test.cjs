/**
 * Show actual risk objects during lifecycle
 */

require('dotenv').config();
const { TestSetup } = require('./setup.cjs');
const GoogleDrivePersistenceProvider = require('../persistence/GoogleDrivePersistenceProvider.cjs');
const { generateRiskId } = require('../utils/idGenerator.cjs');

async function showRiskObjects() {
  console.log('=== SHOWING ACTUAL RISK OBJECTS ===\n');
  
  const testSetup = new TestSetup();
  let provider;
  
  try {
    // Initialize
    await testSetup.initialize();
    provider = new GoogleDrivePersistenceProvider(
      testSetup.getDriveService(),
      testSetup.getTestFileId()
    );
    
    // Show existing risks first
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('EXISTING RISKS IN THE SYSTEM');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const existingRisks = await provider.getAllRisks();
    console.log(`Total existing risks: ${existingRisks.length}\n`);
    
    // Show first 2 existing risks as examples
    console.log('Example Risk 1:');
    console.log(JSON.stringify(existingRisks[0], null, 2));
    
    console.log('\nExample Risk 2:');
    console.log(JSON.stringify(existingRisks[1], null, 2));
    
    // Create a new risk
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('CREATING NEW RISK');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const testRiskName = '[TEST] Autonomous AI Decision Making Risk';
    const testRiskId = generateRiskId(testRiskName);
    
    const newRisk = {
      id: testRiskId,
      risk: testRiskName,
      riskCategory: 'AI Human Impact Risks',
      riskDescription: 'AI systems making critical decisions without human oversight could lead to harmful outcomes',
      initialScoring: {
        likelihood: 5,
        impact: 5,
        riskLevel: 25,
        riskLevelCategory: 'Very High'
      },
      exampleMitigations: 'Implement human-in-the-loop systems, establish decision boundaries, audit trails',
      agreedMitigation: 'Mandatory human approval for high-stakes decisions',
      proposedOversightOwnership: ['Ethics Committee', 'Risk Management'],
      proposedSupport: ['AI Engineering', 'Legal', 'Compliance'],
      notes: 'Especially critical for healthcare, financial, and legal decisions',
      residualScoring: {
        likelihood: 2,
        impact: 4,
        riskLevel: 8,
        riskLevelCategory: 'Medium'
      },
      relatedControlIds: [],
      riskReduction: 17,
      riskReductionPercentage: 68,
      mitigationEffectiveness: 'Medium',
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    console.log('Risk object being created:');
    console.log(JSON.stringify(newRisk, null, 2));
    
    const createdRisk = await provider.createRisk(newRisk);
    
    // Retrieve and show the created risk
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('RISK AFTER CREATION (from database)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const afterCreate = await provider.getRiskById(testRiskId);
    console.log(JSON.stringify(afterCreate, null, 2));
    
    // Update the risk
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('UPDATING RISK');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const updatedRisk = {
      ...afterCreate,
      riskDescription: afterCreate.riskDescription + ' - UPDATED: Including bias in AI decision-making algorithms',
      residualScoring: {
        likelihood: 1,
        impact: 3,
        riskLevel: 3,
        riskLevelCategory: 'Low'
      },
      agreedMitigation: afterCreate.agreedMitigation + ', Implement fairness metrics and bias detection',
      notes: afterCreate.notes + ' - UPDATED: Added algorithmic bias considerations',
      relatedControlIds: ['GOV-01', 'ACC-02'],
      lastUpdated: new Date().toISOString()
    };
    
    console.log('Updated risk object being sent:');
    console.log(JSON.stringify(updatedRisk, null, 2));
    
    await provider.updateRisk(testRiskId, updatedRisk);
    
    // Show risk after update
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('RISK AFTER UPDATE (from database)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const afterUpdate = await provider.getRiskById(testRiskId);
    console.log(JSON.stringify(afterUpdate, null, 2));
    
    // Show what changed
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('CHANGES COMPARISON');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('Description changed:');
    console.log(`BEFORE: ${afterCreate.riskDescription}`);
    console.log(`AFTER:  ${afterUpdate.riskDescription}`);
    
    console.log('\nResidual Risk changed:');
    console.log(`BEFORE: Level ${afterCreate.residualScoring.riskLevel} (${afterCreate.residualScoring.riskLevelCategory})`);
    console.log(`AFTER:  Level ${afterUpdate.residualScoring.riskLevel} (${afterUpdate.residualScoring.riskLevelCategory})`);
    
    console.log('\nMitigation changed:');
    console.log(`BEFORE: ${afterCreate.agreedMitigation}`);
    console.log(`AFTER:  ${afterUpdate.agreedMitigation}`);
    
    console.log('\nRelated Controls changed:');
    console.log(`BEFORE: ${JSON.stringify(afterCreate.relatedControlIds)}`);
    console.log(`AFTER:  ${JSON.stringify(afterUpdate.relatedControlIds)}`);
    
    // Delete the risk
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('DELETING RISK');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log(`Deleting risk with ID: ${testRiskId}`);
    await provider.deleteRisk(testRiskId);
    
    // Try to retrieve deleted risk
    try {
      await provider.getRiskById(testRiskId);
      console.log('ERROR: Risk still exists!');
    } catch (error) {
      console.log('✅ Risk successfully deleted (404 error received)');
      console.log(`Error details: ${error.message}`);
    }
    
    // Final count
    const finalRisks = await provider.getAllRisks();
    console.log(`\nFinal risk count: ${finalRisks.length} (should be same as start: ${existingRisks.length})`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    // Cleanup
    await testSetup.cleanup();
  }
}

// Run the test
showRiskObjects().catch(console.error);