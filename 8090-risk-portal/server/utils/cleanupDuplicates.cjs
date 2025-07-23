const XLSX = require('xlsx');

/**
 * Clean duplicate controls from the Excel workbook
 * Removes control entries that have no description (empty column B)
 */
const cleanupDuplicateControls = async (buffer) => {
  console.log('[CleanupDuplicates] Starting cleanup...');
  
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  
  // Find the controls sheet
  const controlsSheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('control')
  );
  
  if (!controlsSheetName) {
    console.log('[CleanupDuplicates] No controls sheet found');
    return { buffer, removedCount: 0, removedIds: [] };
  }
  
  const sheet = workbook.Sheets[controlsSheetName];
  const range = XLSX.utils.decode_range(sheet['!ref']);
  
  console.log(`[CleanupDuplicates] Processing sheet: ${controlsSheetName}`);
  console.log(`[CleanupDuplicates] Original range: ${sheet['!ref']}, Total rows: ${range.e.r + 1}`);
  
  // Track rows to delete (working backwards to avoid index issues)
  const rowsToDelete = [];
  const removedIds = [];
  
  // Check each row for duplicate controls without descriptions
  for (let row = range.e.r; row >= 1; row--) {
    const idCell = sheet[XLSX.utils.encode_cell({ r: row, c: 0 })]; // Column A
    const descCell = sheet[XLSX.utils.encode_cell({ r: row, c: 1 })]; // Column B
    
    if (idCell && idCell.v) {
      const id = idCell.v.toString().trim();
      
      // Check if it's a control ID and has no description
      if (/^(ACC|SEC|LOG|GOV|TEST)-\d{2}$/.test(id) && (!descCell || !descCell.v)) {
        console.log(`[CleanupDuplicates] Found control without description at row ${row + 1}: ${id}`);
        rowsToDelete.push(row);
        removedIds.push(id);
      }
    }
  }
  
  if (rowsToDelete.length === 0) {
    console.log('[CleanupDuplicates] No duplicate controls to remove');
    return { buffer, removedCount: 0, removedIds: [] };
  }
  
  console.log(`[CleanupDuplicates] Removing ${rowsToDelete.length} duplicate control rows...`);
  
  // Remove rows (already sorted in descending order)
  for (const rowToDelete of rowsToDelete) {
    // Shift all rows below this one up by one
    for (let r = rowToDelete; r < range.e.r; r++) {
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
  
  console.log(`[CleanupDuplicates] New range: ${sheet['!ref']}, Total rows: ${range.e.r + 1}`);
  console.log('[CleanupDuplicates] Cleanup complete');
  
  // Return the updated buffer and info about what was removed
  const updatedBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return { 
    buffer: updatedBuffer, 
    removedCount: removedIds.length, 
    removedIds 
  };
};

module.exports = {
  cleanupDuplicateControls
};