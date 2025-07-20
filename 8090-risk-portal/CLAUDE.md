# Claude AI Assistant Instructions

## Project Context
This is the 8090 AI Risk Portal for Dompé farmaceutici S.p.A. - a React-based web application for managing AI risks and controls.

## Important Build/Deploy Instructions

### Docker Build for Cloud Run
When building Docker images for Google Cloud Run deployment, you MUST specify the linux/amd64 platform to avoid architecture mismatch errors:

```bash
docker build --platform linux/amd64 -t gcr.io/dompe-dev-439304/dompe-risk-portal:latest .
```

This is necessary because Cloud Run requires linux/amd64 images. Without this flag, you may encounter the error:
"Container manifest type 'application/vnd.oci.image.index.v1+json' must support amd64/linux."

## Authentication
The application uses Google Cloud Identity Platform (GCIP) with Identity-Aware Proxy (IAP) for authentication.

## Logout Fix
To properly logout users, use the IAP logout URL pattern:
```javascript
window.location.href = '/?gcp-iap-mode=GCIP_SIGNOUT';
```

## Commands to Run After Changes
After making code changes, always run:
- `npm run lint` - Check for linting errors
- `npm run typecheck` - Check for TypeScript errors

## Important Deployment Discovery
The application is deployed to **Cloud Run**, not Firebase Hosting. The domain `dompe.airiskportal.com` points to an IAP-protected Load Balancer that forwards to Cloud Run.

### Correct Deployment Architecture:
1. `dompe.airiskportal.com` → IAP-enabled Load Balancer
2. Load Balancer → Cloud Run service named `risk-portal` (NOT `dompe-risk-portal`)
3. Firebase Hosting is not used for the production site

### To Deploy Changes:
1. Build the app: `npm run build`
2. Build Docker image: `docker build --platform linux/amd64 -t gcr.io/dompe-dev-439304/risk-portal:latest .`
3. Push image: `docker push gcr.io/dompe-dev-439304/risk-portal:latest`
4. Deploy to Cloud Run: `gcloud run deploy risk-portal --image gcr.io/dompe-dev-439304/risk-portal:latest --region us-central1 --port 8080`

### Important: Deploy to the Correct Service
- **Correct service**: `risk-portal` - This is what the domain uses
- **Wrong service**: `dompe-risk-portal` - Do not deploy here

## Authentication Architecture
The app has TWO authentication implementations (technical debt):

### 1. authStore.ts (Active - IAP Authentication)
- Used throughout the app
- Manages IAP session state
- Gets user info from `/api/auth/me` endpoint
- This is the PRIMARY authentication system

### 2. authService.ts (Dead Code - Firebase Auth)
- Only used by LoginView.tsx (which is also dead code)
- Contains Firebase authentication logic
- Not imported or used anywhere in the active app
- Remnant from before IAP migration

The app has fully transitioned to IAP authentication via `auth.html`.

## Git Commit Instructions
When making commits, always include the proper author:
```bash
git commit --author="Rohit Kelapure <kelapure@gmail.com>" -m "your commit message"
```