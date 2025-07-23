# Deployment Summary - July 23, 2025

## Issue Resolved
Production site (https://dompe.airiskportal.com) was showing different controls data than local development.

## Root Cause
- Production was running code from July 22nd deployment
- Local environment had recent changes (duplicate control cleanup)
- Both environments read from same Google Drive file, but production had older parsing logic

## Actions Taken

### 1. Code Changes (Local)
- Added API endpoint `/api/v1/controls/cleanup-duplicates` to remove duplicate controls
- Removed 8 duplicate control entries from Excel file (rows 1000-1007)
- Fixed authentication issues by using server's service account instead of scripts

### 2. Production Deployment
```bash
# Built Docker image with latest code
docker build --platform linux/amd64 -t gcr.io/dompe-dev-439304/risk-portal:latest .

# Pushed to Google Container Registry
docker push gcr.io/dompe-dev-439304/risk-portal:latest

# Deployed to Cloud Run
gcloud run deploy risk-portal --image gcr.io/dompe-dev-439304/risk-portal:latest --region us-central1
```

### 3. Deployment Details
- **Previous revision**: risk-portal-00025-s8x (July 22, 2025)
- **New revision**: risk-portal-00026-x9t (July 23, 2025)
- **Service URL**: https://risk-portal-m55fnl6poa-uc.a.run.app
- **Public URL**: https://dompe.airiskportal.com (via IAP)

## Results
- Production now has latest code with duplicate cleanup logic
- Both environments show 21 controls (previously had 8 duplicates)
- Control categories are correctly mapped
- Data is synchronized between environments

## Files Modified
1. `/server/services/ControlService.cjs` - Added cleanupDuplicates method
2. `/server/api/v1/controls.cjs` - Added cleanup endpoint
3. `/server/utils/cleanupDuplicates.cjs` - Cleanup utility function
4. Documentation updates in `/docs/dev/VALIDATED-LEARNINGS.md`

## Verification
Users should:
1. Clear browser cache
2. Log out and log back in
3. Verify 21 controls appear in the controls page
4. Check that categories show correctly (not SOC2 codes)

## Next Steps
- Monitor production logs for any issues
- Consider setting up automated deployments for critical fixes
- Document deployment process for team