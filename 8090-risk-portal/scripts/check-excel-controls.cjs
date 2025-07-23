const GoogleDrivePersistenceProvider = require('../server/persistence/GoogleDrivePersistenceProvider.cjs');
const { google } = require('googleapis');

async function checkControls() {
  try {
    // Initialize Google Drive service
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    const driveService = google.drive({ version: 'v3', auth });
    
    // Create persistence provider
    const provider = new GoogleDrivePersistenceProvider(driveService, '1OzrkAUQTWY7VUNrX-_akCWIuU2ALR3sm');
    
    // Get all controls
    console.log('Loading controls from Google Drive Excel file...');
    const controls = await provider.getAllControls();
    
    console.log('\nTotal controls found:', controls.length);
    console.log('\nControl details with Excel row numbers:');
    console.log('======================================');
    
    // Sort controls to match their order in Excel
    const sortedControls = [...controls].sort((a, b) => {
      // Sort by category first, then by ID
      const categoryOrder = ['Accuracy & Judgment', 'Security & Data Privacy', 'Audit & Traceability', 'Governance & Compliance'];
      const catA = categoryOrder.indexOf(a.category);
      const catB = categoryOrder.indexOf(b.category);
      
      if (catA !== catB) return catA - catB;
      return a.mitigationID.localeCompare(b.mitigationID);
    });
    
    // Excel rows: Row 1 is header, data starts at row 2
    sortedControls.forEach((control, index) => {
      const excelRow = index + 2;
      console.log(`\nExcel Row ${excelRow}: ${control.mitigationID}`);
      console.log(`  Category: ${control.category}`);
      console.log(`  Description: ${control.mitigationDescription.substring(0, 70)}...`);
    });
    
    // Check for our specific new controls
    console.log('\n\nChecking for the 8 controls we tried to add:');
    console.log('=============================================');
    const newControlIds = [
      'ACC-04',  // New - Accuracy & Judgment
      'SEC-06',  // New - Security & Data Privacy  
      'SEC-07',  // New - Security & Data Privacy
      'SEC-08',  // New - Security & Data Privacy
      'SEC-09',  // New - Security & Data Privacy
      'SEC-10',  // New - Security & Data Privacy
      'LOG-03',  // Existing but we fixed its category
      'LOG-04',  // New - Audit & Traceability
      'GOV-04'   // New - Governance & Compliance
    ];
    
    let foundCount = 0;
    newControlIds.forEach(id => {
      const control = controls.find(c => c.mitigationID === id);
      if (control) {
        const index = sortedControls.findIndex(c => c.mitigationID === id);
        const excelRow = index + 2;
        console.log(`✓ ${id} found at Excel row ${excelRow} - Category: ${control.category}`);
        foundCount++;
      } else {
        console.log(`✗ ${id} NOT FOUND in Excel`);
      }
    });
    
    console.log(`\nSummary: ${foundCount} out of 9 expected controls found`);
    
    // Show which controls were actually added (not in original 12)
    const originalControlIds = ['ACC-01', 'ACC-02', 'ACC-03', 'SEC-01', 'SEC-02', 'SEC-03', 'SEC-04', 'SEC-05', 'LOG-01', 'LOG-02', 'GOV-01', 'GOV-02', 'GOV-03'];
    const actuallyNewControls = controls.filter(c => !originalControlIds.includes(c.mitigationID));
    
    console.log('\n\nActually NEW controls (not in original 12):');
    console.log('==========================================');
    actuallyNewControls.forEach(control => {
      const index = sortedControls.findIndex(c => c.mitigationID === control.mitigationID);
      const excelRow = index + 2;
      console.log(`${control.mitigationID} at row ${excelRow} - ${control.category}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

checkControls();