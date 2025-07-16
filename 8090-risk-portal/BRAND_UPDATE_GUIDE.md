# 8090 AI Risk Portal - Brand Update Guide

## Brand Guidelines Summary

### Color Palette

#### Primary Colors
- **Accent Color**: `#0055D4` - Used as the primary brand accent
- **Neutral Colors**: Tailwind CSS Slate palette (slate-50 to slate-950)
- **Pure White**: `#FFFFFF` for backgrounds
- **Text Colors**: Slate shades (never pure black #000000)

#### Secondary Colors (WCAG AA Compliant)
- **Risk Levels**:
  - Critical: `#DC2626` (red-600)
  - High: `#EA580C` (orange-600)
  - Medium: `#D97706` (amber-600)
  - Low: `#16A34A` (green-600)

- **Status Colors**:
  - Implemented: `#16A34A` (green-600)
  - In Progress: `#0891B2` (cyan-600)
  - Not Implemented: `#64748B` (slate-500)
  - Overdue: `#DC2626` (red-600)
  - Due Soon: `#D97706` (amber-600)

### Typography
- **Font Family**: Figtree (weights: 400, 500, 600)
- **Font Weights**: 
  - Regular (400) for body text
  - Medium (500) for emphasis
  - Semi-bold (600) for headings

### Design System
- **Border Radius**: 8px (consistent rounded corners)
- **Focus States**: Ring-2 with accent color
- **Shadows**: Subtle slate-based shadows
- **Spacing**: Consistent use of Tailwind spacing scale

## Component Updates Required

### 1. Button Components
**Files**: `/src/components/ui/Button/Button.tsx`

**Current Usage**: Various button styles
**Update Required**:
- Primary buttons: Use `bg-accent` with proper hover states
- Secondary buttons: Use `bg-slate-100` with slate text
- Ensure all buttons have 8px border radius
- Add proper focus rings with accent color

### 2. Badge Components
**Files**: `/src/components/ui/Badge/Badge.tsx`, `/src/components/risks/RiskLevelBadge.tsx`

**Update Required**:
- Update risk level badges to use new WCAG AA compliant colors
- Ensure badges have proper contrast ratios
- Use ring utilities for subtle borders

### 3. Card Components
**Files**: `/src/components/ui/Card/Card.tsx`, `/src/components/controls/ControlSummaryCard.tsx`

**Update Required**:
- Ensure 8px border radius
- Use slate borders and shadows
- White backgrounds with proper hierarchy

### 4. Form Components
**Files**: `/src/components/ui/Input/Input.tsx`, `/src/components/ui/Select/Select.tsx`

**Update Required**:
- Focus states should use accent color
- Border colors should use slate-300
- Ensure proper text contrast

### 5. Table Components
**Files**: `/src/components/controls/ControlsTable.tsx`, `/src/components/risks/RiskTable.tsx`

**Update Required**:
- Header backgrounds: `bg-slate-50`
- Borders: `border-slate-200`
- Hover states: `hover:bg-slate-50`

### 6. Navigation Components
**Files**: `/src/components/layout/Sidebar.tsx`, `/src/components/layout/Header.tsx`

**Update Required**:
- Active states: Use accent color appropriately
- Hover states: Subtle slate backgrounds
- Text colors: Proper slate hierarchy

### 7. Modal Components
**Files**: `/src/components/ui/Modal/Modal.tsx`

**Update Required**:
- Backdrop: `bg-slate-900/50`
- Content: White background with 8px radius
- Borders: `border-slate-200`

## Color Usage Patterns

### Text Hierarchy
```css
/* Primary text - headlines, important content */
.text-primary { color: slate-900; }

/* Secondary text - body content */
.text-secondary { color: slate-700; }

/* Tertiary text - supporting content */
.text-tertiary { color: slate-600; }

/* Muted text - disabled, placeholder */
.text-muted { color: slate-500; }
```

### Interactive Elements
```css
/* Links and clickable text */
.link { color: accent; }
.link:hover { color: accent-700; }

/* Buttons */
.btn-primary { 
  background: accent;
  color: white;
}
.btn-primary:hover { 
  background: accent-600;
}

/* Form inputs */
.input:focus { 
  border-color: accent;
  ring-color: accent;
}
```

### Status Indicators
```css
/* Success states */
.success { 
  background: green-50;
  color: green-800;
  border: green-200;
}

/* Warning states */
.warning { 
  background: amber-50;
  color: amber-800;
  border: amber-200;
}

/* Error states */
.error { 
  background: red-50;
  color: red-800;
  border: red-200;
}

/* Info states */
.info { 
  background: blue-50;
  color: blue-800;
  border: blue-200;
}
```

## Implementation Checklist

### Phase 1: Core Updates
- [x] Update Tailwind configuration with new color palette
- [x] Add Figtree font to index.html
- [x] Update base styles in index.css
- [x] Create comprehensive theme CSS file

### Phase 2: Component Updates
- [ ] Update Button component with new styles
- [ ] Update Badge component with WCAG compliant colors
- [ ] Update Card component with proper shadows and borders
- [ ] Update Form components with accent focus states
- [ ] Update Table components with slate colors
- [ ] Update Navigation components
- [ ] Update Modal component

### Phase 3: Testing & Refinement
- [ ] Verify WCAG AA contrast compliance
- [ ] Test all interactive states
- [ ] Ensure consistent border radius (8px)
- [ ] Validate color harmony across views
- [ ] Test responsive behavior

## Migration Tips

1. **Replace Old Colors**:
   - `#0066CC` → `accent` or `#0055D4`
   - `#FF6B35` → Remove (not in new palette)
   - `#1A1A2E` → `slate-900`
   - Custom grays → Tailwind slate scale

2. **Update Font References**:
   - Replace `Inter` with `Figtree`
   - Ensure font weights are 400, 500, or 600 only

3. **Border Radius**:
   - Replace `rounded` with `rounded-md` (8px)
   - Use `rounded-lg` (12px) for larger elements

4. **Focus States**:
   - Always include `focus:ring-2 focus:ring-accent`
   - Add `focus:ring-offset-2` for better visibility

5. **Text Contrast**:
   - Never use colors lighter than slate-600 on white
   - Use slate-100 or white on dark backgrounds
   - Test all color combinations for WCAG AA

## Example Component Patterns

### Button Example
```tsx
// Primary Button
<button className="bg-accent hover:bg-accent-600 text-white font-medium px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-colors">
  Click me
</button>

// Secondary Button
<button className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-colors">
  Click me
</button>
```

### Card Example
```tsx
<div className="bg-white rounded-md shadow-sm border border-slate-200 p-6">
  <h3 className="text-xl font-semibold text-slate-900 mb-2">Card Title</h3>
  <p className="text-slate-700">Card content goes here...</p>
</div>
```

### Badge Example
```tsx
// Risk Level Badge
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 ring-1 ring-inset ring-red-600/20">
  Critical
</span>
```

## Notes

- The accent color (#0055D4) should be used sparingly as a highlight
- Main UI elements should use the slate color palette
- Ensure all text has proper contrast ratios
- Test all components in both light and dark contexts
- Maintain consistency across all views and components