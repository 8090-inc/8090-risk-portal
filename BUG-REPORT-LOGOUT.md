# Bug Report: Logout Redirect Loop

## Issue ID: BUG-001
**Date Reported**: 2025-07-20  
**Severity**: High  
**Status**: Fixed  

## Summary
The logout functionality creates a redirect loop where users are immediately re-authenticated after clicking logout.

## Description
When users click the logout button, they are redirected to the authentication page but are immediately logged back in without any user interaction. This prevents users from being able to properly sign out of the application.

## Steps to Reproduce
1. Log into the 8090 Risk Portal
2. Click on the user menu in the header
3. Click "Logout"
4. Observe that you are briefly redirected but then automatically logged back in

## Expected Behavior
- User should be logged out of the application
- User should remain on the authentication page
- User should need to re-enter credentials to access the application again

## Actual Behavior
- User is redirected to `/_gcp_iap/clear_login_cookie`
- IAP session cookie is cleared
- User is redirected back to the application
- IAP detects no session and redirects to Google OAuth
- Since user is still logged into Google, they are automatically re-authenticated
- User ends up logged back into the application

## Root Cause
The application uses Google Cloud Identity Platform (GCIP) with Identity-Aware Proxy (IAP) for authentication. The logout implementation was only clearing the IAP session cookie using `/_gcp_iap/clear_login_cookie`, but this doesn't sign the user out from GCIP or Google accounts. The proper GCIP logout endpoint `?gcp-iap-mode=GCIP_SIGNOUT` was not being used.

## Technical Details
- **Authentication Setup**: GCIP with tenant ID `dompe8090-bf0qr` + IAP
- **Previous Implementation**: `window.location.href = '/_gcp_iap/clear_login_cookie'`
- **Fixed Implementation**: `window.location.href = '/?gcp-iap-mode=GCIP_SIGNOUT'`

## Resolution
### Changes Made:
1. **Updated `authStore.ts`**: Changed logout redirect from `/_gcp_iap/clear_login_cookie` to `/?gcp-iap-mode=GCIP_SIGNOUT`
2. **Updated `Header.tsx`**: Removed unnecessary `navigate('/login')` call and made logout synchronous

### Files Modified:
- `/8090-risk-portal/src/store/authStore.ts` (line 65)
- `/8090-risk-portal/src/components/layout/Header.tsx` (lines 26-29)

## Testing
1. ✅ Logout button now properly signs out user from GCIP
2. ✅ User remains on authentication page after logout
3. ✅ User must re-authenticate to access application
4. ✅ All sessions across multiple tabs are properly cleared

## References
- [Google Cloud IAP Session Management](https://cloud.google.com/iap/docs/sessions-howto)
- [Managing sessions with external identities](https://cloud.google.com/iap/docs/external-identity-sessions)
- [Stack Overflow: IAP Force Logout](https://stackoverflow.com/questions/47329783/google-cloud-identity-aware-proxy-iap-force-logout)

## Prevention
To prevent similar issues in the future:
1. Always use the appropriate GCIP logout endpoints when using external identity providers
2. Test logout functionality across multiple tabs and sessions
3. Understand the distinction between IAP session cookies and GCIP/Google authentication state