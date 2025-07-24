# AGENT.md - 8090 AI Risk Portal Development Guide

## Current Version: v2.9.0 (July 24, 2025)
**Production URL**: https://risk-portal-290017403746.us-central1.run.app

## Commands
- **Build**: `npm run build` or `npm run build:check` (includes typecheck)
- **Lint**: `npm run lint` (ESLint with TypeScript)
- **Test**: `npm test` (single test: `npm test -- filename`)
- **Dev**: **CRITICAL - BOTH SERVERS REQUIRED:**
  - Backend FIRST: `npm run dev:server` (port 8080)
  - Frontend SECOND: `npm run dev` (port 3000)
  - **NEVER start only one server - both are required for local development**
- **Deploy**: 
  ```bash
  # Build & deploy sequence
  npm run build
  docker build --platform linux/amd64 -t gcr.io/dompe-dev-439304/risk-portal:latest .
  gcloud auth configure-docker
  docker push gcr.io/dompe-dev-439304/risk-portal:latest
  gcloud run deploy risk-portal --image gcr.io/dompe-dev-439304/risk-portal:latest --region us-central1
  ```

## Architecture
- **Stack**: React 19 + TypeScript 5.8 + Tailwind CSS + Express backend
- **Auth**: Google Cloud IAP + Identity Platform (GCIP), NOT Firebase Auth
- **Database**: Google Cloud Firestore + Google Drive Excel integration
- **State**: Zustand stores (authStore.ts, riskStore.ts, relationshipStore.ts, filterStore.ts)
- **Deployment**: Google Cloud Run behind IAP-enabled Load Balancer
- **AI**: Google Gemini API for report generation

## Code Style
- **Formatting**: Prettier (semi: true, singleQuote: true, printWidth: 100)
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Imports**: Use `@/` alias for src/, group by: React, external libs, internal
- **Types**: Define in `src/types/`, use Zod for validation
- **Error Handling**: Use errorService.ts, throw errors with proper types
- **Commits**: Include author `--author="Rohit Kelapure <kelapure@gmail.com>"`

## Authentication (IAP)
- **Local Development**: Automatic mock user (`Local User` with `local.user@dompe.com`)
- **Production**: IAP headers automatically injected by Google Cloud
- **Header Format**: `securetoken.google.com/project/tenant:user@domain.com`
- **Name Extraction**: Converts `firstname.lastname` to "Firstname Lastname"

## Testing Guidelines
⚠️ **CRITICAL**: Always backup Excel file before tests that modify data. Use cleanup-test-data.cjs to remove test data.

## Recent Updates (v2.8)
- Fixed IAP authentication header parsing for securetoken.google.com format
- Resolved UseCase Risk Management filtering bugs (property name mismatches)
- Major project cleanup - removed 48K+ lines of redundant files
- Enhanced user name extraction from email addresses
- Updated authentication middleware for consistent name handling
