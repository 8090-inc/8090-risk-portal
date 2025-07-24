#!/usr/bin/env node

/**
 * Script to update agreed mitigation for Copyright Infringements risk only
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

const COPYRIGHT_UPDATE = {
  riskName: 'Copyright Infringements',
  newAgreedMitigation: `**Acceptable-Use Policy** forbids GenAI for public-facing marketing.  
**Plagiarism Detection & Human Originality Review (ACC-04)** before any external release :contentReference[oaicite:11]{index=11}.  
**Content-filters** for verbatim text; maintain traceability of sources.  
**Vendor IP-Indemnification (GOV-02)** – mandatory during selection.  
**3rd-party service T&C register** (MeSH, PubMed, Embase, ReadCube) maintained by Legal / Privacy :contentReference[oaicite:12]{index=12}.`
};

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
  console.log('🚀 Starting Copyright Infringements mitigation update');
  console.log(`📡 API Base URL: ${API_BASE_URL}\n`);
  
  // Find the risk
  const risk = await findRiskByName(COPYRIGHT_UPDATE.riskName);
  if (!risk) {
    console.error('❌ Failed to find Copyright Infringements risk');
    process.exit(1);
  }
  
  // Update the risk
  const result = await updateRiskMitigation(
    risk.id, 
    COPYRIGHT_UPDATE.newAgreedMitigation, 
    COPYRIGHT_UPDATE.riskName
  );
  
  if (result) {
    console.log('\n✅ Update completed successfully!');
  } else {
    console.error('\n❌ Update failed');
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});