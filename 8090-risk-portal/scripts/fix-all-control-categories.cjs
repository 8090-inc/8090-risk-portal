#!/usr/bin/env node

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Category mapping based on control ID prefix
const CATEGORY_MAPPING = {
  'ACC': 'Accuracy & Judgment',
  'SEC': 'Security & Data Privacy',
  'LOG': 'Audit & Traceability',
  'GOV': 'Governance & Compliance'
};

async function fixAllControlCategories() {
  try {
    console.log('Fetching all controls...');
    
    // Get all controls
    const response = await axios.get(`${API_BASE_URL}/controls?limit=1000`);
    const controls = response.data.data || [];
    
    console.log(`Found ${controls.length} controls to check`);
    
    const results = {
      total: controls.length,
      updated: 0,
      failed: 0,
      alreadyCorrect: 0
    };
    
    // Process each control
    for (const control of controls) {
      const prefix = control.mitigationID.split('-')[0];
      const expectedCategory = CATEGORY_MAPPING[prefix];
      
      if (!expectedCategory) {
        console.warn(`⚠️  Unknown prefix for control ${control.mitigationID}`);
        continue;
      }
      
      if (control.category === expectedCategory) {
        console.log(`✓ ${control.mitigationID} already has correct category: ${expectedCategory}`);
        results.alreadyCorrect++;
        continue;
      }
      
      console.log(`Updating ${control.mitigationID}: "${control.category}" → "${expectedCategory}"`);
      
      try {
        // Update the control with correct category
        const updateData = {
          ...control,
          category: expectedCategory
        };
        
        const updateResponse = await axios.put(`${API_BASE_URL}/controls/${control.mitigationID}`, updateData);
        
        if (updateResponse.data.success) {
          console.log(`✓ Successfully updated ${control.mitigationID}`);
          results.updated++;
        } else {
          console.error(`✗ Failed to update ${control.mitigationID}:`, updateResponse.data.error);
          results.failed++;
        }
      } catch (error) {
        console.error(`✗ Error updating ${control.mitigationID}:`, error.response?.data?.error || error.message);
        results.failed++;
      }
    }
    
    // Print summary
    console.log('\n=== Summary ===');
    console.log(`Total controls: ${results.total}`);
    console.log(`Already correct: ${results.alreadyCorrect}`);
    console.log(`Updated: ${results.updated}`);
    console.log(`Failed: ${results.failed}`);
    
    // Verify specific controls
    console.log('\n=== Verification ===');
    const verifyIds = ['LOG-03', 'GOV-04', 'ACC-04', 'SEC-06'];
    
    for (const id of verifyIds) {
      try {
        const verifyResponse = await axios.get(`${API_BASE_URL}/controls/${id}`);
        const control = verifyResponse.data.data;
        console.log(`${id}: ${control.category}`);
      } catch (error) {
        console.error(`Failed to verify ${id}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data?.error || error.message);
    process.exit(1);
  }
}

// Run the fix
fixAllControlCategories().catch(console.error);