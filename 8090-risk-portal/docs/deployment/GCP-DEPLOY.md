# Google Cloud Deployment Plan

## Overview
Deploy the 8090 Risk Portal to Google Cloud Run with Identity-Aware Proxy (IAP) protection.

## Prerequisites Check
1. **Google Cloud Project**: `dompe-dev-439304`
2. **Service Account Key**: `service-account-key.json` (already in place)
3. **Docker**: Installed locally for building images
4. **gcloud CLI**: Installed and authenticated

## Deployment Steps

### Step 1: Build the Application
```bash
npm run build
```

### Step 2: Build Docker Image
```bash
docker build --platform linux/amd64 -t gcr.io/dompe-dev-439304/risk-portal:latest .
```
**Important**: Must use `--platform linux/amd64` for Cloud Run compatibility

### Step 3: Push to Google Container Registry
```bash
docker push gcr.io/dompe-dev-439304/risk-portal:latest
```

### Step 4: Deploy to Cloud Run
```bash
gcloud run deploy risk-portal \
  --image gcr.io/dompe-dev-439304/risk-portal:latest \
  --region us-central1 \
  --port 8080 \
  --memory 512Mi \
  --platform managed
```
**Note**: Do NOT use `--allow-unauthenticated` as IAP handles authentication

### Step 5: Verify Deployment
- Check Cloud Run service: `risk-portal` (NOT `dompe-risk-portal`)
- Verify IAP is protecting the service
- Test at: https://dompe.airiskportal.com
- Clear browser cache and re-login if needed

### Step 6: Post-Deployment Verification
```bash
# Check deployment status
gcloud run services describe risk-portal --region us-central1 --format="value(status.latestReadyRevisionName)"

# View recent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=risk-portal" --limit=20
```

## Environment Variables
The following are set in the deployment:
- `NODE_ENV=production` (set in Dockerfile)
- `GOOGLE_DRIVE_FILE_ID=1OzrkAUQTWY7VUNrX-_akCWIuU2ALR3sm` (defaults in server.cjs)
- `VITE_GEMINI_API_KEY` (hardcoded in Dockerfile)

## Important Notes

### Authentication
- Production uses IAP (Identity-Aware Proxy) for authentication
- Direct Cloud Run URLs (e.g., https://risk-portal-m55fnl6poa-uc.a.run.app) will return 404
- Access must be through the IAP-protected domain: https://dompe.airiskportal.com

### Data Synchronization
- Both local and production environments use the same Google Drive file
- Data changes are immediate, but code changes require deployment
- After cleanup operations or parser changes, always deploy to production

### Troubleshooting
- If controls data differs between environments, check deployment timestamps
- Use `gcloud run revisions list --service risk-portal --region us-central1` to see deployment history
- Clear browser cache after deployments to see latest changes

## Architecture Reminder
1. `dompe.airiskportal.com` → IAP-enabled Load Balancer
2. Load Balancer → Cloud Run service `risk-portal`
3. IAP handles authentication via Google Cloud Identity Platform

## Post-Deployment Checklist
- [ ] Verify service is running in Cloud Run console
- [ ] Test authentication flow through IAP
- [ ] Confirm API endpoints are working (/api/v1/risks, /api/v1/controls)
- [ ] Test file upload functionality
- [ ] Verify Google Drive integration is working

## Rollback Plan
If issues occur:
```bash
# Deploy previous version
gcloud run deploy risk-portal \
  --image gcr.io/dompe-dev-439304/risk-portal:previous-tag \
  --region us-central1
```

## Common Issues and Solutions

### Issue: Container fails to start
- Check logs: `gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=risk-portal"`
- Verify service-account-key.json is included in Docker image

### Issue: Authentication errors
- Ensure IAP is properly configured
- Check that the service allows unauthenticated access (IAP handles auth)
- Verify GCIP settings match production environment

### Issue: API errors
- Confirm environment variables are set correctly
- Check that server.cjs is starting properly
- Verify Google Drive permissions for service account

## Production URLs
- Main Application: https://dompe.airiskportal.com
- Cloud Run Service: https://risk-portal-[hash]-uc.a.run.app
- GCP Console: https://console.cloud.google.com/run?project=dompe-dev-439304

## Monitoring
- Cloud Run Metrics: Monitor CPU, memory, and request count
- Error Reporting: Check for application errors in GCP Error Reporting
- Logs: Use Cloud Logging to troubleshoot issues

## Security Notes
- IAP provides the authentication layer
- Service account key should be managed via Secret Manager in production
- All traffic goes through HTTPS
- No direct access to Cloud Run service (only through IAP)