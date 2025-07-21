# Validated Learnings - 8090 Risk Portal

## Date: July 20, 2025

### Initial Session Learnings

### 1. Deployment Architecture Discovery
**Learning**: The application is deployed to Firebase Hosting, not Cloud Run as initially assumed.

**Evidence**:
- Domain `dompe.airiskportal.com` resolves to IAP load balancer IP (34.102.196.90)
- Browser loads assets from Firebase Hosting (e.g., `/assets/index-Beh3fOTM.js`)
- Cloud Run deployments to `https://dompe-risk-portal-290017403746.us-central1.run.app` don't affect the live site
- Firebase configuration files present: `firebase.json`, `.firebaserc`

**Impact**: All our Cloud Run deployments were successful but didn't affect the live site because it's served from Firebase Hosting.

### 2. Authentication Implementation Redundancy
**Learning**: The codebase contains TWO authentication implementations - one active (IAP) and one dead code (Firebase Auth).

**Evidence**:
- `LoginView.tsx` is not imported anywhere in the codebase
- `authService.ts` is only used by the unused LoginView
- The app exclusively uses `authStore.ts` for IAP-based authentication
- Authentication flow goes through `auth.html` served by the backend

**Technical Debt Identified**:
- `src/views/auth/LoginView.tsx` - Dead code
- `src/services/authService.ts` - Dead code (except for type imports)
- These files represent the old Firebase Auth implementation before IAP migration

### 3. Logout Implementation Locations
**Learning**: The logout bug existed in TWO places, not one.

**Evidence**:
- `authStore.ts` had logout implementation (primary, used by the app)
- `authService.ts` also had logout implementation (dead code, but was causing confusion)
- Both needed to be fixed to use `/?gcp-iap-mode=GCIP_SIGNOUT`

### 4. Build Output Variations
**Learning**: Vite generates different hash suffixes for the same source code between local builds and Docker builds.

**Evidence**:
- Local build: `index-Bmz5bR6p.js`
- Docker build: `index-D_gmX9P-.js`
- Both contain the same logout fix
- This caused confusion when verifying deployments

### 5. Deployment Flow
**Actual Deployment Flow**:
1. Build locally: `npm run build`
2. Copy to public directory: `cp -r dist/* public/`
3. Deploy to Firebase Hosting: `firebase deploy --only hosting`

**Not Working**:
- Docker build → Push to GCR → Deploy to Cloud Run
- This successfully deploys but doesn't affect `dompe.airiskportal.com`

## Recommendations

1. **Remove Dead Code**:
   - Delete `src/views/auth/LoginView.tsx`
   - Delete `src/services/authService.ts`
   - Clean up any other Firebase Auth remnants

2. **Clarify Deployment Strategy**:
   - Either fully migrate to Cloud Run and update DNS
   - Or remove Cloud Run deployment scripts and stick with Firebase Hosting
   - Document the chosen approach clearly

3. **Update CI/CD**:
   - Ensure deployment pipelines target the correct platform
   - Add validation steps to verify deployment success

4. **Architecture Documentation**:
   - Create clear architecture diagram showing Firebase Hosting → IAP → Backend
   - Document the authentication flow explicitly

---

## Date: July 21, 2025

### Current Session Learnings

### 1. Dashboard Visual Alignment & CSS Grid Challenges

**Problem**: When the left navigation sidebar expanded/collapsed, the risk matrix cells would lose their square aspect ratio and appear stretched horizontally.

**Root Cause**: The CSS `aspect-square` utility class doesn't reliably maintain aspect ratios within CSS Grid containers when the parent container's width changes dynamically.

**Solution - Padding-Bottom Trick**:
```jsx
<div className="relative">
  <div className="pb-[100%]"></div>  {/* Creates square space */}
  <div className="absolute inset-0">  {/* Content positioned absolutely */}
    {/* Cell content */}
  </div>
</div>
```

**Why this works**:
- `padding-bottom: 100%` is calculated relative to the element's WIDTH
- This creates a guaranteed square container (height = width)
- Content is positioned absolutely within this square
- Works reliably regardless of parent container resizing

**Best Practices Learned**:
1. Use container queries instead of media queries for component-level responsive design
2. Add min-width constraints to prevent containers from becoming too narrow
3. Test with dynamic sidebar states during development

### 2. React Hooks and Context Patterns

**Problem**: Initial attempt to implement filter controls using React Context resulted in "React Hook called conditionally" errors.

**Learning**: When refactoring components, simpler inline state management is often preferable to complex context patterns, especially for UI state that doesn't need to be shared globally.

**Solution Applied**:
- Abandoned `ControlsFilterContext` approach
- Implemented filters as local state within each view
- Used `useMemo` for derived state calculations
- Result: Simpler, more maintainable, and no hooks errors

### 3. Deployment Architecture Correction

**Update to Previous Learning**: The application is actually deployed to **Google Cloud Run**, not Firebase Hosting!

**Correct Architecture**:
1. `dompe.airiskportal.com` → IAP-enabled Load Balancer
2. Load Balancer → Cloud Run service named `risk-portal`
3. Firebase is used only for authentication (GCIP), not hosting

**Critical Deployment Notes**:
- **ALWAYS** use `--platform linux/amd64` when building Docker images for Cloud Run
- The correct service name is `risk-portal` (NOT `dompe-risk-portal`)
- Deploy command: `gcloud run deploy risk-portal --image gcr.io/dompe-dev-439304/risk-portal:latest --region us-central1 --port 8080`

### 4. Local Development Environment Quirks

**Vite Proxy Configuration**: For local development with authentication, Vite proxy must be configured in `vite.config.ts`:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    secure: false
  }
}
```

**Port Configuration**:
- Backend server runs on port 8080
- **CRITICAL**: Frontend development server MUST ONLY run on port 3000
- Never use port 3001 or any other port for the frontend
- If port 3000 is occupied, kill the process first:
  ```bash
  lsof -ti:3000 | xargs kill -9
  npm run dev
  ```
- User directive: "ONLY START THE FRONT END UI LOCAL ON PORT 3000"

### 5. TypeScript and Build Scripts

**Available Scripts**:
- `npm run lint` - Check for linting errors
- `npm run build:check` - TypeScript checking (note: no standalone `typecheck` script exists)

**Common Type Issues**:
- Button variant "link" not in type definitions (use "ghost" instead)
- Badge size "xs" not in type definitions (use "sm" instead)
- Many `@typescript-eslint/no-explicit-any` warnings throughout codebase

### 6. Component Patterns Established

**PageHeader Pattern**: All main views should use the PageHeader component for visual consistency:
```jsx
<PageHeader
  title="View Title"
  description="Brief description of the view"
  actions={<Button onClick={...}>Action</Button>}
/>
```

**Export Functionality Pattern**:
```typescript
import { exportControlsToExcel } from '../utils/exportUtils';

const handleExport = () => {
  exportControlsToExcel(filteredData);
};
```

### 7. Git Workflow Constraints

**Critical Rule**: User explicitly requested: "no git commits till I verify the feature functionality"
- Always wait for user verification before committing
- Include proper author in commits: `git commit --author="Rohit Kelapure <kelapure@gmail.com>"`

### 8. Visual Testing Approach

**Browser Console Testing**: Create test scripts that can be run in browser console:
```javascript
// Example: Check if matrix cells are square
const cells = document.querySelectorAll('.matrix-cell');
cells.forEach(cell => {
  const rect = cell.getBoundingClientRect();
  console.log(`Square: ${Math.abs(rect.width - rect.height) < 1}`);
});
```

### 9. Filter Implementation Evolution

**Journey**:
1. Started with sidebar filters (complex)
2. Hit React hooks errors with context approach
3. Pivoted to inline toggle panels (simpler)
4. Extended pattern to multiple views
5. Result: Consistent, maintainable filter UI across app

**Key Learning**: Sometimes the simplest solution is the best solution

### 10. Debugging Authentication Issues

**Problem**: "checking authentication" loop when loaded locally

**Solution**: 
1. Ensure backend is running (`node server.js`)
2. Verify Vite proxy configuration
3. Check multiple backend processes aren't conflicting

## Technical Debt Identified

1. **Dead Authentication Code**: 
   - `authService.ts` contains unused Firebase Auth logic
   - `LoginView.tsx` is not imported anywhere
   - These should be removed

2. **TypeScript Errors**: 102 linting errors, mostly `no-explicit-any`

3. **Multiple Backend Processes**: Found 5 node server.js processes running, indicating cleanup needed

## Recommendations for Next Session

1. Clean up technical debt (remove dead authentication code)
2. Fix remaining TypeScript/linting errors
3. Implement proper error boundaries
4. Add loading states for async operations
5. Optimize bundle size (tree-shaking unused imports)
6. Kill duplicate backend processes
7. Document the correct local development setup clearly

---

## Date: July 21, 2025 - Critical Testing Rules

### NEVER USE PRODUCTION FILES FOR TESTING

**Critical Rule**: NEVER, EVER use the production Google Drive file for testing purposes.

**Production File ID**: `1OzrkAUQTWY7VUNrX-_akCWIuU2ALR3sm` - DO NOT USE FOR TESTS

**What Happened**: 
- During test implementation, when the test file became inaccessible, there was an attempt to temporarily use the production file
- This is ABSOLUTELY FORBIDDEN and could corrupt production data

**Correct Approach**:
1. Always use a dedicated test copy of the Excel file
2. If test file is inaccessible, debug the access issue or create a new test copy
3. Never modify `.env.test` to point to production files
4. Test files should be clearly marked (e.g., "Copy of General AI Risk Map for TESTING")

**Safety Measures**:
- Test data should always include `[TEST]` prefix markers
- Implement cleanup routines that only remove data with test markers
- Consider implementing a safety check in code that prevents writing to production file when in test mode

**Key Learning**: Testing discipline is critical when dealing with production data sources. There are no acceptable shortcuts.