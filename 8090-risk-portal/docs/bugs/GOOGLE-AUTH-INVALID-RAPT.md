# Bug Report: Google Drive API Authentication - Invalid RAPT Error

## Issue Summary
Scripts attempting to access Google Drive directly are failing with "invalid_rapt" (Invalid ReAuth Proof Token) authentication errors when trying to manipulate the Excel file.

## Environment
- **Project**: 8090 Risk Portal
- **Component**: Google Drive Persistence Layer
- **API**: Google Drive API v3
- **Authentication Method**: Service Account (configured correctly in server)
- **Error Location**: Standalone scripts in `/scripts/` directory

## Error Details

### Error Message
```
Error: invalid_grant: reauth related error (invalid_rapt)
```

### Stack Trace
The error occurs when scripts attempt to authenticate with Google Drive API directly:
- `/scripts/remove-duplicate-controls.cjs` - Line 9-12 (GoogleAuth initialization)
- Any script that tries to create its own Google Drive authentication

## Root Cause Analysis

### What is RAPT?
RAPT (ReAuth Proof Token) is part of Google's enhanced security for OAuth2 flows. The error occurs when:
1. Google Workspace administrators enforce session control policies
2. User credentials expire (typically 1-24 hours)
3. Applications attempt to use expired OAuth tokens

### Why This Happens in Our Scripts
1. Scripts are attempting to create new GoogleAuth instances
2. These instances may be picking up cached user credentials from:
   - `~/.config/gcloud/application_default_credentials.json`
   - Environment variables
   - Other credential sources
3. User credentials are subject to RAPT/session control, unlike service accounts

### Why the Server Works Fine
The server (`server.cjs`) correctly:
1. Uses service account authentication
2. Service accounts are NOT affected by RAPT policies
3. Has proper credential configuration from environment/JSON file

## Impact
- Cannot run maintenance scripts that directly access Google Drive
- Cannot programmatically clean up duplicate entries in Excel file
- Forces manual intervention for data cleanup tasks

## Reproduction Steps
1. Create a script that attempts to access Google Drive directly
2. Use `new google.auth.GoogleAuth()` to create authentication
3. Try to access the Drive API
4. Observe "invalid_rapt" error

## Solutions

### Immediate Workaround
Use the server's existing authentication by creating API endpoints instead of standalone scripts:
```javascript
// Instead of direct Drive access in scripts
// Create an API endpoint that uses the server's auth
router.post('/api/v1/controls/cleanup-duplicates', ...)
```

### Proper Fix Options

#### Option 1: Use Server's Existing Auth (Recommended)
1. Create utility functions that can be called from API endpoints
2. Leverage the server's already-configured service account
3. Example:
   ```javascript
   // In ControlService
   async cleanupDuplicates() {
     const data = await this.persistenceProvider.getData();
     // ... cleanup logic
     await this.persistenceProvider.saveData(cleanedData);
   }
   ```

#### Option 2: Fix Script Authentication
1. Ensure scripts use service account credentials explicitly:
   ```javascript
   const auth = new google.auth.GoogleAuth({
     keyFile: './path/to/service-account-key.json',
     scopes: ['https://www.googleapis.com/auth/drive']
   });
   ```
2. Clear any cached user credentials:
   ```bash
   rm -rf ~/.config/gcloud/application_default_credentials.json
   ```

#### Option 3: Use Environment Variables
1. Set service account credentials in environment:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
   ```
2. Ensure scripts don't override with user credentials

## Prevention
1. Never use `gcloud auth application-default login` on servers
2. Always use service accounts for server applications
3. Document authentication setup clearly
4. Create all maintenance operations as API endpoints, not standalone scripts

## Related Issues
- Similar issues reported in Google Cloud SDK: [Issue #2387](https://github.com/googleapis/google-cloud-go/issues/2387)
- Stack Overflow discussions on RAPT errors
- Google Workspace session control documentation

## Recommendations
1. **Short term**: Create API endpoint for duplicate cleanup instead of script
2. **Long term**: Refactor all maintenance scripts to use server's auth layer
3. **Documentation**: Add authentication setup guide for developers

## Status
- **Severity**: Medium (workaround available)
- **Priority**: High (blocking data cleanup tasks)
- **Assigned**: Unassigned
- **Created**: 2025-07-23