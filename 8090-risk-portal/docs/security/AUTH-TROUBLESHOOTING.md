# Authentication Troubleshooting Guide

This guide covers common authentication issues and their solutions based on real-world deployment experience.

## Common Issues and Solutions

### 1. SecureToken API Blocked

**Error:**
```
Firebase: Error (auth/requests-from-referer-<empty>-are-blocked.)
```

**Cause:** API key restrictions blocking Firebase Auth APIs

**Solution:**
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Edit the API key used for Firebase Auth
3. Under "API restrictions", add:
   - Identity Toolkit API
   - Token Service API
4. Save and wait 5 minutes for propagation

### 2. IAP Sign-in Page Exception

**Error:**
```
"allUsers" is not permitted due to organization policy constraints
```

**Cause:** Organization policy prevents public access required for IAP automatic sign-in

**Solution:**
1. In IAP configuration, select "I'll provide my own" for sign-in page
2. Create custom auth flow using GCIP
3. Configure auth.html as the custom sign-in page
4. Use the token exchange flow for authentication

### 3. Authentication Format Mismatch

**Error:**
```
Frontend expects 'authenticated' field but backend returns 'success'
```

**Cause:** API response format inconsistency between endpoints

**Solution:**
Ensure `/api/auth/me` returns the expected format:
```javascript
res.json({
  authenticated: true,  // NOT 'success'
  user: {
    email: 'user@domain.com',
    id: 'user-id',
    isAuthenticated: true
  }
});
```

### 4. CORS Errors During Authentication

**Error:**
```
Access to fetch at 'https://dompe.airiskportal.com' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**
1. Ensure all domains are in CORS configuration:
```javascript
app.use(cors({
  origin: [
    'https://dompe-dev-439304.web.app',
    'https://dompe-dev-439304.firebaseapp.com',
    'https://dompe.airiskportal.com',
    'http://localhost:3000'
  ],
  credentials: true,
  allowedHeaders: ['X-Goog-Authenticated-User-Email', 'X-Goog-Authenticated-User-Id']
}));
```

### 5. Missing IAP Headers in Development

**Issue:** IAP headers not present when running locally

**Solution:**
The auth middleware handles this automatically:
```javascript
if (process.env.NODE_ENV === 'development' && !iapEmail) {
  req.user = {
    email: 'dev.user@dompe.com',
    id: 'dev-user',
    name: 'dev.user',
    role: 'admin'
  };
}
```

### 6. 401 Unauthorized After Deployment

**Possible Causes:**

1. **Missing Trust Proxy Setting:**
```javascript
app.set('trust proxy', true); // Required for Cloud Run
```

2. **Incorrect Header Names:**
- Headers are lowercase in Express: `x-goog-authenticated-user-email`
- Not `X-Goog-Authenticated-User-Email`

3. **Backend Service Publicly Accessible:**
- Ensure Cloud Run service does NOT have `--allow-unauthenticated`
- All traffic must go through IAP

### 7. Redirect Loop During Authentication

**Symptoms:** Browser keeps redirecting between IAP and application

**Causes and Solutions:**

1. **Cookie Domain Mismatch:**
   - Ensure consistent domain usage
   - Don't mix www and non-www domains

2. **Mixed HTTP/HTTPS:**
   - Always use HTTPS in production
   - Update all URLs to use HTTPS

3. **Invalid Firebase Configuration:**
   - Verify Firebase project matches GCIP tenant
   - Check authDomain in Firebase config

### 8. "Permission Denied" Accessing Google Drive

**Error:**
```
Error: Insufficient Permission
```

**Solution:**
1. Verify service account has access to the Google Drive file
2. In Google Drive, share the file with the service account email
3. Grant "Editor" permissions if writing is required

### 9. Authentication Works Locally but Not in Production

**Checklist:**

1. **Environment Variables:**
```bash
# Verify these are set in Cloud Run
GOOGLE_SERVICE_ACCOUNT_KEY=<json-string>
NODE_ENV=production
PORT=8080
```

2. **IAP Configuration:**
- Backend service added to IAP
- Correct users added to access list
- OAuth consent screen configured

3. **DNS Configuration:**
- Domain points to load balancer IP (34.102.196.90)
- SSL certificate is valid

### 10. Token Exchange Failures

**Error:** GCIP authentication succeeds but IAP session not created

**Debug Steps:**

1. Check browser network tab for `?gcp-iap-mode=GCIP_AUTHENTICATING` request
2. Verify it returns 302 redirect, not error
3. Check IAP logs in Cloud Console
4. Ensure GCIP tenant ID matches configuration

## Debugging Tools

### 1. Check Current User

```javascript
// Add this endpoint for debugging
app.get('/api/debug/headers', (req, res) => {
  res.json({
    headers: req.headers,
    user: req.user,
    env: process.env.NODE_ENV
  });
});
```

### 2. Verify IAP JWT

```bash
# Decode IAP JWT token
echo $IAP_JWT | cut -d. -f2 | base64 -d | jq
```

### 3. Test Authentication Flow

```bash
# Test with curl
curl -v -H "X-Goog-Authenticated-User-Email: accounts.google.com:test@dompe.com" \
  https://dompe.airiskportal.com/api/auth/me
```

### 4. Check GCIP Logs

1. Go to Firebase Console → Authentication
2. Check "Usage" tab for authentication attempts
3. Review "Users" tab for registered users

## Best Practices

### 1. Always Test Authentication Changes

Before deploying:
1. Test login flow completely
2. Test logout and re-login
3. Verify role assignments
4. Check API access with different roles

### 2. Monitor Authentication

Set up alerts for:
- Failed authentication attempts
- 401 response rates
- IAP errors in Cloud Logging

### 3. Document User Access

Maintain a list of:
- Authorized email addresses
- Their assigned roles
- Access granted date
- Business justification

### 4. Regular Security Reviews

Monthly checks:
- Review IAP access list
- Audit service account permissions
- Check for unused API keys
- Review authentication logs

## Emergency Procedures

### If All Users Locked Out:

1. **Via Console:**
   - Go to IAP settings
   - Add your email to access list
   - Wait 5 minutes and retry

2. **Via gcloud:**
```bash
gcloud iap web add-iam-policy-binding \
  --member=user:your-email@domain.com \
  --role=roles/iap.httpsResourceAccessor \
  --resource-type=backend-services \
  --service=risk-portal-frontend-backend
```

3. **Bypass IAP (Emergency Only):**
   - Temporarily add `--allow-unauthenticated` to Cloud Run
   - Access service directly
   - Fix authentication
   - Remove public access immediately

### Recovery Steps:

1. Verify IAP is enabled
2. Check OAuth consent screen
3. Verify GCIP configuration
4. Test with a known good account
5. Review recent changes
6. Check Cloud Logging for errors