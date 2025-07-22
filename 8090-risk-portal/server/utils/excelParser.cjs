const XLSX = require('xlsx');

// Column mappings for risks - Updated to include ID column
const RISK_COLUMNS = {
  ID: 0,                              // NEW: ID column
  RISK_CATEGORY: 1,                   // Shifted from 0
  RISK_NAME: 2,                       // Shifted from 1
  RISK_DESCRIPTION: 3,                // Shifted from 2
  INITIAL_LIKELIHOOD: 4,              // Shifted from 3
  INITIAL_IMPACT: 5,                  // Shifted from 4
  INITIAL_RISK_LEVEL: 6,              // Shifted from 5
  INITIAL_RISK_CATEGORY: 7,           // Shifted from 6
  EXAMPLE_MITIGATIONS: 8,             // Shifted from 7
  AGREED_MITIGATION: 9,               // Shifted from 8
  PROPOSED_OVERSIGHT_OWNERSHIP: 10,   // Shifted from 9
  PROPOSED_SUPPORT: 11,               // Shifted from 10
  NOTES: 12,                          // Shifted from 11
  RESIDUAL_LIKELIHOOD: 13,            // Shifted from 12
  RESIDUAL_IMPACT: 14,                // Shifted from 13
  RESIDUAL_RISK_LEVEL: 15,            // Shifted from 14
  RESIDUAL_RISK_CATEGORY: 16          // Shifted from 15
};

// Legacy column mappings (for backwards compatibility)
const LEGACY_RISK_COLUMNS = {
  RISK_CATEGORY: 0,
  RISK_NAME: 1,
  RISK_DESCRIPTION: 2,
  INITIAL_LIKELIHOOD: 3,
  INITIAL_IMPACT: 4,
  INITIAL_RISK_LEVEL: 5,
  INITIAL_RISK_CATEGORY: 6,
  EXAMPLE_MITIGATIONS: 7,
  AGREED_MITIGATION: 8,
  PROPOSED_OVERSIGHT_OWNERSHIP: 9,
  PROPOSED_SUPPORT: 10,
  NOTES: 11,
  RESIDUAL_LIKELIHOOD: 12,
  RESIDUAL_IMPACT: 13,
  RESIDUAL_RISK_LEVEL: 14,
  RESIDUAL_RISK_CATEGORY: 15
};

// Column mappings for controls
const CONTROL_COLUMNS = {
  CONTROL_ID: 0,
  CONTROL_NAME: 1,
  CONTROL_DESCRIPTION: 2,
  CONTROL_TYPE: 3,
  IMPLEMENTATION_STATUS: 4,
  EFFECTIVENESS: 5,
  OWNER: 6,
  LAST_REVIEW_DATE: 7,
  NEXT_REVIEW_DATE: 8,
  EVIDENCE: 9,
  RELATED_RISKS: 10,
  NOTES: 11
};

// Valid control ID pattern
const CONTROL_ID_PATTERN = /^(ACC|SEC|LOG|GOV|TEST)-\d{2}$/;

// Helper to parse cell value
const getCellValue = (cell) => {
  if (!cell) return '';
  if (typeof cell.v === 'string') return cell.v.trim();
  if (typeof cell.v === 'number') return cell.v;
  return '';
};

// Helper to parse array values from comma-separated strings
const parseArrayValue = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.split(',').map(item => item.trim()).filter(item => item);
};

// Generate risk ID
const generateRiskId = (riskName) => {
  const sanitized = riskName.replace(/[^a-zA-Z0-9]/g, '-').toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `RISK-${sanitized}-${timestamp}`;
};

// Check if a value is a header value
const isHeaderValue = (value) => {
  if (!value) return false;
  const headers = ['Risk', 'Risk Name', 'Name', 'Category', 'Description', 'Risk Category', 'Risk Description'];
  return headers.includes(value.toString().trim());
};

// Check if a category is valid
const isValidRiskCategory = (category) => {
  if (!category) return false;
  const validCategories = [
    'Behavioral Risks',
    'Accuracy',
    'Transparency Risks', 
    'Security and Data Risks',
    'Business/Cost Related Risks',
    'AI Human Impact Risks',
    'Other Risks'
  ];
  return validCategories.some(valid => 
    category.toLowerCase().includes(valid.toLowerCase())
  );
};

// Find where actual data starts in the sheet
const findDataStartRow = (sheet, range, columns) => {
  console.log('Searching for data start row...');
  
  for (let row = 0; row <= Math.min(20, range.e.r); row++) {
    const likelihood = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: columns.INITIAL_LIKELIHOOD })]);
    const impact = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: columns.INITIAL_IMPACT })]);
    const riskName = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: columns.RISK_NAME })]);
    
    // Check if this looks like a data row
    if (typeof likelihood === 'number' && likelihood >= 1 && likelihood <= 5 &&
        typeof impact === 'number' && impact >= 1 && impact <= 5 &&
        riskName && !isHeaderValue(riskName)) {
      console.log(`Found data start at row ${row}`);
      return row;
    }
  }
  
  console.log('Could not find data start row, defaulting to row 5');
  return 5; // Fallback based on typical structure
};

// Parse risks from workbook
const parseRisksFromWorkbook = async (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  // Look for Risk Map sheet specifically
  const sheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('risk') && name.toLowerCase().includes('map')
  ) || workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  console.log(`Parsing risks from sheet: ${sheetName}`);
  
  // Detect format by checking first row headers
  const firstRowFirstCell = getCellValue(sheet[XLSX.utils.encode_cell({ r: 0, c: 0 })]);
  const hasIdColumn = firstRowFirstCell && (firstRowFirstCell.toLowerCase() === 'id' || firstRowFirstCell.toLowerCase().includes('risk id'));
  const columns = hasIdColumn ? RISK_COLUMNS : LEGACY_RISK_COLUMNS;
  
  console.log(`Detected format: ${hasIdColumn ? 'NEW (with ID)' : 'LEGACY (without ID)'}`);
  
  const risks = [];
  const range = XLSX.utils.decode_range(sheet['!ref']);
  
  // Find where actual data starts
  const dataStartRow = findDataStartRow(sheet, range, columns);
  let lastValidCategory = null;
  let skippedRows = 0;
  let headerRows = 0;
  
  // Scan entire sheet, don't stop at empty rows
  for (let row = dataStartRow; row <= range.e.r; row++) {
    const riskCategory = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: columns.RISK_CATEGORY })]);
    const riskName = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: columns.RISK_NAME })]);
    
    // Skip if no risk name
    if (!riskName || riskName.trim() === '') {
      skippedRows++;
      continue;
    }
    
    // Skip header-like values
    if (isHeaderValue(riskName)) {
      headerRows++;
      console.log(`Skipping header row ${row}: ${riskName}`);
      continue;
    }
    
    // Update last valid category if we have one
    if (riskCategory && isValidRiskCategory(riskCategory)) {
      lastValidCategory = riskCategory;
    }
    
    // Use current category or last valid one
    const effectiveCategory = riskCategory || lastValidCategory || 'Other Risks';
    
    // Only process if we have a valid category
    if (!effectiveCategory) {
      console.log(`Skipping row ${row}: No valid category found`);
      continue;
    }
    
    // Get ID if available, otherwise generate it
    let riskId;
    if (hasIdColumn) {
      riskId = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: RISK_COLUMNS.ID })]);
      if (!riskId) {
        riskId = generateRiskId(riskName);
      }
    } else {
      riskId = generateRiskId(riskName);
    }
    
    // Get scoring values
    const initialLikelihood = Number(getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: columns.INITIAL_LIKELIHOOD })])) || 0;
    const initialImpact = Number(getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: columns.INITIAL_IMPACT })])) || 0;
    const initialRiskLevel = Number(getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: columns.INITIAL_RISK_LEVEL })])) || (initialLikelihood * initialImpact);
    
    const residualLikelihood = Number(getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: columns.RESIDUAL_LIKELIHOOD })])) || 0;
    const residualImpact = Number(getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: columns.RESIDUAL_IMPACT })])) || 0;
    const residualRiskLevel = Number(getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: columns.RESIDUAL_RISK_LEVEL })])) || (residualLikelihood * residualImpact);

    // Calculate risk reduction
    const riskReduction = initialRiskLevel - residualRiskLevel;
    const riskReductionPercentage = initialRiskLevel > 0 ? Math.round((riskReduction / initialRiskLevel) * 100) : 0;

    const risk = {
      id: riskId,
      riskCategory: effectiveCategory,
      risk: riskName,
      riskDescription: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: columns.RISK_DESCRIPTION })]),
      initialScoring: {
        likelihood: initialLikelihood,
        impact: initialImpact,
        riskLevel: initialRiskLevel,
        riskLevelCategory: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: columns.INITIAL_RISK_CATEGORY })]) || ''
      },
      exampleMitigations: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: columns.EXAMPLE_MITIGATIONS })]),
      agreedMitigation: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: columns.AGREED_MITIGATION })]),
      proposedOversightOwnership: parseArrayValue(getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: columns.PROPOSED_OVERSIGHT_OWNERSHIP })])),
      proposedSupport: parseArrayValue(getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: columns.PROPOSED_SUPPORT })])),
      notes: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: columns.NOTES })]),
      residualScoring: {
        likelihood: residualLikelihood,
        impact: residualImpact,
        riskLevel: residualRiskLevel,
        riskLevelCategory: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: columns.RESIDUAL_RISK_CATEGORY })]) || ''
      },
      riskReduction: riskReduction,
      riskReductionPercentage: riskReductionPercentage,
      mitigationEffectiveness: riskReductionPercentage >= 75 ? 'High' : riskReductionPercentage >= 50 ? 'Medium' : 'Low',
      relatedControlIds: [],
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    risks.push(risk);
  }
  
  console.log(`=== PARSING SUMMARY ===`);
  console.log(`Total rows scanned: ${range.e.r - dataStartRow + 1}`);
  console.log(`Skipped empty rows: ${skippedRows}`);
  console.log(`Skipped header rows: ${headerRows}`);
  console.log(`Total risks parsed: ${risks.length}`);
  
  if (risks.length < 30) {
    console.warn(`WARNING: Only found ${risks.length} risks, expected around 33`);
  }
  
  return risks;
};

// Parse controls from workbook
const parseControlsFromWorkbook = async (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  
  // Look for Controls sheet
  const controlsSheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('control')
  );
  
  if (!controlsSheetName) {
    return [];
  }
  
  const sheet = workbook.Sheets[controlsSheetName];
  const controls = [];
  const range = XLSX.utils.decode_range(sheet['!ref']);
  
  // Start from row 2 (skip header row)
  for (let row = 1; row <= range.e.r; row++) {
    const controlId = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.CONTROL_ID })]);
    const controlName = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.CONTROL_NAME })]);
    
    if (!controlId || !controlName) continue;
    if (!CONTROL_ID_PATTERN.test(controlId)) continue;
    
    const control = {
      mitigationID: controlId,
      mitigationDescription: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.CONTROL_DESCRIPTION })]),
      category: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.CONTROL_TYPE })]),
      implementationStatus: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.IMPLEMENTATION_STATUS })]),
      effectiveness: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.EFFECTIVENESS })]),
      owner: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.OWNER })]),
      lastReviewDate: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.LAST_REVIEW_DATE })]),
      nextReviewDate: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.NEXT_REVIEW_DATE })]),
      evidence: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.EVIDENCE })]),
      relatedRiskIds: parseArrayValue(getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.RELATED_RISKS })])),
      notes: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.NOTES })]),
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    controls.push(control);
  }
  
  return controls;
};

// Add risk to workbook
const addRiskToWorkbook = async (buffer, newRisk) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  // Look for Risk Map sheet specifically
  let sheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('risk') && name.toLowerCase().includes('map')
  );
  
  // If Risk Map sheet doesn't exist, use the first sheet
  if (!sheetName) {
    sheetName = workbook.SheetNames[0];
  }
  
  const sheet = workbook.Sheets[sheetName];
  console.log(`Adding risk to sheet: ${sheetName}`);
  
  // Detect format
  const firstRowFirstCell = getCellValue(sheet[XLSX.utils.encode_cell({ r: 0, c: 0 })]);
  const hasIdColumn = firstRowFirstCell && (firstRowFirstCell.toLowerCase() === 'id' || firstRowFirstCell.toLowerCase().includes('risk id'));
  
  const range = XLSX.utils.decode_range(sheet['!ref']);
  const newRow = range.e.r + 1;
  
  // Add new risk data - ALWAYS include ID for new format
  const rowData = hasIdColumn ? [
    newRisk.id || generateRiskId(newRisk.risk),  // ID column
    newRisk.riskCategory,
    newRisk.risk,
    newRisk.riskDescription,
    newRisk.initialScoring.likelihood,
    newRisk.initialScoring.impact,
    newRisk.initialScoring.riskLevel,
    newRisk.initialScoring.riskLevelCategory,
    newRisk.exampleMitigations || '',
    newRisk.agreedMitigation || '',
    Array.isArray(newRisk.proposedOversightOwnership) ? newRisk.proposedOversightOwnership.join(', ') : (newRisk.proposedOversightOwnership || ''),
    Array.isArray(newRisk.proposedSupport) ? newRisk.proposedSupport.join(', ') : (newRisk.proposedSupport || ''),
    newRisk.notes || '',
    newRisk.residualScoring.likelihood,
    newRisk.residualScoring.impact,
    newRisk.residualScoring.riskLevel,
    newRisk.residualScoring.riskLevelCategory
  ] : [
    // Legacy format without ID
    newRisk.riskCategory,
    newRisk.risk,
    newRisk.riskDescription,
    newRisk.initialScoring.likelihood,
    newRisk.initialScoring.impact,
    newRisk.initialScoring.riskLevel,
    newRisk.initialScoring.riskLevelCategory,
    newRisk.exampleMitigations || '',
    newRisk.agreedMitigation || '',
    Array.isArray(newRisk.proposedOversightOwnership) ? newRisk.proposedOversightOwnership.join(', ') : (newRisk.proposedOversightOwnership || ''),
    Array.isArray(newRisk.proposedSupport) ? newRisk.proposedSupport.join(', ') : (newRisk.proposedSupport || ''),
    newRisk.notes || '',
    newRisk.residualScoring.likelihood,
    newRisk.residualScoring.impact,
    newRisk.residualScoring.riskLevel,
    newRisk.residualScoring.riskLevelCategory
  ];
  
  rowData.forEach((value, colIndex) => {
    const cell = { t: typeof value === 'number' ? 'n' : 's', v: value };
    sheet[XLSX.utils.encode_cell({ r: newRow, c: colIndex })] = cell;
  });
  
  // Update range
  range.e.r = newRow;
  sheet['!ref'] = XLSX.utils.encode_range(range);
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

// Update risk in workbook
const updateRiskInWorkbook = async (buffer, riskId, updatedRisk) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  // Look for Risk Map sheet specifically
  const sheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('risk') && name.toLowerCase().includes('map')
  ) || workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  console.log(`Updating risk in sheet: ${sheetName}`);
  
  // Detect format
  const firstRowFirstCell = getCellValue(sheet[XLSX.utils.encode_cell({ r: 0, c: 0 })]);
  const hasIdColumn = firstRowFirstCell && (firstRowFirstCell.toLowerCase() === 'id' || firstRowFirstCell.toLowerCase().includes('risk id'));
  const columns = hasIdColumn ? RISK_COLUMNS : LEGACY_RISK_COLUMNS;
  
  const range = XLSX.utils.decode_range(sheet['!ref']);
  let riskRow = -1;
  
  // Find the risk row
  for (let row = 1; row <= range.e.r; row++) {
    if (hasIdColumn) {
      // New format: match by ID directly
      const rowId = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: RISK_COLUMNS.ID })]);
      if (rowId === riskId) {
        riskRow = row;
        break;
      }
    } else {
      // Legacy format: match by regenerated ID
      const riskName = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: LEGACY_RISK_COLUMNS.RISK_NAME })]);
      if (generateRiskId(riskName) === riskId) {
        riskRow = row;
        break;
      }
    }
  }
  
  if (riskRow === -1) {
    throw new Error(`Risk with ID ${riskId} not found`);
  }
  
  // Update risk data - Fixed field mapping for Excel structure
  const rowData = hasIdColumn ? [
    updatedRisk.id || riskId,                          // 0 - ID
    updatedRisk.riskCategory || '',                    // 1 - RISK_CATEGORY
    updatedRisk.risk || '',                            // 2 - RISK_NAME
    updatedRisk.riskDescription || '',                 // 3 - RISK_DESCRIPTION
    updatedRisk.initialScoring?.likelihood || 0,       // 4 - INITIAL_LIKELIHOOD
    updatedRisk.initialScoring?.impact || 0,           // 5 - INITIAL_IMPACT
    updatedRisk.initialScoring?.riskLevel || 0,        // 6 - INITIAL_RISK_LEVEL
    updatedRisk.initialScoring?.riskLevelCategory || '', // 7 - INITIAL_RISK_CATEGORY
    updatedRisk.exampleMitigations || '',              // 8 - EXAMPLE_MITIGATIONS
    updatedRisk.agreedMitigation || '',                // 9 - AGREED_MITIGATION
    Array.isArray(updatedRisk.proposedOversightOwnership) ? updatedRisk.proposedOversightOwnership.join(', ') : (updatedRisk.proposedOversightOwnership || ''), // 10 - PROPOSED_OVERSIGHT_OWNERSHIP
    Array.isArray(updatedRisk.proposedSupport) ? updatedRisk.proposedSupport.join(', ') : (updatedRisk.proposedSupport || ''), // 11 - PROPOSED_SUPPORT
    updatedRisk.notes || '',                           // 12 - NOTES
    updatedRisk.residualScoring?.likelihood || 0,      // 13 - RESIDUAL_LIKELIHOOD
    updatedRisk.residualScoring?.impact || 0,          // 14 - RESIDUAL_IMPACT
    updatedRisk.residualScoring?.riskLevel || 0,       // 15 - RESIDUAL_RISK_LEVEL
    updatedRisk.residualScoring?.riskLevelCategory || '' // 16 - RESIDUAL_RISK_CATEGORY
  ] : [
    // Legacy format without ID
    updatedRisk.riskCategory || '',                    // 0 - RISK_CATEGORY
    updatedRisk.risk || '',                            // 1 - RISK_NAME
    updatedRisk.riskDescription || '',                 // 2 - RISK_DESCRIPTION
    updatedRisk.initialScoring?.likelihood || 0,       // 3 - INITIAL_LIKELIHOOD
    updatedRisk.initialScoring?.impact || 0,           // 4 - INITIAL_IMPACT
    updatedRisk.initialScoring?.riskLevel || 0,        // 5 - INITIAL_RISK_LEVEL
    updatedRisk.initialScoring?.riskLevelCategory || '', // 6 - INITIAL_RISK_CATEGORY
    updatedRisk.exampleMitigations || '',              // 7 - EXAMPLE_MITIGATIONS
    updatedRisk.agreedMitigation || '',                // 8 - AGREED_MITIGATION
    Array.isArray(updatedRisk.proposedOversightOwnership) ? updatedRisk.proposedOversightOwnership.join(', ') : (updatedRisk.proposedOversightOwnership || ''), // 9 - PROPOSED_OVERSIGHT_OWNERSHIP
    Array.isArray(updatedRisk.proposedSupport) ? updatedRisk.proposedSupport.join(', ') : (updatedRisk.proposedSupport || ''), // 10 - PROPOSED_SUPPORT
    updatedRisk.notes || '',                           // 11 - NOTES
    updatedRisk.residualScoring?.likelihood || 0,      // 12 - RESIDUAL_LIKELIHOOD
    updatedRisk.residualScoring?.impact || 0,          // 13 - RESIDUAL_IMPACT
    updatedRisk.residualScoring?.riskLevel || 0,       // 14 - RESIDUAL_RISK_LEVEL
    updatedRisk.residualScoring?.riskLevelCategory || '' // 15 - RESIDUAL_RISK_CATEGORY
  ];
  
  rowData.forEach((value, colIndex) => {
    const cell = { t: typeof value === 'number' ? 'n' : 's', v: value };
    sheet[XLSX.utils.encode_cell({ r: riskRow, c: colIndex })] = cell;
  });
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

// Delete risk from workbook
const deleteRiskFromWorkbook = async (buffer, riskId) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  // Look for Risk Map sheet specifically
  const sheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('risk') && name.toLowerCase().includes('map')
  ) || workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  console.log(`Deleting risk from sheet: ${sheetName}`);
  
  // Detect format
  const firstRowFirstCell = getCellValue(sheet[XLSX.utils.encode_cell({ r: 0, c: 0 })]);
  const hasIdColumn = firstRowFirstCell && (firstRowFirstCell.toLowerCase() === 'id' || firstRowFirstCell.toLowerCase().includes('risk id'));
  
  const range = XLSX.utils.decode_range(sheet['!ref']);
  let riskRow = -1;
  
  // Find the risk row
  for (let row = 1; row <= range.e.r; row++) {
    if (hasIdColumn) {
      // New format: match by ID directly
      const rowId = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: RISK_COLUMNS.ID })]);
      if (rowId === riskId) {
        riskRow = row;
        break;
      }
    } else {
      // Legacy format: match by regenerated ID
      const riskName = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: LEGACY_RISK_COLUMNS.RISK_NAME })]);
      if (generateRiskId(riskName) === riskId) {
        riskRow = row;
        break;
      }
    }
  }
  
  if (riskRow === -1) {
    throw new Error(`Risk with ID ${riskId} not found`);
  }
  
  // Delete row by shifting all rows below up
  for (let row = riskRow; row < range.e.r; row++) {
    for (let col = 0; col <= range.e.c; col++) {
      const sourceCell = sheet[XLSX.utils.encode_cell({ r: row + 1, c: col })];
      const targetCell = XLSX.utils.encode_cell({ r: row, c: col });
      
      if (sourceCell) {
        sheet[targetCell] = sourceCell;
      } else {
        delete sheet[targetCell];
      }
    }
  }
  
  // Delete the last row
  for (let col = 0; col <= range.e.c; col++) {
    delete sheet[XLSX.utils.encode_cell({ r: range.e.r, c: col })];
  }
  
  // Update range
  range.e.r--;
  sheet['!ref'] = XLSX.utils.encode_range(range);
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

// Add control to workbook
const addControlToWorkbook = async (buffer, newControl) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  
  // Find or create Controls sheet
  let controlsSheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('control')
  );
  
  if (!controlsSheetName) {
    // Create new Controls sheet
    controlsSheetName = 'Controls';
    const newSheet = XLSX.utils.aoa_to_sheet([
      ['Control ID', 'Control Name', 'Description', 'Type', 'Implementation Status', 
       'Effectiveness', 'Owner', 'Last Review Date', 'Next Review Date', 
       'Evidence', 'Related Risks', 'Notes']
    ]);
    workbook.Sheets[controlsSheetName] = newSheet;
    workbook.SheetNames.push(controlsSheetName);
  }
  
  const sheet = workbook.Sheets[controlsSheetName];
  const range = XLSX.utils.decode_range(sheet['!ref']);
  const newRow = range.e.r + 1;
  
  // Add new control data
  const rowData = [
    newControl.mitigationID,
    newControl.mitigationDescription,
    newControl.mitigationDescription,  // Description column
    newControl.category || 'Preventive',
    newControl.implementationStatus,
    newControl.effectiveness,
    newControl.owner,
    newControl.lastReviewDate,
    newControl.nextReviewDate,
    newControl.evidence,
    Array.isArray(newControl.relatedRiskIds) ? newControl.relatedRiskIds.join(', ') : (newControl.relatedRiskIds || ''),
    newControl.notes || ''
  ];
  
  rowData.forEach((value, colIndex) => {
    const cell = { t: 's', v: value || '' };
    sheet[XLSX.utils.encode_cell({ r: newRow, c: colIndex })] = cell;
  });
  
  // Update range
  range.e.r = newRow;
  sheet['!ref'] = XLSX.utils.encode_range(range);
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

// Update control in workbook
const updateControlInWorkbook = async (buffer, controlId, updatedControl) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  
  const controlsSheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('control')
  );
  
  if (!controlsSheetName) {
    throw new Error('Controls sheet not found');
  }
  
  const sheet = workbook.Sheets[controlsSheetName];
  const range = XLSX.utils.decode_range(sheet['!ref']);
  let controlRow = -1;
  
  // Find the control row
  for (let row = 1; row <= range.e.r; row++) {
    const id = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.CONTROL_ID })]);
    if (id === controlId) {
      controlRow = row;
      break;
    }
  }
  
  if (controlRow === -1) {
    throw new Error(`Control with ID ${controlId} not found`);
  }
  
  // Update control data
  const rowData = [
    updatedControl.mitigationID,
    updatedControl.mitigationDescription,
    updatedControl.mitigationDescription,  // Description column
    updatedControl.category || 'Preventive',
    updatedControl.implementationStatus,
    updatedControl.effectiveness,
    updatedControl.owner,
    updatedControl.lastReviewDate,
    updatedControl.nextReviewDate,
    updatedControl.evidence,
    Array.isArray(updatedControl.relatedRiskIds) ? updatedControl.relatedRiskIds.join(', ') : (updatedControl.relatedRiskIds || ''),
    updatedControl.notes || ''
  ];
  
  rowData.forEach((value, colIndex) => {
    const cell = { t: 's', v: value || '' };
    sheet[XLSX.utils.encode_cell({ r: controlRow, c: colIndex })] = cell;
  });
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

// Delete control from workbook
const deleteControlFromWorkbook = async (buffer, controlId) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  
  const controlsSheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('control')
  );
  
  if (!controlsSheetName) {
    throw new Error('Controls sheet not found');
  }
  
  const sheet = workbook.Sheets[controlsSheetName];
  const range = XLSX.utils.decode_range(sheet['!ref']);
  let controlRow = -1;
  
  // Find the control row
  for (let row = 1; row <= range.e.r; row++) {
    const id = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.CONTROL_ID })]);
    if (id === controlId) {
      controlRow = row;
      break;
    }
  }
  
  if (controlRow === -1) {
    throw new Error(`Control with ID ${controlId} not found`);
  }
  
  // Delete row by shifting all rows below up
  for (let row = controlRow; row < range.e.r; row++) {
    for (let col = 0; col <= range.e.c; col++) {
      const sourceCell = sheet[XLSX.utils.encode_cell({ r: row + 1, c: col })];
      const targetCell = XLSX.utils.encode_cell({ r: row, c: col });
      
      if (sourceCell) {
        sheet[targetCell] = sourceCell;
      } else {
        delete sheet[targetCell];
      }
    }
  }
  
  // Delete the last row
  for (let col = 0; col <= range.e.c; col++) {
    delete sheet[XLSX.utils.encode_cell({ r: range.e.r, c: col })];
  }
  
  // Update range
  range.e.r--;
  sheet['!ref'] = XLSX.utils.encode_range(range);
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

module.exports = {
  parseRisksFromWorkbook,
  parseControlsFromWorkbook,
  addRiskToWorkbook,
  updateRiskInWorkbook,
  deleteRiskFromWorkbook,
  addControlToWorkbook,
  updateControlInWorkbook,
  deleteControlFromWorkbook
};
