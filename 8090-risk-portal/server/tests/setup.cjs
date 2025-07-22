/**
 * Test infrastructure setup
 * Uses the test Google Drive file for all backend tests
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Test Google Drive file ID - use from environment or default
const TEST_FILE_ID = process.env.GOOGLE_DRIVE_FILE_ID || process.env.TEST_FILE_ID || '1d9axEzm_RAZ2Ors7O-ZIVJu4n9y0tH2s';

// Test data markers
const TEST_RISK_PREFIX = '[TEST]';
const TEST_CONTROL_PATTERN = /^TEST-\d{2}$/;

/**
 * Initialize Google Drive service for testing
 */
async function initializeTestDriveService() {
  try {
    let credentials;
    
    // Load service account credentials
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    } else if (fs.existsSync('./service-account-key.json')) {
      credentials = JSON.parse(fs.readFileSync('./service-account-key.json', 'utf8'));
    } else {
      throw new Error('No Google service account credentials found for testing');
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    const driveService = google.drive({ version: 'v3', auth });
    
    console.log('Test Drive Service initialized');
    console.log('Test File ID:', TEST_FILE_ID);
    
    return driveService;
  } catch (error) {
    console.error('Failed to initialize test Google Drive service:', error);
    throw error;
  }
}

/**
 * Verify access to test file
 */
async function verifyTestFileAccess(driveService) {
  try {
    console.log('Verifying access to test file:', TEST_FILE_ID);
    
    // Get file metadata
    const fileMetadata = await driveService.files.get({
      fileId: TEST_FILE_ID,
      fields: 'name, mimeType, driveId, capabilities',
      supportsAllDrives: true
    });
    
    console.log('Test file found:', fileMetadata.data.name);
    console.log('Type:', fileMetadata.data.mimeType);
    console.log('Can edit:', fileMetadata.data.capabilities?.canEdit);
    
    if (!fileMetadata.data.capabilities?.canEdit) {
      throw new Error('Test file is not editable. Please ensure the service account has edit permissions.');
    }
    
    return fileMetadata.data;
  } catch (error) {
    console.error('Failed to access test file:', error.message);
    throw new Error(`Cannot access test file ${TEST_FILE_ID}: ${error.message}`);
  }
}

/**
 * Download test file
 */
async function downloadTestFile(driveService) {
  try {
    console.log('Downloading test file...');
    
    // First, get file metadata to check type
    const fileMetadata = await driveService.files.get({
      fileId: TEST_FILE_ID,
      fields: 'mimeType',
      supportsAllDrives: true
    });
    
    let buffer;
    
    if (fileMetadata.data.mimeType === 'application/vnd.google-apps.spreadsheet') {
      // It's a Google Sheets file, use export
      console.log('Detected Google Sheets - exporting as Excel...');
      const response = await driveService.files.export({
        fileId: TEST_FILE_ID,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }, {
        responseType: 'arraybuffer'
      });
      buffer = Buffer.from(response.data);
    } else {
      // It's already an Excel file, download directly
      console.log('Detected Excel file - downloading directly...');
      const response = await driveService.files.get({
        fileId: TEST_FILE_ID,
        alt: 'media',
        supportsAllDrives: true
      }, {
        responseType: 'arraybuffer'
      });
      buffer = Buffer.from(response.data);
    }
    
    console.log('Test file downloaded successfully, size:', buffer.length, 'bytes');
    return buffer;
  } catch (error) {
    console.error('Failed to download test file:', error);
    throw error;
  }
}

/**
 * Create a snapshot of the test file
 */
async function createSnapshot(driveService) {
  const buffer = await downloadTestFile(driveService);
  return {
    buffer,
    timestamp: new Date().toISOString()
  };
}

/**
 * Restore test file from snapshot
 */
async function restoreSnapshot(driveService, snapshot) {
  try {
    console.log('Restoring test file from snapshot...');
    
    const media = {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      body: snapshot.buffer
    };
    
    await driveService.files.update({
      fileId: TEST_FILE_ID,
      media: media,
      supportsAllDrives: true
    });
    
    console.log('Test file restored successfully');
  } catch (error) {
    console.error('Failed to restore snapshot:', error);
    throw error;
  }
}

/**
 * Clean up test data from the file
 */
async function cleanupTestData(driveService) {
  try {
    console.log('Cleaning up test data...');
    
    // Download current file
    const buffer = await downloadTestFile(driveService);
    
    // Parse and clean using excelParser
    const { 
      parseRisksFromWorkbook, 
      parseControlsFromWorkbook,
      deleteRiskFromWorkbook,
      deleteControlFromWorkbook
    } = require('../utils/excelParser.cjs');
    
    let currentBuffer = buffer;
    
    // Parse current data
    const risks = await parseRisksFromWorkbook(currentBuffer);
    const controls = await parseControlsFromWorkbook(currentBuffer);
    
    // Find and remove test risks
    const testRisks = risks.filter(r => 
      r.risk?.includes(TEST_RISK_PREFIX) || 
      r.riskDescription?.includes(TEST_RISK_PREFIX)
    );
    
    console.log(`Found ${testRisks.length} test risks to clean up`);
    
    for (const risk of testRisks) {
      console.log(`Removing test risk: ${risk.id}`);
      currentBuffer = await deleteRiskFromWorkbook(currentBuffer, risk.id);
    }
    
    // Find and remove test controls
    const testControls = controls.filter(c => 
      TEST_CONTROL_PATTERN.test(c.mitigationID)
    );
    
    console.log(`Found ${testControls.length} test controls to clean up`);
    
    for (const control of testControls) {
      console.log(`Removing test control: ${control.mitigationID}`);
      currentBuffer = await deleteControlFromWorkbook(currentBuffer, control.mitigationID);
    }
    
    // Upload cleaned file
    if (testRisks.length > 0 || testControls.length > 0) {
      const media = {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: currentBuffer
      };
      
      await driveService.files.update({
        fileId: TEST_FILE_ID,
        media: media,
        supportsAllDrives: true
      });
      
      console.log('Test data cleaned up successfully');
    } else {
      console.log('No test data found to clean up');
    }
    
  } catch (error) {
    console.error('Failed to cleanup test data:', error);
    throw error;
  }
}

/**
 * Test setup helper
 */
class TestSetup {
  constructor() {
    this.driveService = null;
    this.snapshot = null;
  }
  
  async initialize() {
    this.driveService = await initializeTestDriveService();
    await verifyTestFileAccess(this.driveService);
  }
  
  async createSnapshot() {
    this.snapshot = await createSnapshot(this.driveService);
    return this.snapshot;
  }
  
  async restoreSnapshot() {
    if (!this.snapshot) {
      throw new Error('No snapshot available to restore');
    }
    await restoreSnapshot(this.driveService, this.snapshot);
  }
  
  async cleanup() {
    await cleanupTestData(this.driveService);
  }
  
  getTestFileId() {
    return TEST_FILE_ID;
  }
  
  getDriveService() {
    return this.driveService;
  }
}

module.exports = {
  TestSetup,
  TEST_FILE_ID,
  TEST_RISK_PREFIX,
  TEST_CONTROL_PATTERN,
  initializeTestDriveService,
  verifyTestFileAccess,
  downloadTestFile,
  createSnapshot,
  restoreSnapshot,
  cleanupTestData
};