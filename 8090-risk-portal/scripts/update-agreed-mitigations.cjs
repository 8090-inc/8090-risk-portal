#!/usr/bin/env node

/**
 * Script to update agreed mitigations for specific risks
 * Updates the agreedMitigation field for the four risks mentioned in the diff
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';
const DRY_RUN = process.env.DRY_RUN === 'true';

// Risk updates based on the provided diff
const RISK_UPDATES = [
  {
    riskName: 'Sensitive Information Leakage',
    newAgreedMitigation: `Zero-Trust Data Protection Architecture:  
• **Private, segregated VPC** – no vendor training on Dompé data.  
• **Three-layer DLP (network, API, AWS Macie)** blocks PII/PHI exfiltration.  
• **ABAC via Entra ID** enforces least-privilege access.  
• **Immutable, query-level audit trail (LOG-03)**.  
• **Encryption with customer-managed keys** and TLS ≥ 1.2.  
• **GDPR DPIA & DPA/BAA review** for any new use of sensitive data.  
• **Data-retention clock & secure-deletion (SEC-10)** for RAG chunks/logs.`
  },
  {
    riskName: 'Copyright Infringements',
    newAgreedMitigation: `**Acceptable-Use Policy** forbids GenAI for public-facing marketing.  
**Plagiarism Detection & Human Originality Review (ACC-04)** before any external release.  
**Content-filters** for verbatim text; maintain traceability of sources.  
**Vendor IP-Indemnification (GOV-02)** – mandatory during selection.  
**3rd-party service T&C register** (MeSH, PubMed, Embase, ReadCube) maintained by Legal / Privacy.`
  },
  {
    riskName: 'Hackers Abuse In-House GenAI Solutions',
    newAgreedMitigation: `**Defence-in-Depth architecture:**  
• **Secure Application Gateway / WAF (SEC-06)** with auth & rate-limiting.  
• **Input/Output sanitisation & validation (SEC-07)** against DPI / IPI.  
• **Secure RAG data-pipeline with integrity checks** (checksums).  
• **Infrastructure isolation (SEC-01)** retained.  
• **Red-teaming & WAPT** after every significant change.  
• **Certificate-management (SEC-08)** for all services.  
• Continuous log-analytics for anomaly detection.`
  },
  {
    riskName: 'Unauthorized Information Access via LLMs',
    newAgreedMitigation: `**Attribute-Based Access Control (SEC-09)** with real-time permission checks on vector index.  
**Comprehensive audit trail (LOG-03)** linking every retrieval to user & document.  
**Managerial approval workflow** for broad data-access requests.  
**Quarterly pen-tests with low-privilege accounts** to verify controls.  
**Privacy Office audits** to ensure data-minimisation & policy compliance.`
  }
];

/**
 * Find a risk by name
 */
async function findRiskByName(riskName) {
  try {
    console.log(`🔍 Searching for risk: "${riskName}"`);
    
    // Get all risks and search by name
    const response = await axios.get(`${API_BASE_URL}/api/v1/risks`, {
      params: {
        limit: 1000 // Get all risks to search through them
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
      console.log(`Available risks: ${risks.map(r => r.risk || r.riskName).join(', ')}`);
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
async function updateRiskMitigation(riskId, newMitigation, riskName) {
  try {
    console.log(`🔄 Updating agreed mitigation for risk ID: ${riskId}`);
    
    if (DRY_RUN) {
      console.log(`🔍 DRY RUN: Would update "${riskName}" with:`);
      console.log(`📝 New mitigation:\n${newMitigation}\n`);
      return { success: true, dryRun: true };
    }
    
    // Use PATCH to update only the agreedMitigation field
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
  console.log('🚀 Starting agreed mitigations update script');
  console.log(`📡 API Base URL: ${API_BASE_URL}`);
  console.log(`🧪 Dry Run Mode: ${DRY_RUN ? 'ENABLED' : 'DISABLED'}`);
  console.log(`📝 Risks to update: ${RISK_UPDATES.length}\n`);
  
  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE: No actual changes will be made\n');
  }
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const update of RISK_UPDATES) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing: ${update.riskName}`);
    console.log(`${'='.repeat(60)}`);
    
    // Find the risk
    const risk = await findRiskByName(update.riskName);
    if (!risk) {
      failureCount++;
      continue;
    }
    
    // Show current mitigation
    console.log(`📋 Current agreed mitigation:`);
    console.log(risk.agreedMitigation || '(empty)');
    console.log(`\n📝 New agreed mitigation:`);
    console.log(update.newAgreedMitigation);
    
    // Update the risk
    const result = await updateRiskMitigation(risk.id, update.newAgreedMitigation, update.riskName);
    if (result) {
      successCount++;
    } else {
      failureCount++;
    }
    
    // Add small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Successful updates: ${successCount}`);
  console.log(`❌ Failed updates: ${failureCount}`);
  console.log(`📝 Total risks processed: ${RISK_UPDATES.length}`);
  
  if (DRY_RUN) {
    console.log(`\n⚠️  This was a DRY RUN - no actual changes were made`);
    console.log(`To apply changes, run: DRY_RUN=false node ${__filename}`);
  }
  
  process.exit(failureCount > 0 ? 1 : 0);
}

// Error handling for uncaught exceptions
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
