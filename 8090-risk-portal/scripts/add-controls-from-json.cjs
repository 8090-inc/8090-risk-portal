#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');

// Configuration
const API_BASE_URL = 'http://localhost:5001/api/v1';
const TEST_DATA_FILE = path.join(__dirname, '../test-data/updated_it_controls.json');
const DRIVE_FILE_ID = '1OzrkAUQTWY7VUNrX-_akCWIuU2ALR3sm';
const BACKUP_DIR = path.join(__dirname, '../backups');

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

// Create backup of the Excel file
async function createBackup() {
  console.log('Creating backup of Excel file...');
  
  try {
    // Ensure backup directory exists
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    
    // Initialize Google Drive client
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../server/config/service-account-key.json'),
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });
    
    const drive = google.drive({ version: 'v3', auth });
    
    // Download the file
    const response = await drive.files.get({
      fileId: DRIVE_FILE_ID,
      alt: 'media'
    }, { responseType: 'stream' });
    
    const backupPath = path.join(BACKUP_DIR, `backup_${Date.now()}_IT-AI-Risk-Register.xlsx`);
    const writeStream = require('fs').createWriteStream(backupPath);
    
    return new Promise((resolve, reject) => {
      response.data
        .on('end', () => {
          console.log(`Backup created: ${backupPath}`);
          resolve(backupPath);
        })
        .on('error', reject)
        .pipe(writeStream);
    });
  } catch (error) {
    console.error('Failed to create backup:', error);
    throw error;
  }
}

// Delete backup file
async function deleteBackup(backupPath) {
  try {
    await fs.unlink(backupPath);
    console.log(`Backup deleted: ${backupPath}`);
  } catch (error) {
    console.error('Failed to delete backup:', error);
  }
}

// Add control via API
async function addControl(control) {
  try {
    console.log(`\nAdding control ${control.mitigationID}...`);
    
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
  let backupPath = null;
  
  try {
    // Load test data
    console.log('Loading test data...');
    const testData = JSON.parse(await fs.readFile(TEST_DATA_FILE, 'utf8'));
    console.log(`Found ${testData.length} controls to add`);
    
    // Create backup
    backupPath = await createBackup();
    
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
      
      // Delete backup since everything succeeded
      if (backupPath) {
        await deleteBackup(backupPath);
      }
    } else {
      console.log('\n⚠ Some controls failed. Backup retained at:', backupPath);
      console.log('\nFailed controls:');
      results.filter(r => !r.success).forEach(r => console.log(`  - ${r.control}`));
    }
    
  } catch (error) {
    console.error('Error:', error);
    if (backupPath) {
      console.log(`\n⚠ Error occurred. Backup retained at: ${backupPath}`);
    }
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);