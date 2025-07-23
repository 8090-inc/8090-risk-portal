# Claude AI Assistant Instructions

# Project Context
This is the 8090 AI Risk Portal for Dompé farmaceutici S.p.A. - a React-based web application for managing AI risks and controls.


# Onboard

You are given the following context:
$ARGUMENTS

## Instructions

"AI models are geniuses who start from scratch on every task." - Noam Brown

Your job is to "onboard" yourself to the current task.

Do this by:

- Using ultrathink
- Exploring the codebase
- Asking me questions if needed

The goal is to get you fully prepared to start working on the task.

Take as long as you need to get yourself ready. Overdoing it is better than underdoing it.

Record everything in a .claude/tasks/[TASK_ID]/onboarding.md file. This file will be used to onboard you to the task in a new session if needed, so make sure it's comprehensive.

# GENERAL INSTRUCTIONS

### DO NOT TAKE SHORTCUTS OR WORKAROUNDS FOR ISSUES
### DO NOT TAKE WORKAROUNDS
### ALWAYS Checkin with me after the completion of a phase, task feature or a decision point
### ALWAYS STICK TO FACTS AND REPORT IN PRECISE TECHNICAL LANGUAGE
### IF SOMETHING IS NOT CLEAR STOP AND ASK THE USER
### DO NOT DELETE ANY SERVER LEVEL GOOGLE CLOUD RESOURCES BEFORE CHECKING IN WITH ME
### YOU WILL ALWAYS PERSIST YOUR LEARNING FROM THE SESSION IN docs/devVALIDATED-LEARNINGS.md

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
- `npm run build:check` - Check for TypeScript errors (note: no typecheck script exists)

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

## Dashboard Visual Alignment Fix
When the sidebar expands/collapses, matrix cells must maintain square proportions. We use the "padding-bottom 100%" technique instead of aspect-square:

```jsx
<div className="relative">
  <div className="pb-[100%]"></div>  {/* Creates square space */}
  <div className="absolute inset-0">  {/* Content positioned absolutely */}
    {/* Cell content */}
  </div>
</div>
```

This ensures cells remain square regardless of container width changes.

## Git Commit Instructions

### IMPORTANT: Always Include Proper Author
When making commits, ALWAYS include the proper author:
```bash
git commit --author="Rohit Kelapure <kelapure@gmail.com>" -m "your commit message"
```

### Commit Format
All commits must follow this format:
```bash
git add .
git commit --author="Rohit Kelapure <kelapure@gmail.com>" -m "type: Description

- Detail 1
- Detail 2

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**NEVER forget the --author flag!**

## Google Drive Integration
The backend integrates with Google Drive to read/write the risk data Excel file.

### Current Status
- **Working**: All read and write operations (GET/POST endpoints)
- **Service Account**: 290017403746-compute@developer.gserviceaccount.com
- **File ID**: 1OzrkAUQTWY7VUNrX-_akCWIuU2ALR3sm

### Important Testing Guidelines
⚠️ **ALWAYS snapshot the Excel file before and after tests**:
1. Tests that modify data MUST create a backup before running
2. Tests MUST clean up after themselves by removing test data
3. If cleanup fails, the backup should be used to restore the original state

### Test Data Cleanup
- Test risks: Any risk with description containing "test risk created by automated testing"
- Test controls: Any control with ID starting with "TEST-"
- Use `cleanup-test-data.cjs` to remove test data if needed

### Parser Pattern Updates
The Excel parser accepts control IDs matching: `(ACC|SEC|LOG|GOV|TEST)-\d{2}$`

## Validated Learnings
For detailed technical learnings, debugging solutions, and best practices discovered during development, see:
📚 [/docs/dev/VALIDATED-LEARNINGS.md](/docs/dev/VALIDATED-LEARNINGS.md)

Key topics covered:
- Google Authentication and preventing "invalid_rapt" errors
- Excel parser implementation details
- Development environment setup
- Deployment architecture
- Visual alignment solutions
- Testing safety rules