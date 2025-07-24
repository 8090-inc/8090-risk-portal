#!/usr/bin/env node

/**
 * Script to update the agreed mitigation for "Sensitive Information Leakage" risk
 * Based on the git-style diff provided
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';
const DRY_RUN = process.env.DRY_RUN !== 'false'; // Default to true for safety

const RISK_NAME = 'Sensitive Information Leakage';

// Updated mitigation content based on the provided diff
const NEW_MITIGATION = `Zero-Trust Data Protection Architecture:  
• **Private, segregated VPC** – no vendor training on Dompé data.  
• **Three-layer DLP (network, API, AWS Macie)** blocks PII/PHI exfiltration.  
• **Attribute-Based Access Control (ABAC)** integrated with Entra ID; the retrieval layer filters vector search results by the caller's document entitlements. Quarterly least-privilege review and automatic entitlement expiry.
• **Immutable audit trail for every prompt & response** (21 CFR 11.10(e)); tamper-evident storage for forensic analysis.
• **Input/Output sanitisation & prompt-injection defences** (SEC-06): guard-rail models, similarity checks, response monitoring; blocks accidental or malicious leakage.
• **Secure RAG data-pipeline integrity** (SEC-07): SHA-256 checksums, approval-only ingestion, dedicated SharePoint staging site to confine corpus scope and prevent poisoning.
• **Certificate management & API gateway** (SEC-08 & SEC-11): WAF front-end with mutual-TLS; Dompé-owned certificates, auto-rotation, rate-limiting.
• **Customer-Managed Encryption Keys (CMKs)** with 90-day rotation; keys stored in HSM-backed KMS.
• **Data-retention & secure-deletion controls** (SEC-10): enforce retention schedule, admin purge tooling, GDPR Art 5(1)(e) compliance.
• **GDPR DPIA & DPA/BAA review** for any new use of sensitive data.`;

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
      console.log(`Available risks: ${risks.map(r => r.risk || r.riskName).slice(0, 5).join(', ')}...`);
      return null;
    }
    
    console.log(`✅ Found risk: "${foundRisk.risk || foundRisk.riskName}" (ID: ${foundRisk.id})`);
    return foundRisk;
    
  } catch (error) {
    console.error(`❌ Error finding risk "${riskName}":`, error.message);
    return null;
  }
}

/**
 * Update a risk's agreed mitigation
 */
async function updateRiskMitigation(riskId, newMitigation) {
  try {
    console.log(`🔄 Updating agreed mitigation for risk ID: ${riskId}`);
    
    if (DRY_RUN) {
      console.log(`🔍 DRY RUN: Would update "${RISK_NAME}" with enhanced mitigation`);
      return { success: true, dryRun: true };
    }
    
    const response = await axios.patch(`${API_BASE_URL}/api/v1/risks/${riskId}`, {
      agreedMitigation: newMitigation
    });
    
    if (!response.data.success) {
      throw new Error(`API returned error: ${response.data.message}`);
    }
    
    console.log(`✅ Successfully updated agreed mitigation for "${RISK_NAME}"`);
    return response.data;
    
  } catch (error) {
    console.error(`❌ Error updating risk "${RISK_NAME}":`, error.message);
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
  console.log('🚀 Updating Sensitive Information Leakage mitigation');
  console.log(`📡 API Base URL: ${API_BASE_URL}`);
  console.log(`🧪 Dry Run Mode: ${DRY_RUN ? 'ENABLED' : 'DISABLED'}`);
  
  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE: No actual changes will be made\n');
  }
  
  console.log(`${'='.repeat(80)}`);
  console.log(`Processing: ${RISK_NAME}`);
  console.log(`${'='.repeat(80)}`);
  
  // Find the risk
  const risk = await findRiskByName(RISK_NAME);
  if (!risk) {
    console.log('❌ Failed to find risk');
    process.exit(1);
  }
  
  // Show current mitigation (first 200 chars)
  console.log(`\n📋 Current agreed mitigation (preview):`);
  console.log(`${risk.agreedMitigation.substring(0, 200)}...`);
  
  console.log(`\n📝 New agreed mitigation:`);
  console.log(NEW_MITIGATION);
  
  // Update the risk
  const result = await updateRiskMitigation(risk.id, NEW_MITIGATION);
  
  if (result) {
    console.log(`\n✅ Update completed successfully`);
    if (DRY_RUN) {
      console.log(`\n⚠️  This was a DRY RUN - no actual changes were made`);
      console.log(`To apply changes, run: DRY_RUN=false node ${__filename}`);
    } else {
      console.log(`\n🎉 Mitigation updated in production!`);
      console.log(`View updated risk: http://localhost:3000/risks/${risk.id}`);
    }
  } else {
    console.log(`\n❌ Update failed`);
    process.exit(1);
  }
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { main, findRiskByName, updateRiskMitigation };
