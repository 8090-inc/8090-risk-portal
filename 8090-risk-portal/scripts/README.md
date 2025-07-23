# Scripts Directory

This directory contains utility scripts for maintenance and deployment tasks.

## Important Scripts

### Authentication Management
- **`run-with-service-account.cjs`** - Wrapper to ensure scripts use service account authentication
  ```bash
  node scripts/run-with-service-account.cjs ./scripts/any-script.cjs
  ```

### Deployment
- **`restart-server.sh`** - Restarts the local development server
- **`deploy-to-gcp.sh`** - Builds and deploys to Google Cloud Run (see `/docs/deployment/GCP-DEPLOY.md`)

### Testing and Verification
- **`test-cleanup-api.cjs`** - Tests the duplicate cleanup API endpoint
- **`compare-controls-data.cjs`** - Compares control data between environments
- **`verify-production-deployment.sh`** - Verifies production deployment status

### Data Management
- **`add-controls-simple.cjs`** - Adds controls via API
- **`fix-all-control-categories.cjs`** - Fixes control categories based on ID prefixes
- **`remove-duplicate-controls.cjs`** - Removes duplicate controls (use API endpoint instead)

## Important Notes

### Authentication
⚠️ **NEVER use direct Google Drive access in scripts**. This causes "invalid_rapt" errors.

Instead:
1. Use the wrapper script: `node scripts/run-with-service-account.cjs`
2. Or better: Create API endpoints and use those instead

### Service Account Usage
Always explicitly specify service account credentials:
```javascript
const auth = new google.auth.GoogleAuth({
  keyFile: './service-account-key.json',
  scopes: ['https://www.googleapis.com/auth/drive']
});
```

### Best Practices
1. Use API endpoints instead of direct Drive access
2. Always use service accounts, never user credentials
3. Test scripts locally before running in production
4. Document what each script does and when to use it

## Troubleshooting

### "invalid_rapt" Error
This occurs when scripts use cached user credentials instead of service accounts.

Solution:
1. Remove cached credentials: `rm -rf ~/.config/gcloud/application_default_credentials.json`
2. Use the run-with-service-account.cjs wrapper
3. Or use API endpoints instead

### Scripts Not Working After Changes
Remember to restart the server if you've modified backend code:
```bash
./scripts/restart-server.sh
```

For more details, see:
- `/docs/guides/PREVENTING-USER-CREDENTIAL-USAGE.md`
- `/docs/dev/VALIDATED-LEARNINGS.md`