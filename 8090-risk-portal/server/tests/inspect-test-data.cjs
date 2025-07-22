/**
 * Inspect the actual data in the test Excel file
 */

require('dotenv').config();
const { TestSetup } = require('./setup.cjs');

async function inspectTestData() {
  console.log('=== Inspecting Test Excel File Data ===\n');
  
  const testSetup = new TestSetup();
  
  try {
    // Initialize
    await testSetup.initialize();
    const snapshot = await testSetup.createSnapshot();
    
    // Parse the file
    const { parseRisksFromWorkbook, parseControlsFromWorkbook } = require('../utils/excelParser.cjs');
    const risks = await parseRisksFromWorkbook(snapshot.buffer);
    const controls = await parseControlsFromWorkbook(snapshot.buffer);
    
    console.log('RISKS FOUND:', risks.length);
    console.log('='.repeat(80));
    
    // Show first 5 risks with details
    risks.slice(0, 5).forEach((risk, index) => {
      console.log(`\nRisk ${index + 1}:`);
      console.log('  ID:', risk.id);
      console.log('  Name:', risk.risk);
      console.log('  Category:', risk.riskCategory);
      console.log('  Description:', risk.riskDescription?.substring(0, 100) + '...');
      console.log('  Initial Scoring:', risk.initialScoring);
      console.log('  Related Controls:', risk.relatedControlIds);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('CONTROLS FOUND:', controls.length);
    console.log('='.repeat(80));
    
    // Show first 5 controls with details
    controls.slice(0, 5).forEach((control, index) => {
      console.log(`\nControl ${index + 1}:`);
      console.log('  ID:', control.mitigationID);
      console.log('  Description:', control.mitigationDescription);
      console.log('  Category:', control.category);
      console.log('  Related Risks:', control.relatedRiskIds);
    });
    
    // Check for test data
    console.log('\n' + '='.repeat(80));
    console.log('CHECKING FOR TEST DATA:');
    console.log('='.repeat(80));
    
    const testRisks = risks.filter(r => 
      r.risk?.includes('[TEST]') || 
      r.riskDescription?.includes('[TEST]')
    );
    console.log('Test risks found:', testRisks.length);
    
    const testControls = controls.filter(c => 
      c.mitigationID?.startsWith('TEST-')
    );
    console.log('Test controls found:', testControls.length);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

inspectTestData().catch(console.error);