# AGENT.md - 8090 AI Risk Portal Development Guide

## Commands
- **Build**: `npm run build` or `npm run build:check` (includes typecheck)
- **Lint**: `npm run lint` (ESLint with TypeScript)
- **Test**: `npm test` (single test: `npm test -- filename`)
- **Dev**: `npm run dev` (frontend:3000) + `npm run dev:server` (backend:8080)
- **Deploy**: Build Docker with `--platform linux/amd64`, push to gcr.io/dompe-dev-439304/risk-portal:latest

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

## Testing Guidelines
⚠️ **CRITICAL**: Always backup Excel file before tests that modify data. Use cleanup-test-data.cjs to remove test data.
