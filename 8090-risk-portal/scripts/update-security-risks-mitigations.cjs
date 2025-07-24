#!/usr/bin/env node

/**
 * Script to update agreed mitigations for security-related risks
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

const RISK_UPDATES = [
  {
    riskName: 'Hackers Abuse In-House GenAI Solutions',
    newAgreedMitigation: `**Defence-in-Depth architecture:**  
• **Secure Application Gateway / WAF (SEC-06)** with auth & rate-limiting :contentReference[oaicite:13]{index=13}.  
• **Input/Output sanitisation & validation (SEC-07)** against DPI / IPI.  
• **Secure RAG data-pipeline with integrity checks** (checksums) :contentReference[oaicite:14]{index=14}.  
• **Infrastructure isolation (SEC-01)** retained.  
• **Red-teaming & WAPT** after every significant change :contentReference[oaicite:15]{index=15}.  
• **Certificate-management (SEC-08)** for all services :contentReference[oaicite:16]{index=16}.  
• Continuous log-analytics for anomaly detection.`
  },
  {
    riskName: 'Unauthorized Information Access via LLMs',
    newAgreedMitigation: `**Attribute-Based Access Control (SEC-09)** with real-time permission checks on vector index :contentReference[oaicite:17]{index=17}.  
**Comprehensive audit trail (LOG-03)** linking every retrieval to user & document.  
**Managerial approval workflow** for broad data-access requests.  
**Quarterly pen-tests with low-privilege accounts** to verify controls.  
**Privacy Office audits** to ensure data-minimisation & policy compliance :contentReference[oaicite:18]{index=18}.`
  }
];

/**
 * Find a risk by name
 */
async function findRiskByName(riskName) {
  try {
    console.log(`🔍 Searching for risk: "${riskName}"`);
    
    const response = await axios.get(`${API_BASE_URL}/api/v1/risks`, {
      params: {
        limit: 1000
      }
    });
    
    if (!response.data.success) {
      throw new Error(`API returned error: ${response.data.message}`);
    }
    
    const risks = response.data.data.risks || response.data.data;
    const foundRisk = risks.find(risk => 
      risk.risk === riskName || 
      risk.riskName === riskName ||
      risk.risk?.trim() === riskName.trim()
    );
    
    if (!foundRisk) {
      console.log(`❌ Risk not found: "${riskName}"`);
      return null;
    }
    
    console.log(`✅ Found risk: "${foundRisk.risk || foundRisk.riskName}" (ID: ${foundRisk.id})`);
    console.log(`📋 Current agreed mitigation:\n${foundRisk.agreedMitigation}\n`);
    return foundRisk;
    
  } catch (error) {
    console.error(`❌ Error finding risk "${riskName}":`, error.message);
    return null;
  }
}

/**
 * Update a risk's agreed mitigation
 */
async function updateRiskMitigation(riskId, newMitigation, riskName) {
  try {
    console.log(`🔄 Updating agreed mitigation for risk ID: ${riskId}`);
    console.log(`📝 New mitigation:\n${newMitigation}\n`);
    
    const response = await axios.patch(`${API_BASE_URL}/api/v1/risks/${riskId}`, {
      agreedMitigation: newMitigation
    });
    
    if (!response.data.success) {
      throw new Error(`API returned error: ${response.data.message}`);
    }
    
    console.log(`✅ Successfully updated agreed mitigation for "${riskName}"`);
    return response.data;
    
  } catch (error) {
    console.error(`❌ Error updating risk "${riskName}":`, error.message);
    if (error.response) {
      console.error(`HTTP ${error.response.status}: ${error.response.statusText}`);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting security risks mitigation update');
  console.log(`📡 API Base URL: ${API_BASE_URL}`);
  console.log(`📝 Risks to update: ${RISK_UPDATES.length}\n`);
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const update of RISK_UPDATES) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing: ${update.riskName}`);
    console.log(`${'='.repeat(60)}\n`);
    
    // Find the risk
    const risk = await findRiskByName(update.riskName);
    if (!risk) {
      console.error(`❌ Failed to find risk: ${update.riskName}`);
      failureCount++;
      continue;
    }
    
    // Update the risk
    const result = await updateRiskMitigation(
      risk.id, 
      update.newAgreedMitigation, 
      update.riskName
    );
    
    if (result) {
      successCount++;
    } else {
      failureCount++;
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 Update Summary:');
  console.log(`✅ Successful updates: ${successCount}`);
  console.log(`❌ Failed updates: ${failureCount}`);
  console.log(`${'='.repeat(60)}`);
  
  if (failureCount > 0) {
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});