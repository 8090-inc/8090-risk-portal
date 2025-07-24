# 8090 Risk Portal Documentation

*Last Updated: 2025-07-24*

## Overview
This directory contains comprehensive documentation for the 8090 AI Risk Portal application, including architecture guides, deployment instructions, feature implementations, and development learnings.

## Directory Structure

### 📐 Architecture
- [ARCHITECTURE.md](architecture/ARCHITECTURE.md) - System architecture and design with ASCII diagrams
- [TESTING_CHECKLIST.md](architecture/TESTING_CHECKLIST.md) - Testing procedures and checklist

### 🚀 Deployment
- [iap-setup.md](deployment/iap-setup.md) - Identity-Aware Proxy setup guide
- [iap-setup-instructions.md](deployment/iap-setup-instructions.md) - Detailed IAP instructions
- [iap-signin-exception.md](deployment/iap-signin-exception.md) - IAP signin exception handling
- [fix-api-key.md](deployment/fix-api-key.md) - API key configuration guide

### 📚 Guides
- [BRAND_UPDATE_GUIDE.md](guides/BRAND_UPDATE_GUIDE.md) - Branding customization guide
- [VISUAL_POLISH_SUMMARY.md](guides/VISUAL_POLISH_SUMMARY.md) - UI/UX improvements summary
- [user-access-email.md](guides/user-access-email.md) - User access email template
- [users-comprehensive-table.md](guides/users-comprehensive-table.md) - User management table

### 🐛 Bug Reports
- [BUG-REPORT-LOGOUT.md](bugs/BUG-REPORT-LOGOUT.md) - Logout bug resolution (CLOSED)

### 🔧 Development
- [CLAUDE.md](dev/CLAUDE.md) - Claude AI assistant instructions (DEPRECATED - see root CLAUDE.md)
- [VALIDATED-LEARNINGS.md](dev/VALIDATED-LEARNINGS.md) - Technical learnings and discoveries
- [verify-filters.md](dev/verify-filters.md) - Filter verification guide

### ✨ Features
- [FEATURE-IMPLEMENTATION-SUMMARY.md](features/FEATURE-IMPLEMENTATION-SUMMARY.md) - Summary of all implemented features
- [FEATURE-VISUAL-CONSISTENCY-RISK-MATRIX-REPORTS.md](features/FEATURE-VISUAL-CONSISTENCY-RISK-MATRIX-REPORTS.md) - Visual consistency improvements
- [VISUAL-CONSISTENCY-IMPLEMENTATION-SUMMARY.md](features/VISUAL-CONSISTENCY-IMPLEMENTATION-SUMMARY.md) - Visual consistency implementation details

#### Control Refactor
- [control-refactor/FEATURE-REFACTOR-CONTROLS.md](features/control-refactor/FEATURE-REFACTOR-CONTROLS.md) - Controls view refactoring
- [control-refactor/IMPLEMENTATION-SUMMARY.md](features/control-refactor/IMPLEMENTATION-SUMMARY.md) - Implementation summary
- [control-refactor/FILTER-POSITION-UPDATE.md](features/control-refactor/FILTER-POSITION-UPDATE.md) - Filter positioning updates
- [control-refactor/VISUAL-CONSISTENCY-UPDATE.md](features/control-refactor/VISUAL-CONSISTENCY-UPDATE.md) - Visual consistency updates
- [control-refactor/ButtonNotFunctionalonControlsDashboard.md](features/control-refactor/ButtonNotFunctionalonControlsDashboard.md) - Button functionality issue

#### Dashboard Alignment
- [dashboard-alignment/FEATURE-DASHBOARD-VISUAL-ALIGNMENT-FIX.md](features/dashboard-alignment/FEATURE-DASHBOARD-VISUAL-ALIGNMENT-FIX.md) - Dashboard alignment fix
- [dashboard-alignment/IMPLEMENTATION-COMPLETE.md](features/dashboard-alignment/IMPLEMENTATION-COMPLETE.md) - Implementation completion report
- [dashboard-alignment/CRITIQUE-DASHBOARD-ALIGNMENT-SOLUTION.md](features/dashboard-alignment/CRITIQUE-DASHBOARD-ALIGNMENT-SOLUTION.md) - Solution critique
- [dashboard-alignment/TEST-RESULTS.md](features/dashboard-alignment/TEST-RESULTS.md) - Test results
- [dashboard-alignment/VISUAL-TEST-CHECKLIST.md](features/dashboard-alignment/VISUAL-TEST-CHECKLIST.md) - Visual testing checklist

#### Risk Filters Refactor
- [risk-filters-refactor/FEATURE-RISK-FILTERS-REFACTOR.md](features/risk-filters-refactor/FEATURE-RISK-FILTERS-REFACTOR.md) - Risk filters refactoring
- [risk-filters-refactor/IMPLEMENTATION-SUMMARY.md](features/risk-filters-refactor/IMPLEMENTATION-SUMMARY.md) - Implementation summary

#### Use Cases Implementation
- [usecase/FEATURE-USE-CASES.md](features/usecase/FEATURE-USE-CASES.md) - Use cases feature specification
- [usecase/IMPLEMENTATION-PLAN.md](features/usecase/IMPLEMENTATION-PLAN.md) - Implementation plan for use cases
- [usecase/PHASE-1-SUMMARY.md](features/usecase/PHASE-1-SUMMARY.md) - Phase 1 implementation summary
- [usecase/PHASE-1-VALIDATION.md](features/usecase/PHASE-1-VALIDATION.md) - Phase 1 validation results
- [usecase/PHASE-2-PROGRESS.md](features/usecase/PHASE-2-PROGRESS.md) - Phase 2 progress report
- [usecase/TESTING-STRATEGY.md](features/usecase/TESTING-STRATEGY.md) - Testing strategy for use cases

#### Backend Features
- [backend/EXCEL-PARSE.md](features/backend/EXCEL-PARSE.md) - Excel parsing implementation
- [backend/GOOGLE-DRIVE-INTEGRATION-STATUS.md](features/backend/GOOGLE-DRIVE-INTEGRATION-STATUS.md) - Google Drive integration status
- [backend/PHASE-1-VALIDATION-SUMMARY.md](features/backend/PHASE-1-VALIDATION-SUMMARY.md) - Backend phase 1 validation
- [backend/PHASE-4-COMPLETION-SUMMARY.md](features/backend/PHASE-4-COMPLETION-SUMMARY.md) - Phase 4 completion summary
- [backend/REFACTOR-DATA-BACKEND.md](features/backend/REFACTOR-DATA-BACKEND.md) - Backend data refactoring
- [backend/RISK-CONTROL-ADDS-IMPLEMENTATION.md](features/backend/RISK-CONTROL-ADDS-IMPLEMENTATION.md) - Risk control additions implementation
- [backend/CROSS-BROWSER-TEST-CHECKLIST.md](features/backend/CROSS-BROWSER-TEST-CHECKLIST.md) - Cross-browser testing checklist

### 📋 Other Documentation
- [REORGANIZATION-SUMMARY.md](REORGANIZATION-SUMMARY.md) - Documentation reorganization summary

## Quick Links

### For Developers
- Start with [ARCHITECTURE.md](architecture/ARCHITECTURE.md) to understand the system design
- Review [VALIDATED-LEARNINGS.md](dev/VALIDATED-LEARNINGS.md) for important technical insights
- Check feature implementation docs in the [features/](features/) directory
- See [Use Cases Implementation](features/usecase/) for the latest feature addition

### For DevOps
- Follow [iap-setup-instructions.md](deployment/iap-setup-instructions.md) for IAP configuration
- Review [fix-api-key.md](deployment/fix-api-key.md) for API key setup
- Check [Google Drive Integration Status](features/backend/GOOGLE-DRIVE-INTEGRATION-STATUS.md) for persistence layer

### For Product/Design
- See [VISUAL_POLISH_SUMMARY.md](guides/VISUAL_POLISH_SUMMARY.md) for UI/UX improvements
- Review feature implementations in [features/](features/) directory
- Check [Use Cases Feature](features/usecase/FEATURE-USE-CASES.md) for latest functionality

## Recent Updates (2025-07-24)
- Added Use Cases feature documentation
- Documented backend features including Excel parsing and Google Drive integration
- Updated cross-browser testing checklist
- Added Phase 1-4 completion summaries

## Documentation Standards

When adding new documentation:
1. Use descriptive filenames in UPPERCASE with hyphens
2. Include a clear title and date at the top of each document
3. Add the document to this README.md index
4. Place documents in the appropriate subdirectory
5. Include relevant diagrams, code snippets, or screenshots where helpful
6. Update the "Last Updated" date at the top of this file