/**
 * Script to create a test Excel file for import testing
 */

const XLSX = require('xlsx');
const path = require('path');

// Create test data
const testRisks = [
  {
    'Risk Category': 'Test Category',
    'Risk Name': 'Test Risk 1 - Import Testing',
    'Risk Description': 'This is a test risk created for import testing',
    'Initial Likelihood': 3,
    'Initial Impact': 4,
    'Initial Risk Level': 12,
    'Initial Risk Level Category': 'High',
    'Example Mitigations': 'Test mitigation example',
    'Agreed Mitigation': 'Test agreed mitigation',
    'Proposed Oversight Ownership': 'IT Operations',
    'Proposed Support': 'Security Team',
    'Notes': 'Test notes',
    'Residual Likelihood': 2,
    'Residual Impact': 3,
    'Residual Risk Level': 6,
    'Residual Risk Level Category': 'Medium'
  },
  {
    'Risk Category': 'Test Category',
    'Risk Name': 'Test Risk 2 - Import Testing',
    'Risk Description': 'Another test risk for import testing',
    'Initial Likelihood': 4,
    'Initial Impact': 5,
    'Initial Risk Level': 20,
    'Initial Risk Level Category': 'Very High',
    'Example Mitigations': 'Another test mitigation',
    'Agreed Mitigation': 'Another agreed mitigation',
    'Proposed Oversight Ownership': 'Legal',
    'Proposed Support': 'Compliance Team',
    'Notes': 'More test notes',
    'Residual Likelihood': 2,
    'Residual Impact': 2,
    'Residual Risk Level': 4,
    'Residual Risk Level Category': 'Low'
  }
];

const testControls = [
  {
    'Mitigation ID': 'TEST-01',
    'Mitigation Description': 'Test Control 1 - This is a test control for import testing',
    '21 CFR Part 11 / Annex 11 Clause': '11.10(a)',
    'HIPAA Safeguard': 'Technical',
    'GDPR Article': 'Article 32',
    'EU AI Act Article': 'Article 15',
    'NIST 800-53 Control Family': 'AC',
    'SOC 2 TSC': 'CC6.1',
    'Risk Category': 'Test Category'
  },
  {
    'Mitigation ID': 'TEST-02',
    'Mitigation Description': 'Test Control 2 - Another test control for import testing',
    '21 CFR Part 11 / Annex 11 Clause': '11.10(d)',
    'HIPAA Safeguard': 'Administrative',
    'GDPR Article': 'Article 25',
    'EU AI Act Article': 'Article 14',
    'NIST 800-53 Control Family': 'AU',
    'SOC 2 TSC': 'CC7.2',
    'Risk Category': 'Test Category'
  }
];

// Create workbook
const wb = XLSX.utils.book_new();

// Add Risk Map sheet
const riskSheet = XLSX.utils.json_to_sheet(testRisks);
XLSX.utils.book_append_sheet(wb, riskSheet, 'Risk Map');

// Add Controls Mapping sheet
const controlsSheet = XLSX.utils.json_to_sheet(testControls);
XLSX.utils.book_append_sheet(wb, controlsSheet, 'Controls Mapping');

// Write file
const outputPath = path.join(__dirname, '..', 'test-data', 'test-import-data.xlsx');
XLSX.writeFile(wb, outputPath);

console.log(`✅ Test import file created at: ${outputPath}`);
console.log(`   - ${testRisks.length} test risks`);
console.log(`   - ${testControls.length} test controls`);