#!/usr/bin/env node

/**
 * Script to fix control descriptions that were accidentally replaced with category names
 * This restores the proper mitigation descriptions from the correct mappings
 */

const axios = require('axios');

// Correct control descriptions based on the Google Sheets data
const CORRECT_DESCRIPTIONS = {
  'ACC-01': 'Human-in-the-Loop (HITL) Verification with 21 CFR 11-compliant e-signature for GxP decisions.',
  'ACC-02': 'Training on AI limitations, critical thinking, and independent verification.',
  'ACC-03': 'Implement a Retrieval-Augmented Generation (RAG) architecture grounded in a validated, version-controlled corpus.',
  'SEC-01': 'Implement infrastructure isolation with VPC Service Controls and a Web Application Firewall (WAF).',
  'SEC-02': 'Enforce strict, role-based access controls (RBAC) based on the principle of least privilege.',
  'SEC-03': 'Encrypt all data at rest and in transit using encryption keys.',
  'SEC-04': 'Implement data loss prevention (DLP) to scan and redact sensitive data in prompts/responses.',
  'SEC-05': 'Conduct periodic adversarial testing Red Teaming of the GenAI system.',
  'LOG-01': 'Implement centralized, immutable logging of all user prompts, system responses, and administrative actions.',
  'LOG-02': 'Ensure all AI-generated outputs include precise citations to source GxP documents.',
  'GOV-01': 'Establish a formal AI Governance Committee and a continuous regulatory intelligence program.',
  'GOV-02': 'Enforce vendor contracts with IP indemnification and prohibitions on using Dompé data for training.',
  'GOV-03': 'Implement a Continuous Validation framework integrated into the MLOps pipeline.'
};

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080/api/v1';

async function fixControlDescriptions() {
  try {
    console.log('Fetching all controls...');
    const response = await axios.get(`${API_BASE_URL}/controls`);
    const controls = response.data.data;
    
    console.log(`Found ${controls.length} controls to check\n`);
    
    let updatedCount = 0;
    let failedCount = 0;
    
    for (const control of controls) {
      // Check if this control's description is wrong (contains category-like text)
      const categoryLikeDescriptions = [
        'Behavioral Risks',
        'Security & Data Privacy',
        'Business/Cost Related Risks',
        'Governance & Compliance',
        'Audit & Traceability'
      ];
      
      const hasWrongDescription = categoryLikeDescriptions.includes(control.mitigationDescription);
      const correctDescription = CORRECT_DESCRIPTIONS[control.mitigationID];
      
      if (hasWrongDescription && correctDescription) {
        console.log(`❌ ${control.mitigationID} has wrong description: "${control.mitigationDescription}"`);
        console.log(`   → Updating to: "${correctDescription}"`);
        
        try {
          await axios.put(`${API_BASE_URL}/controls/${control.mitigationID}`, {
            ...control,
            mitigationDescription: correctDescription
          });
          console.log(`   ✓ Updated successfully\n`);
          updatedCount++;
        } catch (error) {
          console.error(`   ✗ Failed to update: ${error.message}\n`);
          failedCount++;
        }
      } else if (!hasWrongDescription && control.mitigationDescription && control.mitigationDescription.length > 20) {
        console.log(`✓ ${control.mitigationID} already has correct description`);
      } else if (!correctDescription && CORRECT_DESCRIPTIONS[control.mitigationID] === undefined) {
        // Control not in our list, probably already has correct description
        console.log(`ℹ ${control.mitigationID} not in correction list, keeping current description`);
      }
    }
    
    console.log('\n=== Summary ===');
    console.log(`Total controls: ${controls.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Failed: ${failedCount}`);
    console.log(`Already correct: ${controls.length - updatedCount - failedCount}`);
    
    // Verify the fix
    if (updatedCount > 0) {
      console.log('\n=== Verification ===');
      const verifyResponse = await axios.get(`${API_BASE_URL}/controls`);
      const verifyControls = verifyResponse.data.data;
      
      ['ACC-01', 'ACC-02', 'SEC-01', 'LOG-01'].forEach(id => {
        const control = verifyControls.find(c => c.mitigationID === id);
        if (control) {
          console.log(`${id}: ${control.mitigationDescription.substring(0, 60)}...`);
        }
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the script
fixControlDescriptions();