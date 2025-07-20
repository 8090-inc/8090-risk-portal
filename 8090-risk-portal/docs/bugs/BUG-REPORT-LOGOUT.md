# BUG-001: Logout Button Not Working

## Status: CLOSED

## Description
When clicking the logout button, the user is redirected to the auth screen but then automatically logged back in.

## Root Cause
The application was using an incorrect logout URL that only cleared the IAP session cookie but didn't properly sign out from Google Cloud Identity Platform (GCIP). This caused users to be immediately re-authenticated.

## Resolution
Fixed by implementing the proper GCIP logout flow using `/?gcp-iap-mode=GCIP_SIGNOUT` instead of just clearing cookies.

### Changes Made:
1. **Updated authStore.ts** - Modified the logout function to use the correct GCIP signout URL
   ```typescript
   logout: async () => {
     set({ 
       isAuthenticated: false,
       user: null,
       loading: false 
     });
     window.location.href = '/?gcp-iap-mode=GCIP_SIGNOUT';
   },
   ```

2. **Removed dead code** - Cleaned up unused Firebase authentication code:
   - Deleted `src/services/authService.ts`
   - Deleted `src/views/auth/LoginView.tsx`
   - Deleted `src/components/layout/AuthLayout.tsx`
   - Deleted unused server routes in `server/` directory

3. **Updated deployment** - Discovered and fixed deployment to correct Cloud Run service:
   - Domain `dompe.airiskportal.com` points to `risk-portal` service (not `dompe-risk-portal`)
   - Updated CLAUDE.md with correct deployment instructions

## Testing
- Tested locally: Logout now properly signs out and requires re-authentication
- Tested in production: Confirmed working on https://dompe.airiskportal.com

## Fix Version
- Committed in: v2.4
- Commit hash: 7e078cd395d866f2a32bb7fb70903820d7b20acf

## Date Resolved
2025-07-20

## Lessons Learned
1. GCIP with IAP requires specific logout URL pattern `/?gcp-iap-mode=GCIP_SIGNOUT`
2. Technical debt from old authentication systems can cause confusion
3. Always verify which Cloud Run service the domain is actually pointing to