#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api/v1';
const TEST_DATA_FILE = path.join(__dirname, '../test-data/updated_it_controls.json');

// Transform the test data to match API format
function transformControl(testControl) {
  return {
    mitigationID: testControl.mitigation_id,
    mitigationDescription: testControl.mitigation_description,
    category: testControl.risk_category === 'Accuracy & Judgement' ? 'Accuracy & Judgment' : testControl.risk_category,
    compliance: {
      cfrPart11Annex11: testControl.cfr_part11_annex11_clause,
      hipaaSafeguard: testControl.hipaa_safeguard,
      gdprArticle: testControl.gdpr_article,
      euAiActArticle: testControl.eu_ai_act_article,
      nist80053: Array.isArray(testControl.nist_800_53_family) ? 
        testControl.nist_800_53_family.join(', ') : 
        testControl.nist_800_53_family,
      soc2TSC: testControl.soc2_tsc
    }
  };
}

// Add control via API
async function addControl(control) {
  try {
    console.log(`\nAdding control ${control.mitigationID}...`);
    console.log('Request body:', JSON.stringify(control, null, 2));
    
    const response = await axios.post(`${API_BASE_URL}/controls`, control);
    
    if (response.data.success) {
      console.log(`✓ Successfully added ${control.mitigationID}`);
      return true;
    } else {
      console.error(`✗ Failed to add ${control.mitigationID}: ${response.data.error}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Failed to add ${control.mitigationID}:`, error.response?.data?.error || error.message);
    return false;
  }
}

// Main execution
async function main() {
  try {
    // Load test data
    console.log('Loading test data...');
    const testData = JSON.parse(await fs.readFile(TEST_DATA_FILE, 'utf8'));
    console.log(`Found ${testData.length} controls to add`);
    
    // Transform and add each control
    const results = [];
    for (const testControl of testData) {
      const control = transformControl(testControl);
      const success = await addControl(control);
      results.push({ control: control.mitigationID, success });
    }
    
    // Summary
    console.log('\n=== Summary ===');
    const successCount = results.filter(r => r.success).length;
    console.log(`Total: ${results.length}`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${results.length - successCount}`);
    
    if (successCount === results.length) {
      console.log('\n✓ All controls added successfully!');
    } else {
      console.log('\nFailed controls:');
      results.filter(r => !r.success).forEach(r => console.log(`  - ${r.control}`));
    }
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);