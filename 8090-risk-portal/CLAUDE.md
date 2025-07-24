# Claude AI Assistant Instructions

## 🏢 Project Context

**8090 AI Risk Portal** for Dompé farmaceutici S.p.A.  
**Current Version**: v2.8.2  
**Production URL**: https://risk-portal-290017403746.us-central1.run.app  
**Repository**: https://github.com/8090-inc/8090-risk-portal

### Tech Stack
- **Frontend**: React 19 + TypeScript 5.8 + Tailwind CSS + Zustand
- **Backend**: Node.js 20 + Express 4.21 + Google Drive integration
- **Infrastructure**: Google Cloud Run + IAP + Identity Platform
- **AI**: Google Gemini API for report generation

### Key Features
- AI risk assessment and management
- Control effectiveness tracking
- UseCase-to-risk relationship mapping
- Interactive risk matrix visualization
- AI-powered report generation with Gemini
- Real-time collaboration with Excel backend
- Markdown-enhanced mitigation display

## 🚀 Getting Started

### Onboarding Process
1. **Explore the codebase** using available tools (Read, Grep, codebase_search_agent)
2. **Check recent changes** in AGENT.md and VALIDATED-LEARNINGS.md
3. **Review current architecture** and recent bug fixes
4. **Ask clarifying questions** if anything is unclear
5. **Document your understanding** for future reference

### Essential Files to Review
- `AGENT.md` - Current version info and deployment commands
- `docs/dev/VALIDATED-LEARNINGS.md` - Technical learnings and solutions
- `docs/deployment/DEPLOYMENT-SUMMARY-2025-07-24.md` - Latest deployment details
- `src/types/` - TypeScript interfaces for data structures
- `server/api/v1/` - REST API endpoints

## ⚠️ Critical Guidelines

### Code Quality & Safety
- **NO SHORTCUTS**: Always implement proper solutions, not workarounds
- **CHECK IN FREQUENTLY**: After each phase, task, or decision point
- **PRECISE LANGUAGE**: Use exact technical terms and factual reporting  
- **ASK WHEN UNCLEAR**: Stop and ask questions rather than assume
- **PRESERVE RESOURCES**: Never delete Google Cloud resources without approval
- **DOCUMENT LEARNINGS**: Always update `docs/dev/VALIDATED-LEARNINGS.md`

### Development Workflow
1. **Analyze requirements** thoroughly before coding
2. **Check existing patterns** in the codebase for consistency
3. **Test locally** before committing changes
4. **Run quality checks** (lint, build) before deployment
5. **Update documentation** for significant changes

## 🚀 Deployment & Development

### Local Development Commands
```bash
# Start development servers
npm run dev        # Frontend (http://localhost:3000)
npm run dev:server # Backend (http://localhost:8080)

# Quality checks
npm run lint       # ESLint + TypeScript
npm run build      # Production build
npm test          # Jest tests
```

### Current Production Deployment (Updated July 24, 2025)
```bash
# Complete deployment sequence (from AGENT.md)
npm run build
docker build --platform linux/amd64 -t gcr.io/dompe-dev-439304/risk-portal:latest .
gcloud auth configure-docker
docker push gcr.io/dompe-dev-439304/risk-portal:latest
gcloud run deploy risk-portal --image gcr.io/dompe-dev-439304/risk-portal:latest --region us-central1
```

### Architecture Overview
```
Internet → Google Load Balancer → IAP → Cloud Run (risk-portal)
                                 ↓
                         Identity Platform (GCIP)
                              ↓
                    Express Backend + React Frontend
                              ↓
                   Google Drive Excel File + Gemini API
```

**Production URL**: https://risk-portal-290017403746.us-central1.run.app  
**Service Name**: `risk-portal` (NOT `dompe-risk-portal`)  
**Region**: us-central1

## 🔐 Authentication & Security

### IAP Authentication (Current System)
- **Identity-Aware Proxy (IAP)** with Google Cloud Identity Platform
- **Header Format**: `securetoken.google.com/project/tenant:user@domain.com`  
- **Local Development**: Automatic mock user (`Local User` with `local.user@dompe.com`)
- **Production**: IAP headers automatically injected by Google Cloud
- **Name Extraction**: Converts `firstname.lastname` to "Firstname Lastname"

### Authentication Headers (v2.8 Fix)
**Recent Fix**: IAP header format changed from `accounts.google.com:` to `securetoken.google.com/project/tenant:`

```javascript
// Fixed parsing logic (both server.cjs and server/middleware/auth.cjs)  
const cleanEmail = email.split(':').pop() || '';
const cleanUserId = userId.split(':').pop() || '';
```

### Legacy Code (Technical Debt)
- `authService.ts` and `LoginView.tsx` are dead code from Firebase Auth migration
- All authentication now flows through IAP → `/api/auth/me` → `authStore.ts`
- Logout: `window.location.href = '/?gcp-iap-mode=GCIP_SIGNOUT';`

## 📝 Git Workflow & Commit Standards

### Required Author Attribution
**CRITICAL**: All commits MUST include proper author attribution:
```bash
git commit --author="Rohit Kelapure <kelapure@gmail.com>" -m "commit message"
```

### Commit Message Format
```bash
git add .
git commit --author="Rohit Kelapure <kelapure@gmail.com>" -m "type: Description

- Specific change 1
- Specific change 2  
- Technical details

Usage examples or verification steps if applicable"
```

### Commit Types
- `feat:` - New features
- `fix:` - Bug fixes  
- `docs:` - Documentation updates
- `refactor:` - Code restructuring
- `style:` - Code formatting
- `test:` - Test additions

**Never forget the --author flag!**

## 📊 Data Management & Integration

### Google Drive Backend
- **Excel File**: `General AI Risk Map.xlsx` (File ID: `1OzrkAUQTWY7VUNrX-_akCWIuU2ALR3sm`)
- **Service Account**: `290017403746-compute@developer.gserviceaccount.com`
- **Data Flow**: Excel → GoogleDrivePersistenceProvider → API → Frontend Stores
- **Real-time Updates**: Changes sync immediately to Excel backend

### Testing Safety Rules ⚠️
**CRITICAL**: Always backup Excel file before tests that modify data
1. Create backup before running write tests
2. Clean up test data after tests complete  
3. Restore from backup if cleanup fails
4. **Test Patterns**: `TEST-*` control IDs, "test risk created by automated testing"

## 🛠️ Recent Enhancements (v2.8+)

### Markdown Mitigation Display (v2.8.2)
- **react-markdown** integration for rich text formatting
- **Auto-detection** of markdown vs plain text content
- **Enhanced regulation references**: `GDPR`, `NIST`, `21 CFR` styled as code blocks
- **Control references**: `(SEC-06)`, `(LOG-03)` highlighted  
- **Backward compatibility** with legacy plain text mitigations

### Mitigation Update Scripts
- `scripts/update-agreed-mitigations.cjs` - Bulk updates for 4 specific risks
- `scripts/update-sensitive-info-mitigation.cjs` - Focused updates for detailed changes
- **Safe dry-run mode** by default (`DRY_RUN=true`)
- **Before/after preview** and comprehensive error handling

### Recent Bug Fixes (v2.8)
- **IAP Header Parsing**: Fixed `securetoken.google.com` format handling
- **UseCase Risk Filtering**: Fixed property name mismatches (`risk.riskDescription` vs `risk.description`)
- **Project Cleanup**: Removed 48K+ lines of redundant files and reorganized structure

## 📚 Documentation & Learning Resources

### Key Documentation Files
- **`AGENT.md`** - Version info, deployment commands, development guidelines
- **`docs/dev/VALIDATED-LEARNINGS.md`** - Technical solutions and debugging guides
- **`docs/deployment/DEPLOYMENT-SUMMARY-2025-07-24.md`** - Latest deployment details
- **`docs/features/MARKDOWN-MITIGATION-RENDERING.md`** - Markdown enhancement details
- **`scripts/README.md`** - Script usage and development guidelines

### Architecture References
- **API Structure**: `server/api/v1/` - RESTful endpoints for risks, controls, usecases
- **Type Definitions**: `src/types/` - TypeScript interfaces for all data structures
- **State Management**: `src/store/` - Zustand stores for risks, controls, auth, etc.
- **UI Components**: `src/components/` - Reusable React components with consistent styling