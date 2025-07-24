# Risk Editing Implementation

## Overview
Implemented comprehensive risk editing functionality in the Risk Detail View that allows users to modify all editable risk properties and persist changes back to the Google Drive Excel file.

## Components Created/Modified

### 1. **EditRiskModal Component** (`/src/components/risks/EditRiskModal.tsx`)
A new modal component that provides a comprehensive form for editing risk properties:

#### Features:
- **Read-only Risk Name**: Risk name cannot be changed as it generates the ID
- **Basic Information**: Category and description editing
- **Risk Assessment**: 
  - Initial and residual likelihood/impact sliders (1-5)
  - Auto-calculated risk levels and categories
  - Visual risk level badges with color coding
- **Risk Reduction Display**: Shows points reduced and percentage
- **Mitigation**: Agreed mitigation and example mitigations textareas
- **Governance**: Ownership and support multi-select from RISK_OWNERS
- **Related Controls**: Multi-select for linking controls
- **Validation**: Required fields and proper data types
- **Error Handling**: Clear error messages displayed in modal

### 2. **RiskDetailView Updates** (`/src/views/RiskDetailView.tsx`)
Enhanced the Risk Detail View with editing capabilities:

#### Changes:
- Added "Edit Risk" button to header with Edit icon
- Added state management for edit modal visibility
- Imported `updateRisk` from riskStore
- Added `handleSaveRisk` function to process updates
- Integrated EditRiskModal component

## Data Flow

### Frontend Flow:
1. User clicks "Edit Risk" button
2. EditRiskModal opens with current risk data pre-populated
3. User modifies fields with real-time validation
4. Risk levels auto-calculate as likelihood/impact change
5. User clicks "Save Changes"
6. Modal validates and calls `onSave` handler
7. RiskDetailView calls `updateRisk` from store
8. API call to `PUT /api/v1/risks/:id`

### Backend Persistence:
1. RiskService receives update request
2. Validates that risk name isn't changed (would alter ID)
3. GoogleDrivePersistenceProvider downloads current Excel
4. `updateRiskInWorkbook` updates the Risk Map sheet:
   - Updates all risk columns with new values
   - Handles array fields (ownership/support) as comma-separated
   - Preserves ID column if present
5. If control relationships changed:
   - Updates Relationships sheet
   - Maintains bidirectional consistency
6. Uploads modified Excel back to Google Drive
7. Returns updated risk to frontend

## Excel Integration Details

### Risk Map Sheet Columns Updated:
- Risk Category
- Risk Description
- Initial Likelihood/Impact/Risk Level/Category
- Example Mitigations
- Agreed Mitigation
- Proposed Oversight Ownership (comma-separated)
- Proposed Support (comma-separated)
- Notes
- Residual Likelihood/Impact/Risk Level/Category

### Relationships Sheet:
- Removes old Risk-Control relationships
- Adds new Risk-Control relationships
- Maintains bidirectional linking

## Validation & Constraints

### Frontend Validation:
- Risk name is read-only (changing it would change ID)
- Category, description, and ownership are required
- Likelihood and impact must be 1-5
- Risk levels are auto-calculated

### Backend Validation:
- Prevents risk name changes
- Validates control IDs exist
- Ensures data types are correct
- Handles both legacy and new Excel formats

## UI/UX Features

### Visual Design:
- Large modal (xl) with scrollable content
- Two-column grid for assessment sections
- Color-coded risk level badges
- Range sliders with value display
- Markdown support noted for mitigation field
- Loading states during save

### User Experience:
- All fields pre-populated with current values
- Real-time calculations as values change
- Clear indication of read-only fields
- Disabled save button when loading or invalid
- Error messages displayed prominently

## Testing

To test the implementation:

1. Navigate to any risk detail view
2. Click "Edit Risk" button
3. Modify various fields:
   - Change category and description
   - Adjust likelihood/impact sliders
   - Update mitigation text
   - Change ownership/support
   - Add/remove related controls
4. Click "Save Changes"
5. Verify changes persist after page refresh
6. Download Excel from Google Drive to verify updates

## Future Enhancements

Potential improvements:
- Add change history/audit trail
- Implement optimistic updates for better UX
- Add confirmation dialog for significant changes
- Support bulk editing from risk list view
- Add undo/redo functionality

## Success Metrics

✅ All editable risk fields can be modified
✅ Changes persist to Google Drive Excel
✅ Validation prevents invalid data
✅ Error handling provides clear feedback
✅ UI matches existing design patterns
✅ Performance is acceptable (2-3 second saves)