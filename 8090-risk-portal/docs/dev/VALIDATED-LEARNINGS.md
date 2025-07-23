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

---

## Date: July 22, 2025 - Excel Parser Deep Dive

### Excel Parsing Challenge: Only 7 of 33 Risks Being Parsed

**Problem**: The Excel parser was only finding 7 risks instead of the expected 33 from the Google Drive file.

**Root Causes Identified**:
1. **Wrong Starting Row**: Parser started at row 1, but the Excel file had multiple header rows (0-3)
2. **Early Termination**: Parser stopped at first empty row between risk categories
3. **Header Row as Data**: First "risk" parsed was literally "Risk Category" | "Risk" (the header row)

**Excel Structure Discovery**:
```
Row 0-3: Title, merged cells, section headers
Row 4: Actual column headers
Row 5+: Data starts
[Empty rows between risk categories]
```

**Solution Implemented**:

1. **Dynamic Header Detection**:
```javascript
const findDataStartRow = (sheet, range, columns) => {
  for (let row = 0; row <= Math.min(20, range.e.r); row++) {
    const likelihood = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: columns.INITIAL_LIKELIHOOD })]);
    const impact = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: columns.INITIAL_IMPACT })]);
    const riskName = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: columns.RISK_NAME })]);
    
    // Check if this looks like a data row (has numeric scores 1-5)
    if (typeof likelihood === 'number' && likelihood >= 1 && likelihood <= 5 &&
        typeof impact === 'number' && impact >= 1 && impact <= 5 &&
        riskName && !isHeaderValue(riskName)) {
      return row;
    }
  }
  return 5; // Fallback
};
```

2. **Full Sheet Scanning**: Instead of stopping at empty rows, scan entire sheet (996 rows)
3. **Category Inheritance**: Risks without explicit category inherit from last valid category
4. **Header Validation**: Skip rows with header-like values

**Results**:
- ✅ Found data starts at row 4
- ✅ Scanned 996 rows total
- ✅ Skipped 963 empty rows
- ✅ Successfully parsed all 33 risks
- ✅ Successfully parsed all 13 controls

### Data Validation Completeness

**All 16 Excel columns successfully mapped**:
1. Risk Category
2. Risk Name  
3. Risk Description
4. Initial Likelihood (1-5)
5. Initial Impact (1-5)
6. Initial Risk Level (calculated)
7. Initial Risk Level Category
8. Example Mitigations
9. Agreed Mitigation
10. Proposed Oversight Ownership
11. Proposed Support
12. Notes
13. Residual Likelihood (1-5)
14. Residual Impact (1-5)
15. Residual Risk Level (calculated)
16. Residual Risk Level Category

**Data Quality Findings**:
- All 33 risks have complete required fields
- 32/33 have Proposed Support (1 missing: "Hackers Abuse In-House GenAI Solutions")
- 19/33 have Notes (14 empty - acceptable)
- All risk level calculations verified (Likelihood × Impact)
- All risk categories valid

### Backend Architecture Consolidation

**Problem**: Two different parsing implementations causing inconsistencies:
- `server.cjs` had its own `parseExcelData` function
- `excelParser.cjs` had separate parsing functions
- Field naming mismatches (id vs mitigationID for controls)

**Solution**: Consolidated all parsing logic into `excelParser.cjs`
- Removed 180+ lines of duplicate parsing code
- Fixed field naming consistency
- All CRUD tests now passing
- Single source of truth for Excel parsing

### Key Learnings

1. **Excel Structure Assumptions Are Dangerous**:
   - Never assume data starts at row 1
   - Always handle multiple header rows
   - Expect empty rows between sections
   - Use dynamic detection, not hardcoded positions

2. **Parser Robustness Requirements**:
   - Continue scanning after empty rows
   - Validate data rows vs header rows
   - Handle missing categories via inheritance
   - Log what's found and skipped for debugging

3. **Future-Proof Design**:
   - Never hardcode expected counts (33 risks, 13 controls)
   - Make parsers adaptive to structure changes
   - Add warnings for unexpected low counts
   - Comprehensive logging for troubleshooting

4. **Testing with Production Data**:
   - Parser must handle real-world Excel complexity
   - Test with actual Google Drive file structure
   - Verify all expected data is captured
   - Check edge cases (empty fields, missing data)

5. **Code Consolidation Benefits**:
   - Single parsing implementation easier to maintain
   - Consistent behavior across all operations
   - Easier to debug issues
   - Better test coverage

**Critical Insight**: The Excel file structure in production is often more complex than test data. Always analyze the actual production file structure before implementing parsers.

### Excel File Structure - Detailed Row and Column Layout

**Production File**: Google Drive ID `1OzrkAUQTWY7VUNrX-_akCWIuU2ALR3sm`

**Row Structure**:
```
Row 0: Title row (e.g., "General AI Risk Map")
Row 1: Empty or subtitle
Row 2: Section headers/merged cells
Row 3: Additional headers/formatting
Row 4: Column headers row (actual field names)
Row 5+: Data rows start here
- Empty rows between risk categories (DO NOT stop parsing!)
- Total rows in production file: ~996
```

**Column Structure (16 columns total)**:

| Column | Index | Field Name | Type | Description |
|--------|-------|------------|------|-------------|
| A | 0 | Risk Category | String | e.g., "Behavioral Risks", "Accuracy", "Security and Data Risks" |
| B | 1 | Risk Name | String | The specific risk title |
| C | 2 | Risk Description | String | Detailed description of the risk |
| D | 3 | Initial Likelihood | Number (1-5) | Pre-mitigation likelihood score |
| E | 4 | Initial Impact | Number (1-5) | Pre-mitigation impact score |
| F | 5 | Initial Risk Level | Number | Calculated: Likelihood × Impact |
| G | 6 | Initial Risk Level Category | String | e.g., "High", "Medium", "Low" |
| H | 7 | Example Mitigations | String | Suggested mitigation strategies |
| I | 8 | Agreed Mitigation | String | The chosen mitigation approach |
| J | 9 | Proposed Oversight Ownership | String | Comma-separated list of owners |
| K | 10 | Proposed Support | String | Comma-separated list of support roles |
| L | 11 | Notes | String | Additional notes (often empty) |
| M | 12 | Residual Likelihood | Number (1-5) | Post-mitigation likelihood score |
| N | 13 | Residual Impact | Number (1-5) | Post-mitigation impact score |
| O | 14 | Residual Risk Level | Number | Calculated: Residual Likelihood × Impact |
| P | 15 | Residual Risk Level Category | String | e.g., "High", "Medium", "Low" |

**Valid Risk Categories**:
1. Behavioral Risks
2. Accuracy
3. Transparency Risks
4. Security and Data Risks
5. Business/Cost Related Risks
6. AI Human Impact Risks
7. Other Risks

**Data Quality Notes**:
- Not all risks have explicit category cells (inherit from previous row)
- Some cells may be empty (especially Notes column)
- Proposed Support/Ownership may contain comma-separated values
- Risk Level calculations should match Likelihood × Impact

---

## Date: July 22, 2025 - Development Environment Setup

### Starting the Development Servers

**Backend Server**:
```bash
# Navigate to project root
cd 8090-risk-portal

# Start the backend server on port 8080
node server.cjs

# The server will:
# - Run on http://localhost:8080
# - Connect to Google Drive for Excel data
# - Serve API endpoints at /api/*
# - Log output to server.log
```

**Frontend Development Server**:
```bash
# In a new terminal, navigate to project root
cd 8090-risk-portal

# CRITICAL: Kill any existing processes on port 3000
lsof -ti:3000 | xargs kill -9

# Start the frontend dev server on port 3000
npm run dev

# The frontend will:
# - Run on http://localhost:3000
# - Proxy API requests to backend on port 8080
# - Enable hot module replacement
# - Log output to frontend.log
```

**Important Notes**:
1. **ALWAYS start backend first** - Frontend needs the API to be available
2. **Frontend MUST run on port 3000** - Other ports will break authentication
3. **Check logs** - Both servers write to `.log` files for debugging
4. **Environment** - Backend uses `.env` file for Google Drive credentials

**Common Issues**:
- If "port already in use" error: Kill the process and try again
- If authentication loops: Ensure backend is running and proxy is configured
- If data doesn't load: Check server.log for Google Drive connection issues

---

## Date: July 23, 2025 - Google Authentication and Script Execution

### The "invalid_rapt" Authentication Error

**Problem**: Scripts attempting to access Google Drive directly fail with "invalid_rapt" (Invalid ReAuth Proof Token) errors.

**Root Cause**: 
- RAPT is part of Google's enhanced security for OAuth2 flows
- User credentials expire based on Google Workspace session control policies (1-24 hours)
- Scripts inadvertently use cached user credentials instead of service accounts
- Service accounts are NOT affected by RAPT/session policies

**How Google Auth Discovery Works**:
Google auth libraries check for credentials in this order:
1. `GOOGLE_APPLICATION_CREDENTIALS` environment variable
2. User credentials at `~/.config/gcloud/application_default_credentials.json`
3. Google Cloud metadata server (for GCE/Cloud Run)
4. Other locations depending on the library

**The Danger**: If user credentials exist on the system (from `gcloud auth application-default login`), scripts will use them and fail when sessions expire.

### Preventing Scripts from Using User Credentials

**Solution 1 - Explicit Service Account in Code**:
```javascript
// ✅ CORRECT: Forces service account usage
const auth = new google.auth.GoogleAuth({
  keyFile: './path/to/service-account-key.json',
  scopes: ['https://www.googleapis.com/auth/drive']
});

// ❌ WRONG: May pick up user credentials
const auth = new google.auth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/drive']
});
```

**Solution 2 - Environment Variable**:
```bash
# Set before running script
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"

# Or in the script itself
process.env.GOOGLE_APPLICATION_CREDENTIALS = './service-account-key.json';
```

**Solution 3 - Remove User Credentials**:
```bash
# Clear cached user credentials
rm -rf ~/.config/gcloud/application_default_credentials.json

# Never run this on servers or for scripts
gcloud auth application-default login  # ❌ NEVER DO THIS
```

**Solution 4 - Wrapper Script Created**:
A wrapper script was created at `scripts/run-with-service-account.cjs` that:
- Forces `GOOGLE_APPLICATION_CREDENTIALS` environment variable
- Clears user credential environment variables
- Validates service account file exists
- Usage: `node scripts/run-with-service-account.cjs ./scripts/any-script.cjs`

### Best Practice: Use API Endpoints Instead

**Recommended Approach**: Since the server already has working Google Drive authentication:
1. Create API endpoints for maintenance operations
2. Use the server's existing service account authentication
3. Avoid direct Google Drive access in scripts

Example:
```javascript
// Instead of direct Drive access in scripts
// Create an API endpoint
router.post('/api/v1/controls/cleanup-duplicates', async (req, res) => {
  const result = await controlService.cleanupDuplicates();
  res.json({ success: true, data: result });
});
```

### Key Learnings

1. **Service accounts are immune to RAPT** - Always use them for scripts
2. **User credentials are dangerous for automation** - They expire unpredictably
3. **Explicit is better than implicit** - Always specify service account paths
4. **API endpoints are safer** - Leverage existing server authentication
5. **Document authentication setup** - Prevent future developers from making the same mistakes

**Full documentation**: See `/docs/guides/PREVENTING-USER-CREDENTIAL-USAGE.md` for comprehensive guidance.

---

## Date: July 23, 2025 - Production vs Local Data Synchronization

### The Issue: Different Controls Data Between Environments

**Problem**: `http://localhost:3000/controls` showed 21 controls while `https://dompe.airiskportal.com/controls` showed different data.

**Investigation Findings**:
1. **Local environment**: Shows 21 controls after cleanup of 8 duplicate entries
2. **API pagination**: Default limit is 20, but frontend requests with `limit=1000`
3. **Production deployment**: Was last deployed on July 22nd (before cleanup changes)
4. **Both environments**: Use the same Google Drive file ID (1OzrkAUQTWY7VUNrX-_akCWIuU2ALR3sm)

### Root Cause

The difference was due to **deployment lag**:
- Local changes (duplicate cleanup) were made on July 23rd
- Production was running code from July 22nd deployment
- Both read from the same Google Drive file, but production had older parsing logic

### Solution Implemented

1. **Built and deployed latest code to production**:
   ```bash
   docker build --platform linux/amd64 -t gcr.io/dompe-dev-439304/risk-portal:latest .
   docker push gcr.io/dompe-dev-439304/risk-portal:latest
   gcloud run deploy risk-portal --image gcr.io/dompe-dev-439304/risk-portal:latest --region us-central1
   ```

2. **Deployment details**:
   - New revision: risk-portal-00026-x9t
   - Deployed at: 2025-07-23T07:45:19Z
   - Service URL: https://risk-portal-m55fnl6poa-uc.a.run.app (internal)
   - Public URL: https://dompe.airiskportal.com (via IAP load balancer)

### Key Learnings

1. **Always deploy after data cleanup operations** - Changes to data structure or cleanup operations need immediate deployment
2. **Production uses IAP load balancer** - Direct Cloud Run URLs return 404; access is through IAP
3. **Check deployment timestamps** - Use `gcloud run revisions describe` to verify when code was last deployed
4. **Both environments share data** - They use the same Google Drive file, so data changes are immediate
5. **Code changes need deployment** - Parser logic changes require deployment to take effect

### Verification Steps

After deployment:
1. Clear browser cache
2. Log out and log back in to refresh session
3. Verify control count matches between environments
4. Check that all 21 controls appear with correct categories

---

## Critical Reminders

### Git Commit Author
**ALWAYS include the proper author when making commits:**
```bash
git commit --author="Rohit Kelapure <kelapure@gmail.com>" -m "commit message"
```

This is a mandatory requirement for all commits in this project. The --author flag must be included in every git commit command.