# Validated Learnings - 8090 Risk Portal

## Date: July 20, 2025

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