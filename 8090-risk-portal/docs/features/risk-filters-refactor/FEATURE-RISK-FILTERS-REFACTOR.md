# Feature: Risk View Filters Refactor

## Feature ID: FEATURE-003
## Date: 2025-07-20
## Status: IMPLEMENTED
## Implemented: 2025-07-20

## Overview
Refactor the Risk View filters to simplify the interface and provide more space for the main risk table. This will reduce the filter options from 4 groups to 2 essential groups and implement a similar pattern to the Controls view refactor.

## Goals
1. Simplify filter options to only essential filters
2. Provide more horizontal space for the risk table
3. Maintain consistency with Controls view UI pattern
4. Preserve existing filter functionality for the retained filters

## Current State

### Filter Groups Currently Available:
1. **Risk Category** - Categories of risks (e.g., AI Human Impact Risks, Security and Data Risks)
2. **Risk Level** - Critical, High, Medium, Low
3. **Risk Owner** - List of responsible parties
4. **Control Status** - With Controls, Without Controls

### Current UI:
- CollapsibleFilterPanel on the left side
- Takes up significant horizontal space when expanded
- Risk table has limited width

## Desired State

### Filter Groups to Keep:
1. **Risk Category** - Essential for risk classification
2. **Risk Owner** - Essential for responsibility tracking

### Filter Groups to Remove:
- **Risk Level** - Can be seen directly in the table
- **Control Status** - Can be determined from the table data

### New UI Pattern:
- Toggle button approach similar to Controls view
- Inline filter panel when expanded
- Full width table for better data visibility

## Implementation Plan

### 1. Update RisksView Component

#### Remove unnecessary filter groups from `filterGroups`:
```typescript
// Keep only:
- Risk Category options
- Risk Owner options

// Remove:
- Level options
- Control options
```

#### Add state for filter panel toggle:
```typescript
const [showFilterPanel, setShowFilterPanel] = useState(false);
```

#### Replace CollapsibleFilterPanel with inline implementation:
- Add Filter toggle button
- Create inline filter panel (similar to Controls)
- Update layout for full width

### 2. Update Filter Logic

#### Modify filter application:
```typescript
// Keep:
- Category filtering
- Owner filtering

// Remove:
- Level filtering
- Control status filtering
```

#### Update saved filter sets:
- Remove references to level and controls filters
- Update default filter sets to only use category and owner

### 3. Files to Modify
- `/src/views/RisksView.tsx` - Main implementation
- No other files need modification

### 4. Implementation Steps

1. **Add imports**:
   ```typescript
   import { Badge } from '../components/ui/Badge';
   import { cn } from '../utils/cn';
   ```

2. **Add toggle state**:
   ```typescript
   const [showFilterPanel, setShowFilterPanel] = useState(false);
   ```

3. **Simplify filterGroups**:
   - Remove levelOptions
   - Remove controlOptions
   - Keep only category and owner options

4. **Update filter logic**:
   - Remove level filter checks
   - Remove controls filter checks

5. **Replace UI**:
   - Remove CollapsibleFilterPanel
   - Add Filter toggle button
   - Add inline filter panel

6. **Update default filter sets**:
   - Remove any that use level or controls
   - Keep/update ones using category or owner

## Testing Checklist

### Functional Testing
- [ ] Navigate to /risks page
- [ ] Verify only Risk Category and Risk Owner filters are shown
- [ ] Test filtering by category
- [ ] Test filtering by owner
- [ ] Test combining category and owner filters
- [ ] Verify filter counts are accurate
- [ ] Test clearing filters
- [ ] Verify saved filter sets work (if they use category/owner)

### UI Testing
- [ ] Risk table spans full width
- [ ] Filter toggle button shows/hides panel correctly
- [ ] Filter count badge updates correctly
- [ ] UI is consistent with Controls view
- [ ] Responsive behavior on different screen sizes

### Data Verification
- [ ] Filtered results match selected criteria
- [ ] Export includes only filtered data
- [ ] Risk counts update correctly with filters

### Edge Cases
- [ ] No risks in selected category
- [ ] No risks for selected owner
- [ ] Multiple filters with no results
- [ ] Clear filters restores all data

## Benefits
1. **Simplified UX** - Fewer options reduce cognitive load
2. **More Space** - Full width table shows more data
3. **Consistency** - Matches Controls view pattern
4. **Performance** - Fewer filters to compute
5. **Clarity** - Risk level is visible in table, no need for filter

## Risks & Mitigation
- **User Confusion**: Users may look for removed filters
  - Mitigation: Add tooltip explaining filters are in the table
- **Saved Filters**: Existing saved filters may break
  - Mitigation: Filter out incompatible saved filters

## Success Criteria
- [ ] Only 2 filter groups displayed
- [ ] Risk table uses full viewport width
- [ ] All filtering functionality works correctly
- [ ] UI matches Controls view pattern
- [ ] No console errors
- [ ] Performance is maintained or improved

## Notes
- Risk Level is prominently displayed in the table with color coding
- Control status can be inferred from the "Controls" column
- This change aligns with minimalist UI principles
- Future enhancement: Could add quick filter buttons for common selections