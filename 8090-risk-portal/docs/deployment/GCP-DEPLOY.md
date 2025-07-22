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
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,GOOGLE_DRIVE_FILE_ID=1OzrkAUQTWY7VUNrX-_akCWIuU2ALR3sm"
```

### Step 5: Verify Deployment
- Check Cloud Run service: `risk-portal` (NOT `dompe-risk-portal`)
- Verify IAP is protecting the service
- Test at: https://dompe.airiskportal.com

## Environment Variables
The following are set in the deployment:
- `NODE_ENV=production`
- `GOOGLE_DRIVE_FILE_ID=1OzrkAUQTWY7VUNrX-_akCWIuU2ALR3sm`
- `VITE_GEMINI_API_KEY` (hardcoded in Dockerfile)

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