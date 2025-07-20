# Validated Learnings

This document captures important technical learnings and solutions that have been validated through implementation and testing.

## Authentication & IAP

### 1. GCIP + IAP Logout Issue (2025-07-20)
**Problem**: Using `/_gcp_iap/clear_login_cookie` only clears IAP session cookie but doesn't sign out from GCIP/Google, causing immediate re-authentication.

**Solution**: Use `/?gcp-iap-mode=GCIP_SIGNOUT` to properly sign out from both GCIP and IAP.

**Implementation**:
```typescript
// In authStore.ts
logout: () => {
  // Clear local state
  set({ 
    isAuthenticated: false,
    user: null,
    loading: false 
  });
  
  // Redirect to GCIP signout - this properly signs out from both GCIP and IAP
  window.location.href = '/?gcp-iap-mode=GCIP_SIGNOUT';
}
```

**Key Points**:
- Don't navigate to `/login` after logout - let GCIP handle redirects
- For external identity sessions, use `?gcp-iap-mode=GCIP_SIGNOUT`
- Alternative: Use `/auth.html?apiKey=API_KEY&mode=signout` for GCIP SDK signout

### 2. IAP Authentication Flow
**Architecture**: 
- Google Cloud Identity Platform (GCIP) with tenant ID: `dompe8090-bf0qr`
- Identity-Aware Proxy (IAP) for access control
- Firebase Hosting for authentication pages
- Cloud Run backend service

**Key Files**:
- `/public/auth.html` - GCIP authentication page with FirebaseUI
- `/public/auth.js` - Implements FirebaseUI with gcip-iap module
- `/server.js` - Handles IAP headers and user info extraction

## Deployment

### 1. Cloud Run Deployment (2025-07-20)
**Requirements**:
- Build Docker images with `--platform linux/amd64` for Cloud Run
- Use `--allow-unauthenticated` flag (IAP handles authentication)
- Push to GCR before deploying

**Commands**:
```bash
# Build for correct platform
docker build --platform linux/amd64 -t gcr.io/PROJECT_ID/IMAGE_NAME:latest .

# Push to GCR
docker push gcr.io/PROJECT_ID/IMAGE_NAME:latest

# Deploy to Cloud Run
gcloud run deploy SERVICE_NAME \
  --image gcr.io/PROJECT_ID/IMAGE_NAME:latest \
  --region us-central1 \
  --project PROJECT_ID \
  --allow-unauthenticated
```

### 2. Environment Variables
**Gemini API Key**: Embedded at build time in Dockerfile
```dockerfile
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
```

## Git & GitHub

### 1. Co-authorship
**Always include co-authors in commits**:
```bash
git commit -m "$(cat <<'EOF'
feat: Your commit message

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: kelapure <kelapure@github.com>
EOF
)"
```

### 2. Repository Structure
- Main repository: https://github.com/8090-inc/8090-risk-portal
- Public repository (no sensitive data)
- README.md at root for GitHub visibility

## User Management

### 1. GCIP Tenant Users
**Total Users**: 71 (61 internal, 10 external)
- External users use `@ext.dompe.com` domain
- Passwords: Last name (with "2024" appended if < 6 characters)
- Bulk import using Firebase Admin SDK

**Key External Users**:
- Arvind Pandey, Pamela Capalbo, Pietro Tabaglio, John Calzaretta
- Alexis Morris, Richard Duff, Sina Sojoodi, Victoria Petrillo
- Lauren Parker, Vivian Li

## Architecture Overview

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   End User      │────▶│ Load Balancer│────▶│      IAP        │
│                 │     │ (SSL/HTTPS)  │     │ (Access Control)│
└─────────────────┘     └──────────────┘     └────────┬────────┘
                                                       │
                               ┌───────────────────────┴───────────────────────┐
                               │                                               │
                               ▼                                               ▼
                    ┌──────────────────┐                            ┌─────────────────┐
                    │ Firebase Hosting │                            │   Cloud Run     │
                    │  (Auth UI Only)  │                            │ (Risk Portal)   │
                    │  /auth.html      │                            │                 │
                    └─────────┬────────┘                            └────────┬────────┘
                              │                                              │
                              ▼                                              ▼
                    ┌──────────────────┐                            ┌─────────────────┐
                    │      GCIP        │                            │    Firestore    │
                    │ (Identity Platform)                           │   (Database)    │
                    │ Tenant: dompe8090 │                           └─────────────────┘
                    └──────────────────┘
```

## Common Issues & Solutions

### 1. "Cannot read properties of undefined (reading 'tenantId')"
**Solution**: Use FirebaseUI with gcip-iap module following official Google documentation

### 2. Double Authentication (IAP + React Login)
**Solution**: Remove client-side authentication, trust IAP headers via `/api/auth/me`

### 3. Gemini API Key Errors
**Solution**: Embed API key at Docker build time, not runtime

### 4. Firebase Dependencies Not Loading
**Solution**: Use correct CDN URLs (v6.0.2 for FirebaseUI, v9.23.0 for Firebase SDK)

## Testing & Debugging

### 1. Local Development
```bash
cd 8090-risk-portal
npm run dev
# Access at http://localhost:3000
```

### 2. Check IAP Authentication
```bash
curl -I https://dompe.airiskportal.com
# Should return 302 redirect to auth page if not authenticated
```

### 3. View Cloud Run Logs
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=risk-portal-backend" --limit 50
```

## Version History
- v2.2: IAP + GCIP authentication implementation
- v2.2.1: Gemini API fix with visual loading indicator
- v2.3: User management and batch import

---
*Last Updated: 2025-07-20*