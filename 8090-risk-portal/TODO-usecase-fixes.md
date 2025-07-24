# Use Case (Opportunity Card) Bug Fixes TODO

## Phase 1: Critical Bug Fixes ⚡

- [x] 1.1 Add Missing Risk Management Route
  - [x] Create `UseCaseRiskManagementView.tsx` component
  - [x] Add route `/usecases/:id/risks` to `App.tsx`
  - [x] Implement UI to manage risk associations
  - [x] API endpoint already exists: `PUT /api/v1/usecases/:id/risks`

- [x] 1.2 Add Action Buttons to UseCaseCard
  - [x] Add Edit and Delete icon buttons
  - [x] Implement click handlers with event propagation
  - [x] Add hover states and tooltips

- [x] 1.3 Fix Navigation and Routes
  - [x] Verify all navigation paths
  - [x] Add breadcrumb navigation

## Phase 2: Feature Parity with Risks 🎯

- [ ] 2.1 Add Table View Option
  - [ ] Create `UseCaseTable.tsx` component
  - [ ] Add view toggle to `UseCasesView.tsx`
  - [ ] Persist view preference

- [ ] 2.2 Improve Detail View
  - [ ] Add tabs structure
  - [ ] Organize content into tabs
  - [ ] Add individual loading states

- [ ] 2.3 Standardize UI Patterns
  - [ ] Replace inline delete with modal
  - [ ] Consistent button styles
  - [ ] Proper loading/error states

## Phase 3: Missing Features 🔧

- [ ] 3.1 Export Functionality
  - [ ] Implement CSV/Excel export
  - [ ] Add export options
  - [ ] Include all fields

- [ ] 3.2 Form Validation
  - [ ] Date range validation
  - [ ] Numeric field validation
  - [ ] URL format validation

- [ ] 3.3 Bulk Operations
  - [ ] Add checkbox selection
  - [ ] Implement bulk delete
  - [ ] Add "Select All"

## Phase 4: Enhanced Features ✨

- [ ] 4.1 Audit Trail Display
  - [ ] Show timestamps
  - [ ] Display users
  - [ ] Include in export

- [ ] 4.2 Print Functionality
  - [ ] Print-friendly CSS
  - [ ] Print preview
  - [ ] Print buttons