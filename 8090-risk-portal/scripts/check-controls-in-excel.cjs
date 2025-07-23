const { parseControlsFromWorkbook, downloadFileFromDrive } = require('../server/utils/excelParser.cjs');
const { initGoogleDriveService } = require('../server/services/googleDriveService.cjs');

async function checkControls() {
  try {
    // Initialize Google Drive service
    const driveService = await initGoogleDriveService();
    
    // Download the file
    console.log('Downloading Excel file from Google Drive...');
    const buffer = await downloadFileFromDrive('1OzrkAUQTWY7VUNrX-_akCWIuU2ALR3sm', driveService);
    
    // Parse controls
    console.log('\nParsing controls from Excel file...');
    const controls = await parseControlsFromWorkbook(buffer);
    
    console.log('\nTotal controls found:', controls.length);
    console.log('\nControl details with row numbers:');
    console.log('=====================================');
    
    // Excel rows start at 1, and row 1 is the header, so data starts at row 2
    controls.forEach((control, index) => {
      const excelRow = index + 2; // +2 because: index 0 = row 2 in Excel
      console.log(`Row ${excelRow}: ${control.mitigationID} - ${control.category}`);
      console.log(`  Description: ${control.mitigationDescription.substring(0, 60)}...`);
    });
    
    // Check for our specific new controls
    console.log('\n\nChecking for the 8 new controls we added:');
    console.log('==========================================');
    const newControlIds = ['SEC-06', 'SEC-07', 'SEC-08', 'SEC-09', 'SEC-10', 'LOG-03', 'LOG-04', 'GOV-04', 'ACC-04'];
    
    newControlIds.forEach(id => {
      const controlIndex = controls.findIndex(c => c.mitigationID === id);
      if (controlIndex !== -1) {
        const excelRow = controlIndex + 2;
        console.log(`✓ ${id} found at row ${excelRow}`);
      } else {
        console.log(`✗ ${id} NOT FOUND`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
}

checkControls();