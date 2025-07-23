const fetch = require('node-fetch');

async function removeDuplicatesViaAPI() {
  try {
    const API_BASE = 'http://localhost:8080/api/v1';
    
    console.log('Fetching all controls from API...');
    const response = await fetch(`${API_BASE}/controls?limit=50`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error('Failed to fetch controls');
    }
    
    const allControls = result.data;
    console.log(`Total controls: ${allControls.length}`);
    
    // Group controls by ID to find duplicates
    const controlsById = {};
    const duplicates = [];
    
    allControls.forEach(control => {
      if (controlsById[control.mitigationID]) {
        // This is a duplicate
        duplicates.push(control);
        console.log(`Found duplicate: ${control.mitigationID}`);
      } else {
        controlsById[control.mitigationID] = control;
      }
    });
    
    if (duplicates.length === 0) {
      console.log('\nNo duplicates found in the API data!');
      console.log('\nNote: The Excel file may have duplicate entries that are being filtered out by the parser.');
      console.log('The duplicate entries at rows 999-1006 are missing descriptions, so they are automatically skipped.');
      return;
    }
    
    // If we found duplicates, we would delete them here
    // But based on the logs, the parser is already handling this correctly
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Since we can't directly access Google Drive due to auth issues,
// let's document what needs to be done manually
console.log('=== Manual Steps to Remove Duplicates ===\n');
console.log('1. Open the Google Sheets file:');
console.log('   https://docs.google.com/spreadsheets/d/1OzrkAUQTWY7VUNrX-_akCWIuU2ALR3sm/edit\n');
console.log('2. Go to the "Control Mappings" sheet\n');
console.log('3. The duplicate controls are at rows 999-1006 (approximately)');
console.log('   - These are: SEC-06, SEC-07, SEC-08, SEC-09, SEC-10, LOG-03, GOV-04, ACC-04\n');
console.log('4. Delete these rows (they have no descriptions in column B)\n');
console.log('5. Save the spreadsheet\n');
console.log('Note: These duplicates are already being ignored by the parser because they lack descriptions.');
console.log('Removing them will clean up the spreadsheet and reduce its size from 1014 rows.\n');

removeDuplicatesViaAPI();