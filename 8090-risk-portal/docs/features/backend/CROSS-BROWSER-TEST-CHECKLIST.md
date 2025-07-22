# Cross-Browser Testing Checklist - Phase 4 Features

## Test Date: _____________
## Tester: _____________

## Browsers to Test
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Test Environment
- URL: http://localhost:3000 (development) or https://dompe.airiskportal.com (production)
- Make sure backend is running on port 3001

## Feature 1: Add Control Modal

### Test Steps:
1. Navigate to Risk Matrix view
2. Click the "+ Add Control" button

### Verify in each browser:
- [ ] Modal opens properly
- [ ] All form fields are visible and styled correctly
- [ ] Dropdowns (Category, Status, Effectiveness) work properly
- [ ] Text inputs accept input
- [ ] Textarea resizes appropriately
- [ ] Compliance mapping grid displays correctly (2 columns)
- [ ] Related Risks multi-select works
- [ ] Cancel button closes modal
- [ ] Add Control button is disabled when required fields are empty

### Create a test control:
- [ ] Select "Accuracy & Judgment" as category
- [ ] Enter "Browser Test Control" as description
- [ ] Select "Planned" as status
- [ ] Fill at least one compliance field
- [ ] Click Add Control
- [ ] Verify success message appears
- [ ] Verify modal closes

## Feature 2: Add Risk with Related Controls

### Test Steps:
1. Click the "Add Risk" button
2. Fill in all required fields
3. Scroll to "Related Controls" field

### Verify in each browser:
- [ ] Related Controls multi-select is visible
- [ ] Dropdown shows all available controls
- [ ] Can select multiple controls
- [ ] Selected controls show as tags/chips
- [ ] Can remove selected controls
- [ ] Control format shows as "ID - Description"

### Create a test risk:
- [ ] Fill all required fields
- [ ] Select 2-3 controls in Related Controls
- [ ] Click Add Risk
- [ ] Verify success message
- [ ] Check that risk appears in table

## Feature 3: CSV Export

### Test Steps:
1. Ensure at least one risk exists in the table
2. Click "Export CSV" button

### Verify in each browser:
- [ ] CSV file downloads
- [ ] File has correct name (risk-register.csv)
- [ ] Open file in Excel/spreadsheet app
- [ ] All columns are present
- [ ] Data is properly formatted
- [ ] Special characters handled correctly
- [ ] Related Control IDs column shows comma-separated values

## Feature 4: Page Title

### Verify in each browser:
- [ ] Page header shows "Risk Matrix" (without "Simple View")
- [ ] Title is properly styled
- [ ] No layout issues with shorter title

## UI/UX Consistency

### Check across all browsers:
- [ ] Button spacing is consistent
- [ ] Modal overlays work properly
- [ ] Form validation messages appear correctly
- [ ] Loading states work (if applicable)
- [ ] No console errors in developer tools
- [ ] Responsive behavior (resize window)

## Performance

### Note any issues:
- [ ] Slow modal opening
- [ ] Lag when typing in forms
- [ ] Slow multi-select interactions
- [ ] CSV export delays

## Browser-Specific Issues

### Chrome:
_Notes:_

### Firefox:
_Notes:_

### Safari:
_Notes:_

### Edge:
_Notes:_

## Summary
- [ ] All features work in all browsers
- [ ] No critical issues found
- [ ] Minor issues documented above

## Sign-off
- Tested by: _____________
- Date: _____________
- Approved for production: Yes / No