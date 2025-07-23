const { parseControlsFromWorkbook } = require('../server/utils/excelParser.cjs');
const GoogleDrivePersistenceProvider = require('../server/persistence/GoogleDrivePersistenceProvider.cjs');
const { google } = require('googleapis');
const XLSX = require('xlsx');

async function removeDuplicateControls() {
  try {
    // Initialize Google Drive service
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    const driveService = google.drive({ version: 'v3', auth });
    
    // Create persistence provider
    const provider = new GoogleDrivePersistenceProvider(driveService, '1OzrkAUQTWY7VUNrX-_akCWIuU2ALR3sm');
    
    console.log('Fetching current Excel file from Google Drive...');
    const data = await provider.getData();
    const buffer = data.buffer;
    
    // Read the workbook
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const controlsSheetName = workbook.SheetNames.find(name => 
      name.toLowerCase().includes('control')
    );
    
    if (!controlsSheetName) {
      console.error('Controls sheet not found!');
      return;
    }
    
    const sheet = workbook.Sheets[controlsSheetName];
    const range = XLSX.utils.decode_range(sheet['!ref']);
    
    console.log(`\nAnalyzing sheet: ${controlsSheetName}`);
    console.log(`Sheet range: ${sheet['!ref']}, Total rows: ${range.e.r + 1}`);
    
    // Find all control entries
    const controlRows = [];
    const seenIds = new Set();
    const duplicateRows = [];
    
    for (let row = 1; row <= range.e.r; row++) {
      const idCell = sheet[XLSX.utils.encode_cell({ r: row, c: 0 })]; // Column A
      
      if (idCell && idCell.v) {
        const id = idCell.v.toString().trim();
        
        // Check if it matches control pattern
        if (/^(ACC|SEC|LOG|GOV|TEST)-\d{2}$/.test(id)) {
          controlRows.push({ row, id });
          
          if (seenIds.has(id)) {
            duplicateRows.push({ row, id });
            console.log(`Found duplicate: ${id} at row ${row + 1}`);
          } else {
            seenIds.add(id);
          }
        }
      }
    }
    
    console.log(`\nTotal control rows found: ${controlRows.length}`);
    console.log(`Unique controls: ${seenIds.size}`);
    console.log(`Duplicate rows to remove: ${duplicateRows.length}`);
    
    if (duplicateRows.length === 0) {
      console.log('\nNo duplicates found!');
      return;
    }
    
    // Remove duplicate rows (starting from the bottom to avoid index shifting)
    duplicateRows.sort((a, b) => b.row - a.row);
    
    console.log('\nRemoving duplicate rows...');
    for (const dup of duplicateRows) {
      console.log(`Removing row ${dup.row + 1} (${dup.id})`);
      
      // Shift all rows below this one up by one
      for (let r = dup.row; r < range.e.r; r++) {
        for (let c = 0; c <= range.e.c; c++) {
          const sourceCell = sheet[XLSX.utils.encode_cell({ r: r + 1, c })];
          const targetCell = XLSX.utils.encode_cell({ r, c });
          
          if (sourceCell) {
            sheet[targetCell] = sourceCell;
          } else {
            delete sheet[targetCell];
          }
        }
      }
      
      // Clear the last row
      for (let c = 0; c <= range.e.c; c++) {
        delete sheet[XLSX.utils.encode_cell({ r: range.e.r, c })];
      }
      
      // Update the range
      range.e.r--;
    }
    
    // Update sheet range
    sheet['!ref'] = XLSX.utils.encode_range(range);
    
    // Write the updated workbook
    const updatedBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    console.log('\nUploading cleaned file to Google Drive...');
    await provider.uploadFile(updatedBuffer);
    
    console.log('\nDuplicate controls removed successfully!');
    
    // Verify the results
    console.log('\nVerifying results...');
    const newData = await provider.getData();
    console.log(`Controls after cleanup: ${newData.controls.length}`);
    console.log('Control IDs:', newData.controls.map(c => c.mitigationID).sort().join(', '));
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

removeDuplicateControls();