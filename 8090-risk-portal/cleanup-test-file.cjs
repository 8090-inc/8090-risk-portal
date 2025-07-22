/**
 * Clean up test data from the Google Drive test file
 */

require('dotenv').config();
const { TestSetup } = require('./server/tests/setup.cjs');

async function cleanupTestFile() {
  console.log('=== CLEANING UP TEST FILE ===\n');
  
  const testSetup = new TestSetup();
  
  try {
    await testSetup.initialize();
    await testSetup.cleanup();
    console.log('\nCleanup complete!');
  } catch (error) {
    console.error('Cleanup failed:', error.message);
    process.exit(1);
  }
}

cleanupTestFile();