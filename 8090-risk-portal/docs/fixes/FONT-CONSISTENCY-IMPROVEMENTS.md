# Font Consistency Improvements

## Date: 2025-07-24

### Objective
Improve font hierarchy and consistency across the application for better readability and visual hierarchy.

## Changes Made

### 1. Page Headers
- **PageHeader component**: Increased from `text-2xl` to `text-3xl font-semibold`
- **Dashboard title**: Increased from `text-lg` to `text-2xl font-semibold`
- Creates proper distinction between page titles and section headers

### 2. Table Typography
- **Table headers**: 
  - Increased from `text-xs` to `text-sm font-medium`
  - Removed uppercase styling for better readability
  - Changed color from `text-slate-600` to `text-slate-700`
- **ID links**: Increased from `text-xs` to `text-sm` to match cell content
- **Category badges**: Increased from `text-xs` to `text-sm`
- **Status/effectiveness text**: Increased from `text-xs` to `text-sm`

### 3. Card Headers
- **UseCase detail view**: Standardized all card headers from `text-base` to `text-lg font-semibold`
- Creates clear hierarchy between page title → section headers → content

### 4. Visual Hierarchy Established
1. **Page titles**: `text-3xl font-semibold` (e.g., "Risk Register")
2. **Dashboard/major titles**: `text-2xl font-semibold` 
3. **Section headers**: `text-lg font-semibold` (card titles)
4. **Content**: `text-sm` (minimum for important content)
5. **Metadata**: `text-xs` (only for secondary info)

## Impact

### Readability
- No more tiny `text-xs` for important content
- Table headers now properly readable
- Clear visual hierarchy guides the eye

### Consistency
- Similar elements now use same font sizes
- Predictable sizing across views
- Professional, polished appearance

### Accessibility
- Minimum readable sizes maintained
- Better contrast with darker colors
- Proper font weights for emphasis

## Technical Notes
- All changes use Tailwind utilities
- No custom CSS required
- Maintains responsive design
- Build size unchanged