# Excel Parser Implementation Plan

## Problem Statement

The current Excel parser is only finding 7 out of 33 risks because:
1. It's parsing the header row as data (first "risk" is literally "Risk Category" | "Risk")
2. It stops at the first empty row between risk categories
3. It starts parsing from row 1, but the actual Excel has multiple header rows

## Excel File Structure

The production Google Drive file (ID: 1OzrkAUQTWY7VUNrX-_akCWIuU2ALR3sm) has this structure:

```
Row 0-3: Title, merged cells, section headers
Row 4: Column headers (approximate)
Row 5+: Data starts (approximate)

Column Layout:
0: Risk Category
1: Risk Name
2: Risk Description
3: Initial Likelihood
4: Initial Impact
5: Initial Risk Level
6: Initial Risk Level Category
7: Example Mitigations
8: Agreed Mitigation
9: Proposed Oversight Ownership
10: Proposed Support
11: Notes
12: Residual Likelihood
13: Residual Impact
14: Residual Risk Level
15: Residual Risk Level Category
```

Risk sections are separated by empty rows between categories.

## Solution Implementation

### 1. Dynamic Header Detection

Instead of hardcoding the start row, dynamically find where data begins:

```javascript
const findDataStartRow = (sheet, range) => {
  for (let row = 0; row <= Math.min(20, range.e.r); row++) {
    const likelihood = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: 4 })]);
    const impact = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: 5 })]);
    const riskName = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: 1 })]);
    
    if (typeof likelihood === 'number' && likelihood >= 1 && likelihood <= 5 &&
        typeof impact === 'number' && impact >= 1 && impact <= 5 &&
        riskName && !['Risk', 'Risk Name', 'Name'].includes(riskName)) {
      return row;
    }
  }
  return -1;
};
```

### 2. Full Sheet Scanning

Scan the entire sheet instead of stopping at empty rows:

```javascript
for (let row = dataStartRow; row <= range.e.r; row++) {
  const riskName = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: 1 })]);
  
  // Skip empty rows but continue scanning
  if (!riskName || riskName.trim() === '') continue;
  
  // Skip header-like values
  if (isHeaderValue(riskName)) continue;
  
  // Process the risk...
}
```

### 3. Category Inheritance

Handle risks that don't have an explicit category (using the last valid category):

```javascript
let lastValidCategory = null;

for (let row = dataStartRow; row <= range.e.r; row++) {
  const riskCategory = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: 0 })]);
  
  if (riskCategory && isValidRiskCategory(riskCategory)) {
    lastValidCategory = riskCategory;
  }
  
  const effectiveCategory = riskCategory || lastValidCategory;
  // Use effectiveCategory for the risk
}
```

### 4. Validation Functions

```javascript
const isValidRiskCategory = (category) => {
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

const isHeaderValue = (value) => {
  const headers = ['Risk', 'Risk Name', 'Name', 'Category', 'Description'];
  return headers.includes(value);
};
```

## Expected Outcomes

1. **All risks parsed**: Should find all 33 risks from the Excel file
2. **All controls parsed**: Should find all 13 controls
3. **No header data**: No header rows should be parsed as risks
4. **Dynamic handling**: Solution works regardless of exact row numbers
5. **Future-proof**: Handles addition/removal of risks and controls

## Testing

1. Verify risk count matches expected (currently 33)
2. Verify control count matches expected (currently 13)
3. Check that first risk is NOT "Risk Category" | "Risk"
4. Ensure all risk categories are valid
5. Test that views display data correctly

## Monitoring

Add logging to track:
- Number of risks found
- Number of controls found
- Data start row detected
- Any skipped rows and why
- Parsing errors or warnings