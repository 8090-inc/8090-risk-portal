# Data Management Features Testing Checklist

## 1. Settings Page Access
- [ ] Navigate to Settings from the sidebar
- [ ] Page loads without errors
- [ ] Data Status widget shows on the right

## 2. Data Status Widget
- [ ] Shows "Last Updated" timestamp (or "Never" if no data)
- [ ] Displays correct risk and control counts
- [ ] Shows "Excel Import" as data source
- [ ] Validation status shows as "Data Valid"
- [ ] Refresh button is clickable

## 3. Data Upload Feature
- [ ] Click "Upload Excel File" button
- [ ] Modal appears with drag-and-drop area
- [ ] Close button (X) works
- [ ] Cancel button closes modal

### File Upload Testing
- [ ] Drag and drop an Excel file - should show file info
- [ ] Click "browse" link - file picker opens
- [ ] Upload non-Excel file - should be rejected
- [ ] Upload Excel with missing sheets - should show validation errors
- [ ] Upload valid Excel - should show success message

### Validation Display
- [ ] Errors are shown in red
- [ ] Warnings are shown in yellow
- [ ] Success message shows record counts
- [ ] Import button is disabled when validation fails
- [ ] Import button is enabled when validation passes

## 4. Export Features
- [ ] Export to Excel button works
- [ ] Export to PDF button opens new tab with printable report
- [ ] Export to CSV button downloads CSV file
- [ ] Exports include current filtered data

## 5. Dashboard Integration
- [ ] Navigate to Dashboard
- [ ] Data Status widget appears in the grid
- [ ] Shows same information as in Settings
- [ ] Refresh button updates data

## 6. Error Handling
- [ ] Upload corrupted Excel file - should show error
- [ ] Network error during import - should show error message
- [ ] Console shows detailed error information

## 7. Data Persistence
- [ ] After successful import, refresh page
- [ ] Data should persist (check localStorage)
- [ ] Last updated timestamp should remain

## Known Issues to Test
1. Excel files must have exact sheet names: "Risk Map", "Controls Mapping", "Scoring Result Index"
2. Risk IDs are generated as AIR-01, AIR-02, etc.
3. Control IDs use the first column or generate CTRL-XX format
4. PDF export opens in new tab for printing (not direct download)

## Test Data Requirements
Create an Excel file with:
- Sheet 1: "Risk Map" with 16 columns
- Sheet 2: "Controls Mapping" with 4 columns  
- Sheet 3: "Scoring Result Index" with 8 columns

Or use the sample data from the original General AI Risk Map.xlsx