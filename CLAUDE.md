# Claude Memory File - 8090 Risk Portal

This file contains important context and learnings that Claude should be aware of when working on this project.

## Project Overview

The 8090 Risk Portal is a comprehensive risk management platform deployed on Google Cloud Platform using:
- Google Cloud Identity Platform (GCIP) with tenant ID: `dompe8090-bf0qr`
- Identity-Aware Proxy (IAP) for access control
- Cloud Run for the backend service
- Firebase Hosting for authentication pages
- Firestore for data persistence

## Critical Technical Knowledge

### Authentication & IAP

**IMPORTANT: GCIP + IAP Logout**
- **Never use** `/_gcp_iap/clear_login_cookie` for logout - it only clears IAP session
- **Always use** `/?gcp-iap-mode=GCIP_SIGNOUT` to properly sign out from both GCIP and IAP
- Don't navigate to `/login` after logout - let GCIP handle redirects

### Deployment Requirements

**Cloud Run Deployment**:
1. Always build Docker images with `--platform linux/amd64`
2. Use `--allow-unauthenticated` flag (IAP handles authentication)
3. Push to GCR before deploying

```bash
docker build --platform linux/amd64 -t gcr.io/dompe-dev-439304/risk-portal-backend:latest .
docker push gcr.io/dompe-dev-439304/risk-portal-backend:latest
gcloud run deploy risk-portal-backend --image gcr.io/dompe-dev-439304/risk-portal-backend:latest --region us-central1 --project dompe-dev-439304 --allow-unauthenticated
```

### Git Commits

**Always include co-authors**:
```bash
git commit -m "$(cat <<'EOF'
feat: Your commit message

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: kelapure <kelapure@github.com>
EOF
)"
```

## Project Structure

```
8090-risk-portal/
├── src/                    # React TypeScript frontend
├── server.js              # Express backend with IAP integration
├── public/
│   ├── auth.html          # GCIP authentication page
│   └── auth.js            # FirebaseUI with gcip-iap module
├── Dockerfile             # Multi-stage build for production
└── package.json           # Dependencies and scripts
```

## Key URLs

- Production: https://dompe.airiskportal.com
- Cloud Run Service: https://risk-portal-backend-290017403746.us-central1.run.app
- GitHub Repository: https://github.com/8090-inc/8090-risk-portal
- Firebase Hosting: https://dompe-dev-439304.web.app

## User Management

- Total Users: 71 (61 internal, 10 external)
- External users use `@ext.dompe.com` domain
- Passwords: Last name (with "2024" appended if < 6 characters)

## Common Issues & Solutions

1. **"Cannot read properties of undefined (reading 'tenantId')"**
   - Use FirebaseUI with gcip-iap module following official Google documentation

2. **Double Authentication (IAP + React Login)**
   - Remove client-side authentication, trust IAP headers via `/api/auth/me`

3. **Gemini API Key Errors**
   - Embed API key at Docker build time, not runtime

4. **Firebase Dependencies Not Loading**
   - Use correct CDN URLs (v6.0.2 for FirebaseUI, v9.23.0 for Firebase SDK)

## Testing Commands

```bash
# Local development
cd 8090-risk-portal && npm run dev

# Check IAP authentication
curl -I https://dompe.airiskportal.com

# View Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=risk-portal-backend" --limit 50
```

## Important Files to Reference

- `/VALIDATED-LEARNINGS.md` - Detailed technical learnings and solutions
- `/BUG-REPORT-LOGOUT.md` - Logout issue documentation
- `/COMPARE-WITH-VANTA.md` - Feature comparison analysis
- `/README.md` - Project documentation and deployment guide

## Version History

- v2.2: IAP + GCIP authentication implementation
- v2.2.1: Gemini API fix with visual loading indicator  
- v2.3: User management and batch import

---
*Last Updated: 2025-07-20*