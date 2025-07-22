# 8090 Risk Portal Documentation

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

### 📋 Other Documentation
- [REORGANIZATION-SUMMARY.md](REORGANIZATION-SUMMARY.md) - Documentation reorganization summary

## Quick Links

### For Developers
- Start with [ARCHITECTURE.md](architecture/ARCHITECTURE.md) to understand the system design
- Review [VALIDATED-LEARNINGS.md](dev/VALIDATED-LEARNINGS.md) for important technical insights
- Check feature implementation docs in the [features/](features/) directory

### For DevOps
- Follow [iap-setup-instructions.md](deployment/iap-setup-instructions.md) for IAP configuration
- Review [fix-api-key.md](deployment/fix-api-key.md) for API key setup

### For Product/Design
- See [VISUAL_POLISH_SUMMARY.md](guides/VISUAL_POLISH_SUMMARY.md) for UI/UX improvements
- Review feature implementations in [features/](features/) directory

## Documentation Standards

When adding new documentation:
1. Use descriptive filenames in UPPERCASE with hyphens
2. Include a clear title and date at the top of each document
3. Add the document to this README.md index
4. Place documents in the appropriate subdirectory
5. Include relevant diagrams, code snippets, or screenshots where helpful