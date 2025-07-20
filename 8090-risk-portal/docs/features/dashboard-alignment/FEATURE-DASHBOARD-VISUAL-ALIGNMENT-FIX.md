# Feature: Dashboard Visual Alignment Fix

## Feature ID: FEATURE-005
## Date: 2025-07-21
## Status: PLANNED
## Priority: HIGH

## Problem Statement

The dashboard currently has several visual alignment issues that create an unprofessional appearance:

### Visual Issues (Based on Screenshots):

1. **Risk Matrix Cells Not Square**
   - Cells appear stretched horizontally
   - The aspect-square CSS class is not working properly within the grid context
   - Creates an unbalanced visual appearance

2. **Inconsistent Matrix Grid Gaps**
   - White lines appear between some cells but not others
   - The gap-0.5 class creates uneven spacing
   - Disrupts the cohesive heat map appearance

3. **Risk Details Table Content Cut Off**
   - Table columns are too narrow
   - Content is being truncated unnecessarily
   - Owner column particularly affected

4. **Poor Space Distribution**
   - Risk Landscape section takes up too much horizontal space
   - The grid-cols-[2fr,3fr] ratio makes the matrix section too narrow
   - Right column cards appear cramped

## Root Cause Analysis

### 1. CSS Grid Limitations with aspect-square
- The `aspect-square` utility doesn't work well within CSS grid containers
- Grid items inherit dimensions from the grid, overriding aspect ratio

### 2. Gap Handling in Nested Grids
- Multiple levels of gaps (parent and child grids) create compound spacing issues
- Small gaps (gap-0.5) create visible lines that break the heat map effect

### 3. Column Width Calculations
- Fixed column ratios don't account for content needs
- Table requires more space than allocated
- Matrix could be more compact

## Proposed Solution

### 1. Fix Risk Matrix Cell Sizing

#### Current Implementation:
```typescript
className={cn(
  "flex items-center justify-center rounded text-lg font-bold cursor-pointer transition-all aspect-square",
  cellColor,
  // ...
)}
```

#### Proposed Implementation:
```typescript
className={cn(
  "flex items-center justify-center rounded text-lg font-bold cursor-pointer transition-all w-full h-full",
  cellColor,
  // ...
)}

// And in the parent grid:
<div className="grid grid-rows-5 gap-0"> {/* Remove gap */}
  {[5, 4, 3, 2, 1].map(impact => (
    <div key={impact} className="grid grid-cols-5 gap-0 h-16"> {/* Fixed height + no gap */}
```

### 2. Adjust Risk Landscape Layout

#### Current Implementation:
```typescript
<div className="grid grid-cols-[2fr,3fr] divide-x divide-slate-200 flex-1 min-h-0">
```

#### Proposed Implementation:
```typescript
<div className="grid grid-cols-[5fr,7fr] divide-x divide-slate-200 flex-1 min-h-0">
```

### 3. Fix Table Layout

#### Current Implementation:
```typescript
<div className="h-full overflow-y-auto">
  <table className="w-full text-sm">
```

#### Proposed Implementation:
```typescript
<div className="h-full overflow-y-auto px-3"> {/* Add padding here instead of wrapper */}
  <table className="w-full text-sm table-fixed"> {/* Fixed layout for consistent columns */}
```

### 4. Update Column Widths

```typescript
<colgroup>
  <col className="w-20" /> {/* ID */}
  <col className="w-auto" /> {/* Risk - takes remaining space */}
  <col className="w-24" /> {/* Level */}
  <col className="w-28" /> {/* Status */}
  <col className="w-24" /> {/* Effect */}
  <col className="w-32" /> {/* Owner */}
</colgroup>
```

## Alternative Approaches Considered

### 1. Flexbox-based Matrix
- Use flexbox instead of grid for the matrix
- Pros: Better aspect ratio control
- Cons: More complex positioning logic

### 2. SVG-based Matrix
- Render matrix as SVG for pixel-perfect control
- Pros: Complete visual control
- Cons: Loses native HTML interactivity benefits

### 3. Fixed Pixel Dimensions
- Use exact pixel values for all elements
- Pros: Predictable layout
- Cons: Not responsive, breaks on different screen sizes

## Implementation Plan

1. **Phase 1: Matrix Fixes**
   - Remove gaps from matrix grid
   - Implement fixed row heights
   - Ensure cells remain square

2. **Phase 2: Layout Proportions**
   - Adjust column ratios
   - Test on different screen sizes
   - Ensure responsive behavior

3. **Phase 3: Table Optimization**
   - Implement fixed table layout
   - Add proper column widths
   - Fix text truncation

## Success Criteria

- [ ] Matrix cells appear perfectly square
- [ ] No visible gaps between matrix cells
- [ ] Risk details table content fully visible
- [ ] Consistent spacing throughout dashboard
- [ ] Responsive behavior maintained
- [ ] No horizontal scrolling required

## Testing Requirements

1. **Visual Testing**
   - Screenshot comparison before/after
   - Test on multiple screen resolutions
   - Verify in different browsers

2. **Functional Testing**
   - Matrix cell clicks still work
   - Table row clicks navigate correctly
   - Hover states function properly

3. **Responsive Testing**
   - Mobile viewport
   - Tablet viewport
   - Desktop viewport
   - Ultra-wide displays

## Risks and Mitigation

1. **Risk**: Fixed dimensions break responsiveness
   - **Mitigation**: Use rem units and media queries

2. **Risk**: Removing gaps affects visual hierarchy
   - **Mitigation**: Use borders or shadows for separation

3. **Risk**: Table changes affect data visibility
   - **Mitigation**: Implement tooltip for truncated content