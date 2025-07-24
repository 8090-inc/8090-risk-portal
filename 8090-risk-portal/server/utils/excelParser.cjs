const XLSX = require('xlsx');
const { generateRiskId } = require('./idGenerator.cjs');

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

// Column mappings for controls - matches actual Excel format
const CONTROL_COLUMNS = {
  MITIGATION_ID: 0,                   // "Mitigation ID"
  MITIGATION_DESCRIPTION: 1,          // "Mitigation Description"
  CFR_PART11_ANNEX11: 2,             // "21 CFR Part 11 / Annex 11 Clause"
  HIPAA_SAFEGUARD: 3,                // "HIPAA Safeguard"
  GDPR_ARTICLE: 4,                   // "GDPR Article"
  EU_AI_ACT_ARTICLE: 5,              // "EU AI Act Article"
  NIST_800_53: 6,                    // "NIST 800-53 Control Family"
  SOC_2_TSC: 7,                       // "SOC 2 TSC"
  RISK_CATEGORY: 8                    // "Risk Category"
};

// Column mappings for relationships
const RELATIONSHIP_COLUMNS = {
  CONTROL_ID: 0,                      // "Control ID"
  RISK_ID: 1,                         // "Risk ID"
  LINK_TYPE: 2,                       // "Link Type"
  EFFECTIVENESS: 3,                   // "Effectiveness"
  NOTES: 4,                           // "Notes"
  CREATED_DATE: 5,                    // "Created"
  LAST_UPDATED: 6                     // "Updated"
};

// Column mappings for use cases
const USE_CASE_COLUMNS = {
  ID: 0,                              // "Use Case ID"
  TITLE: 1,                           // "Title"
  DESCRIPTION: 2,                     // "Description"
  BUSINESS_AREA: 3,                   // "Business Area"
  AI_CATEGORIES: 4,                   // "AI Categories"
  CURRENT_STATE: 5,                   // "Current State"
  FUTURE_STATE: 6,                    // "Future State"
  SOLUTION: 7,                        // "Solution"
  BENEFITS: 8,                        // "Benefits"
  IMPACT_POINTS: 9,                   // "Impact Points"
  COST_SAVING: 10,                    // "Cost Saving"
  EFFORT_MONTHS: 11,                  // "Effort (Months)"
  FUNCTIONS_IMPACTED: 12,             // "Functions Impacted"
  DATA_REQUIREMENTS: 13,              // "Data Requirements"
  AI_COMPLEXITY: 14,                  // "AI Complexity"
  FEASIBILITY: 15,                    // "Feasibility"
  VALUE: 16,                          // "Value"
  RISK: 17,                           // "Risk"
  STATUS: 18,                         // "Status"
  IMPLEMENTATION_START: 19,           // "Implementation Start"
  IMPLEMENTATION_END: 20,             // "Implementation End"
  OWNER: 21,                          // "Owner"
  STAKEHOLDERS: 22,                   // "Stakeholders"
  NOTES: 23,                          // "Notes"
  CREATED_DATE: 24,                   // "Created Date"
  LAST_UPDATED: 25                    // "Last Updated"
};

// Valid control ID pattern
const CONTROL_ID_PATTERN = /^(ACC|SEC|LOG|GOV|TEST)-\d{2}$/;

// Valid use case ID pattern
const USE_CASE_ID_PATTERN = /^UC-\d{3}$/;

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
  if (typeof value === 'number') return [value.toString()];
  if (typeof value !== 'string') return [];
  return value.split(',').map(item => item.trim()).filter(item => item);
};

// Risk ID generation is handled by idGenerator.cjs

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
      proposedOversightOwnership: parseArrayValue(getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: columns.PROPOSED_OVERSIGHT_OWNERSHIP })]) || ''),
      proposedSupport: parseArrayValue(getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: columns.PROPOSED_SUPPORT })]) || ''),
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
      relatedControlIds: [], // Will be populated from relationships sheet
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

// Parse relationships from workbook
const parseRelationshipsFromWorkbook = async (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  
  // Look for Relationships sheet
  const relationshipsSheetName = workbook.SheetNames.find(name => 
    name.toLowerCase() === 'relationships'
  );
  
  if (!relationshipsSheetName) {
    return [];
  }
  
  const sheet = workbook.Sheets[relationshipsSheetName];
  const relationships = [];
  const range = XLSX.utils.decode_range(sheet['!ref']);
  
  // Start from row 1 (skip header row)
  for (let row = 1; row <= range.e.r; row++) {
    const controlId = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: RELATIONSHIP_COLUMNS.CONTROL_ID })]);
    const riskId = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: RELATIONSHIP_COLUMNS.RISK_ID })]);
    
    if (!controlId || !riskId) continue;
    
    const relationship = {
      controlId,
      riskId,
      linkType: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: RELATIONSHIP_COLUMNS.LINK_TYPE })]) || 'Mitigates',
      effectiveness: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: RELATIONSHIP_COLUMNS.EFFECTIVENESS })]) || 'Medium',
      notes: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: RELATIONSHIP_COLUMNS.NOTES })]) || '',
      createdDate: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: RELATIONSHIP_COLUMNS.CREATED_DATE })]) || new Date().toISOString(),
      lastUpdated: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: RELATIONSHIP_COLUMNS.LAST_UPDATED })]) || new Date().toISOString()
    };
    
    relationships.push(relationship);
  }
  
  return relationships;
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
  
  console.log(`[ExcelParser] Parsing controls from sheet: ${controlsSheetName}`);
  console.log(`[ExcelParser] Sheet range: ${sheet['!ref']}, Last row: ${range.e.r}`);
  
  // Start from row 1 (skip header row at row 0)
  for (let row = 1; row <= range.e.r; row++) {
    const mitigationId = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.MITIGATION_ID })]);
    const mitigationDesc = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.MITIGATION_DESCRIPTION })]);
    
    // Skip if no valid control ID
    if (!mitigationId || !CONTROL_ID_PATTERN.test(mitigationId)) {
      if (mitigationId) {
        console.log(`[ExcelParser] Row ${row}: Skipping invalid control ID: ${mitigationId}`);
      }
      continue;
    }
    if (!mitigationDesc) {
      console.log(`[ExcelParser] Row ${row}: Skipping ${mitigationId} - no description`);
      continue;
    }
    
    // Read category from Risk Category column
    let category = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.RISK_CATEGORY })]);
    
    // If no category in column, determine from control ID prefix
    if (!category) {
      const prefix = mitigationId.split('-')[0];
      const categoryMapping = {
        'ACC': 'Accuracy & Judgment',
        'SEC': 'Security & Data Privacy',
        'LOG': 'Audit & Traceability',
        'GOV': 'Governance & Compliance',
        'TEST': 'Test Category'
      };
      category = categoryMapping[prefix] || 'General';
      console.log(`[ExcelParser] No category in column for ${mitigationId}, using ${category} based on prefix`);
    }
    
    const control = {
      mitigationID: mitigationId,
      mitigationDescription: mitigationDesc,
      category: category,
      // Compliance fields
      compliance: {
        cfrPart11Annex11: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.CFR_PART11_ANNEX11 })]),
        hipaaSafeguard: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.HIPAA_SAFEGUARD })]),
        gdprArticle: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.GDPR_ARTICLE })]),
        euAiActArticle: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.EU_AI_ACT_ARTICLE })]),
        nist80053: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.NIST_800_53 })]),
        soc2TSC: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.SOC_2_TSC })])
      },
      // Default operational fields (not in Excel but needed by API)
      implementationStatus: 'Planned',
      effectiveness: 'Not Assessed',
      owner: '',
      lastReviewDate: '',
      nextReviewDate: '',
      evidence: '',
      relatedRiskIds: [], // Will be populated from relationships sheet
      notes: '',
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    controls.push(control);
  }
  
  console.log(`[ExcelParser] Total controls parsed: ${controls.length}`);
  console.log(`[ExcelParser] Control IDs: ${controls.map(c => c.mitigationID).join(', ')}`);
  
  // Check for specific missing controls
  const missingControls = ['ACC-04', 'LOG-04'];
  missingControls.forEach(id => {
    if (!controls.find(c => c.mitigationID === id)) {
      console.log(`[ExcelParser] WARNING: Expected control ${id} not found in parsed data`);
    }
  });
  
  return controls;
};

// Parse use cases from workbook
const parseUseCasesFromWorkbook = async (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  
  // Look for Use Cases sheet
  const useCasesSheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('use') && name.toLowerCase().includes('case')
  );
  
  if (!useCasesSheetName) {
    return [];
  }
  
  const sheet = workbook.Sheets[useCasesSheetName];
  const useCases = [];
  const range = XLSX.utils.decode_range(sheet['!ref']);
  
  console.log(`[ExcelParser] Parsing use cases from sheet: ${useCasesSheetName}`);
  console.log(`[ExcelParser] Sheet range: ${sheet['!ref']}, Last row: ${range.e.r}`);
  
  // Start from row 1 (skip header row at row 0)
  for (let row = 1; row <= range.e.r; row++) {
    const useCaseId = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.ID })]);
    const title = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.TITLE })]);
    
    // Skip if no valid use case ID
    if (!useCaseId || !USE_CASE_ID_PATTERN.test(useCaseId)) {
      if (useCaseId) {
        console.log(`[ExcelParser] Row ${row}: Skipping invalid use case ID: ${useCaseId}`);
      }
      continue;
    }
    if (!title) {
      console.log(`[ExcelParser] Row ${row}: Skipping ${useCaseId} - no title`);
      continue;
    }
    
    const useCase = {
      id: useCaseId,
      title: title,
      description: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.DESCRIPTION })]),
      businessArea: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.BUSINESS_AREA })]),
      aiCategories: parseArrayValue(getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.AI_CATEGORIES })]) || ''),
      objective: {
        currentState: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.CURRENT_STATE })]),
        futureState: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.FUTURE_STATE })]),
        solution: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.SOLUTION })]),
        benefits: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.BENEFITS })])
      },
      impact: {
        impactPoints: parseArrayValue(getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.IMPACT_POINTS })]) || ''),
        costSaving: Number(getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.COST_SAVING })])) || 0,
        effortMonths: Number(getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.EFFORT_MONTHS })])) || 0
      },
      execution: {
        functionsImpacted: parseArrayValue(getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.FUNCTIONS_IMPACTED })]) || ''),
        dataRequirements: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.DATA_REQUIREMENTS })]),
        aiComplexity: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.AI_COMPLEXITY })]),
        feasibility: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.FEASIBILITY })]),
        value: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.VALUE })]),
        risk: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.RISK })])
      },
      status: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.STATUS })]) || 'Concept',
      implementationStart: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.IMPLEMENTATION_START })]),
      implementationEnd: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.IMPLEMENTATION_END })]),
      owner: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.OWNER })]),
      stakeholders: parseArrayValue(getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.STAKEHOLDERS })]) || ''),
      notes: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.NOTES })]),
      createdDate: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.CREATED_DATE })]) || new Date().toISOString(),
      lastUpdated: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.LAST_UPDATED })]) || new Date().toISOString(),
      relatedRiskIds: [] // Will be populated from relationships sheet
    };
    
    useCases.push(useCase);
  }
  
  console.log(`[ExcelParser] Total use cases parsed: ${useCases.length}`);
  console.log(`[ExcelParser] Use case IDs: ${useCases.map(uc => uc.id).join(', ')}`);
  
  return useCases;
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
      if (riskName && generateRiskId(riskName) === riskId) {
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
      if (riskName && generateRiskId(riskName) === riskId) {
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
    // Create new Controls sheet with actual format
    controlsSheetName = 'Controls Mapping';
    const newSheet = XLSX.utils.aoa_to_sheet([
      ['Mitigation ID', 'Mitigation Description', '21 CFR Part 11 / Annex 11 Clause', 
       'HIPAA Safeguard', 'GDPR Article', 'EU AI Act Article', 
       'NIST 800-53 Control Family', 'SOC 2 TSC', 'Risk Category']
    ]);
    workbook.Sheets[controlsSheetName] = newSheet;
    workbook.SheetNames.push(controlsSheetName);
  }
  
  const sheet = workbook.Sheets[controlsSheetName];
  const range = XLSX.utils.decode_range(sheet['!ref']);
  const newRow = range.e.r + 1;
  
  // Add new control data - matching the actual Excel format
  const rowData = [
    newControl.mitigationID,
    newControl.mitigationDescription,
    newControl.compliance?.cfrPart11Annex11 || '',
    newControl.compliance?.hipaaSafeguard || '',
    newControl.compliance?.gdprArticle || '',
    newControl.compliance?.euAiActArticle || '',
    newControl.compliance?.nist80053 || '',
    newControl.compliance?.soc2TSC || '',
    newControl.category || 'General'
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
    const id = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.MITIGATION_ID })]);
    if (id === controlId) {
      controlRow = row;
      break;
    }
  }
  
  if (controlRow === -1) {
    throw new Error(`Control with ID ${controlId} not found`);
  }
  
  // Update control data - matching the actual Excel format
  const rowData = [
    updatedControl.mitigationID,
    updatedControl.mitigationDescription,
    updatedControl.compliance?.cfrPart11Annex11 || '',
    updatedControl.compliance?.hipaaSafeguard || '',
    updatedControl.compliance?.gdprArticle || '',
    updatedControl.compliance?.euAiActArticle || '',
    updatedControl.compliance?.nist80053 || '',
    updatedControl.compliance?.soc2TSC || '',
    updatedControl.category || 'General'
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
    const id = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: CONTROL_COLUMNS.MITIGATION_ID })]);
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

// Add relationship to workbook
const addRelationshipToWorkbook = async (buffer, controlId, riskId, linkType = 'Mitigates', effectiveness = 'Medium', notes = '') => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  
  // Find or create Relationships sheet
  let relationshipsSheetName = workbook.SheetNames.find(name => 
    name.toLowerCase() === 'relationships'
  );
  
  if (!relationshipsSheetName) {
    // Create new Relationships sheet
    relationshipsSheetName = 'Relationships';
    const newSheet = XLSX.utils.aoa_to_sheet([
      ['Control ID', 'Risk ID', 'Link Type', 'Effectiveness', 'Notes', 'Created', 'Updated']
    ]);
    workbook.Sheets[relationshipsSheetName] = newSheet;
    workbook.SheetNames.push(relationshipsSheetName);
  }
  
  const sheet = workbook.Sheets[relationshipsSheetName];
  const range = XLSX.utils.decode_range(sheet['!ref']);
  const newRow = range.e.r + 1;
  
  // Add new relationship data
  const now = new Date().toISOString();
  const rowData = [
    controlId,
    riskId,
    linkType,
    effectiveness,
    notes,
    now,
    now
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

// Remove relationship from workbook
const removeRelationshipFromWorkbook = async (buffer, controlId, riskId) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  
  const relationshipsSheetName = workbook.SheetNames.find(name => 
    name.toLowerCase() === 'relationships'
  );
  
  if (!relationshipsSheetName) {
    return buffer; // No relationships sheet, nothing to remove
  }
  
  const sheet = workbook.Sheets[relationshipsSheetName];
  const range = XLSX.utils.decode_range(sheet['!ref']);
  
  // Find the relationship row
  let relationshipRow = -1;
  for (let row = 1; row <= range.e.r; row++) {
    const rowControlId = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: RELATIONSHIP_COLUMNS.CONTROL_ID })]);
    const rowRiskId = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: RELATIONSHIP_COLUMNS.RISK_ID })]);
    
    if (rowControlId === controlId && rowRiskId === riskId) {
      relationshipRow = row;
      break;
    }
  }
  
  if (relationshipRow === -1) {
    return buffer; // Relationship not found
  }
  
  // Delete row by shifting all rows below up
  for (let row = relationshipRow; row < range.e.r; row++) {
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

// Remove all relationships for a risk
const removeAllRelationshipsForRisk = async (buffer, riskId) => {
  const relationships = await parseRelationshipsFromWorkbook(buffer);
  let currentBuffer = buffer;
  
  for (const rel of relationships) {
    if (rel.riskId === riskId) {
      currentBuffer = await removeRelationshipFromWorkbook(currentBuffer, rel.controlId, riskId);
    }
  }
  
  return currentBuffer;
};

// Remove all relationships for a control
const removeAllRelationshipsForControl = async (buffer, controlId) => {
  const relationships = await parseRelationshipsFromWorkbook(buffer);
  let currentBuffer = buffer;
  
  for (const rel of relationships) {
    if (rel.controlId === controlId) {
      currentBuffer = await removeRelationshipFromWorkbook(currentBuffer, controlId, rel.riskId);
    }
  }
  
  return currentBuffer;
};

// Get next use case ID
const getNextUseCaseId = async (buffer) => {
  const useCases = await parseUseCasesFromWorkbook(buffer);
  if (useCases.length === 0) {
    return 'UC-001';
  }
  
  // Extract numeric parts and find highest
  const ids = useCases.map(uc => {
    const match = uc.id.match(/^UC-(\d{3})$/);
    return match ? parseInt(match[1], 10) : 0;
  });
  
  const maxId = Math.max(...ids);
  const nextId = maxId + 1;
  
  // Format with leading zeros
  return `UC-${nextId.toString().padStart(3, '0')}`;
};

// Add use case to workbook
const addUseCaseToWorkbook = async (buffer, newUseCase) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  
  // Find or create Use Cases sheet
  let useCasesSheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('use') && name.toLowerCase().includes('case')
  );
  
  if (!useCasesSheetName) {
    // Create new Use Cases sheet with headers
    useCasesSheetName = 'Use Cases';
    const newSheet = XLSX.utils.aoa_to_sheet([
      ['Use Case ID', 'Title', 'Description', 'Business Area', 'AI Categories',
       'Current State', 'Future State', 'Solution', 'Benefits', 'Impact Points',
       'Cost Saving', 'Effort (Months)', 'Functions Impacted', 'Data Requirements',
       'AI Complexity', 'Feasibility', 'Value', 'Risk', 'Status',
       'Implementation Start', 'Implementation End', 'Owner', 'Stakeholders',
       'Notes', 'Created Date', 'Last Updated']
    ]);
    workbook.Sheets[useCasesSheetName] = newSheet;
    workbook.SheetNames.push(useCasesSheetName);
  }
  
  const sheet = workbook.Sheets[useCasesSheetName];
  const range = XLSX.utils.decode_range(sheet['!ref']);
  const newRow = range.e.r + 1;
  
  // Generate ID if not provided
  if (!newUseCase.id) {
    newUseCase.id = await getNextUseCaseId(buffer);
  }
  
  // Add new use case data
  const rowData = [
    newUseCase.id,
    newUseCase.title,
    newUseCase.description || '',
    newUseCase.businessArea || '',
    Array.isArray(newUseCase.aiCategories) ? newUseCase.aiCategories.join(', ') : (newUseCase.aiCategories || ''),
    newUseCase.objective?.currentState || '',
    newUseCase.objective?.futureState || '',
    newUseCase.objective?.solution || '',
    newUseCase.objective?.benefits || '',
    Array.isArray(newUseCase.impact?.impactPoints) ? newUseCase.impact.impactPoints.join(', ') : (newUseCase.impact?.impactPoints || ''),
    newUseCase.impact?.costSaving || 0,
    newUseCase.impact?.effortMonths || 0,
    Array.isArray(newUseCase.execution?.functionsImpacted) ? newUseCase.execution.functionsImpacted.join(', ') : (newUseCase.execution?.functionsImpacted || ''),
    newUseCase.execution?.dataRequirements || '',
    newUseCase.execution?.aiComplexity || '',
    newUseCase.execution?.feasibility || '',
    newUseCase.execution?.value || '',
    newUseCase.execution?.risk || '',
    newUseCase.status || 'Concept',
    newUseCase.implementationStart || '',
    newUseCase.implementationEnd || '',
    newUseCase.owner || '',
    Array.isArray(newUseCase.stakeholders) ? newUseCase.stakeholders.join(', ') : (newUseCase.stakeholders || ''),
    newUseCase.notes || '',
    new Date().toISOString(),
    new Date().toISOString()
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

// Update use case in workbook
const updateUseCaseInWorkbook = async (buffer, useCaseId, updatedUseCase) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  
  const useCasesSheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('use') && name.toLowerCase().includes('case')
  );
  
  if (!useCasesSheetName) {
    throw new Error('Use Cases sheet not found');
  }
  
  const sheet = workbook.Sheets[useCasesSheetName];
  const range = XLSX.utils.decode_range(sheet['!ref']);
  let useCaseRow = -1;
  
  // Find the use case row
  for (let row = 1; row <= range.e.r; row++) {
    const id = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.ID })]);
    if (id === useCaseId) {
      useCaseRow = row;
      break;
    }
  }
  
  if (useCaseRow === -1) {
    throw new Error(`Use case with ID ${useCaseId} not found`);
  }
  
  // Update use case data
  const rowData = [
    updatedUseCase.id || useCaseId,
    updatedUseCase.title || '',
    updatedUseCase.description || '',
    updatedUseCase.businessArea || '',
    Array.isArray(updatedUseCase.aiCategories) ? updatedUseCase.aiCategories.join(', ') : (updatedUseCase.aiCategories || ''),
    updatedUseCase.objective?.currentState || '',
    updatedUseCase.objective?.futureState || '',
    updatedUseCase.objective?.solution || '',
    updatedUseCase.objective?.benefits || '',
    Array.isArray(updatedUseCase.impact?.impactPoints) ? updatedUseCase.impact.impactPoints.join(', ') : (updatedUseCase.impact?.impactPoints || ''),
    updatedUseCase.impact?.costSaving || 0,
    updatedUseCase.impact?.effortMonths || 0,
    Array.isArray(updatedUseCase.execution?.functionsImpacted) ? updatedUseCase.execution.functionsImpacted.join(', ') : (updatedUseCase.execution?.functionsImpacted || ''),
    updatedUseCase.execution?.dataRequirements || '',
    updatedUseCase.execution?.aiComplexity || '',
    updatedUseCase.execution?.feasibility || '',
    updatedUseCase.execution?.value || '',
    updatedUseCase.execution?.risk || '',
    updatedUseCase.status || 'Concept',
    updatedUseCase.implementationStart || '',
    updatedUseCase.implementationEnd || '',
    updatedUseCase.owner || '',
    Array.isArray(updatedUseCase.stakeholders) ? updatedUseCase.stakeholders.join(', ') : (updatedUseCase.stakeholders || ''),
    updatedUseCase.notes || '',
    getCellValue(sheet[XLSX.utils.encode_cell({ r: useCaseRow, c: USE_CASE_COLUMNS.CREATED_DATE })]) || new Date().toISOString(),
    new Date().toISOString()
  ];
  
  rowData.forEach((value, colIndex) => {
    const cell = { t: typeof value === 'number' ? 'n' : 's', v: value };
    sheet[XLSX.utils.encode_cell({ r: useCaseRow, c: colIndex })] = cell;
  });
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

// Delete use case from workbook
const deleteUseCaseFromWorkbook = async (buffer, useCaseId) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  
  const useCasesSheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('use') && name.toLowerCase().includes('case')
  );
  
  if (!useCasesSheetName) {
    throw new Error('Use Cases sheet not found');
  }
  
  const sheet = workbook.Sheets[useCasesSheetName];
  const range = XLSX.utils.decode_range(sheet['!ref']);
  let useCaseRow = -1;
  
  // Find the use case row
  for (let row = 1; row <= range.e.r; row++) {
    const id = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: USE_CASE_COLUMNS.ID })]);
    if (id === useCaseId) {
      useCaseRow = row;
      break;
    }
  }
  
  if (useCaseRow === -1) {
    throw new Error(`Use case with ID ${useCaseId} not found`);
  }
  
  // Delete row by shifting all rows below up
  for (let row = useCaseRow; row < range.e.r; row++) {
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

// Remove all relationships for a use case
const removeAllRelationshipsForUseCase = async (buffer, useCaseId) => {
  const relationships = await parseRelationshipsFromWorkbook(buffer);
  let currentBuffer = buffer;
  
  for (const rel of relationships) {
    if (rel.linkType === 'UseCase-Risk' && rel.controlId === useCaseId) {
      currentBuffer = await removeRelationshipFromWorkbook(currentBuffer, useCaseId, rel.riskId);
    }
  }
  
  return currentBuffer;
};

module.exports = {
  parseRisksFromWorkbook,
  parseControlsFromWorkbook,
  parseRelationshipsFromWorkbook,
  parseUseCasesFromWorkbook,
  addRiskToWorkbook,
  updateRiskInWorkbook,
  deleteRiskFromWorkbook,
  addControlToWorkbook,
  updateControlInWorkbook,
  deleteControlFromWorkbook,
  addUseCaseToWorkbook,
  updateUseCaseInWorkbook,
  deleteUseCaseFromWorkbook,
  addRelationshipToWorkbook,
  removeRelationshipFromWorkbook,
  removeAllRelationshipsForRisk,
  removeAllRelationshipsForControl,
  removeAllRelationshipsForUseCase
};
