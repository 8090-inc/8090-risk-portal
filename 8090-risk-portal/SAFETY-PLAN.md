# SAFETY PLAN: Adding ID Column to Excel Parser

## CRITICAL: Protecting the 33 Production Risks

### Safety Measures:
1. **NEVER touch the production file** (ID: 1OzrkAUQTWY7VUNrX-_akCWIuU2ALR3sm)
2. **Backwards compatibility** - Handle Excel files with or without ID column
3. **Auto-migration** - Generate IDs for existing risks if missing
4. **No data loss** - All existing data preserved
5. **Gradual rollout** - Test thoroughly before any production deployment

### Implementation Steps:

#### Phase 1: Update Parser (Safe - Read Only)
- Detect if ID column exists
- If yes: Use it
- If no: Generate IDs on-the-fly (current behavior)

#### Phase 2: Update Writer (Safe - Backwards Compatible)
- When writing, always include ID column
- Preserve all existing data

#### Phase 3: Testing
- Test with mock data only
- Verify backwards compatibility
- Ensure no data corruption

### The Code Changes:
1. Update RISK_COLUMNS mapping (shift all indices by 1)
2. Update parseRisksFromWorkbook to handle both formats
3. Update all write operations to include ID
4. Make ID matching use exact ID instead of regeneration

### What WON'T Change:
- No changes to production Excel file
- No changes to Google Drive permissions
- No data migration until fully tested
- Existing functionality remains intact