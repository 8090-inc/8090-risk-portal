const { parseControlsFromWorkbook, downloadFileFromDrive } = require('../server/utils/excelParser.cjs');
const { google } = require('googleapis');

async function checkControls() {
  try {
    // Initialize Google Drive service (same as server.cjs)
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    const driveService = google.drive({ version: 'v3', auth });
    
    // Download the file
    console.log('Downloading Excel file from Google Drive...');
    const buffer = await downloadFileFromDrive('1OzrkAUQTWY7VUNrX-_akCWIuU2ALR3sm', driveService);
    
    // Parse controls
    console.log('\nParsing controls from Excel file...');
    const controls = await parseControlsFromWorkbook(buffer);
    
    console.log('\nTotal controls found:', controls.length);
    console.log('\nControl details with row numbers in Excel:');
    console.log('==========================================');
    
    // Excel rows start at 1, and row 1 is the header, so data starts at row 2
    controls.forEach((control, index) => {
      const excelRow = index + 2; // +2 because: index 0 = row 2 in Excel
      console.log(`\nRow ${excelRow}: ${control.mitigationID}`);
      console.log(`  Category: ${control.category}`);
      console.log(`  Description: ${control.mitigationDescription.substring(0, 70)}...`);
    });
    
    // Check for our specific new controls
    console.log('\n\nChecking for the 8 controls we tried to add:');
    console.log('=============================================');
    const newControlIds = ['SEC-06', 'SEC-07', 'SEC-08', 'SEC-09', 'SEC-10', 'LOG-03', 'LOG-04', 'GOV-04', 'ACC-04'];
    
    let foundCount = 0;
    newControlIds.forEach(id => {
      const controlIndex = controls.findIndex(c => c.mitigationID === id);
      if (controlIndex !== -1) {
        const excelRow = controlIndex + 2;
        console.log(`✓ ${id} found at Excel row ${excelRow}`);
        foundCount++;
      } else {
        console.log(`✗ ${id} NOT FOUND in Excel`);
      }
    });
    
    console.log(`\nSummary: ${foundCount} out of 8 expected controls found in Excel`);
    
    // List all control IDs for verification
    console.log('\nAll control IDs in order:');
    console.log(controls.map(c => c.mitigationID).join(', '));
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

checkControls();