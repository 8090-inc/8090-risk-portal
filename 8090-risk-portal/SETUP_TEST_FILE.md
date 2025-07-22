# Setting Up Test File Access

## Current Status
- **Test File ID**: `1bNFVLZVyrbJmp9pq_ka9-zrpR1p6ezNH`
- **Service Account**: `290017403746-compute@developer.gserviceaccount.com`
- **Status**: ❌ Service account does not have access

## Steps to Grant Access

1. **Open the test spreadsheet** in Google Sheets:
   https://docs.google.com/spreadsheets/d/1bNFVLZVyrbJmp9pq_ka9-zrpR1p6ezNH/edit

2. **Click the "Share" button** (top right corner)

3. **Add the service account**:
   - In the "Add people and groups" field, paste:
     ```
     290017403746-compute@developer.gserviceaccount.com
     ```
   - Set permission to **"Editor"**
   - Uncheck "Notify people" (service accounts don't need email notifications)
   - Click "Share"

4. **Verify access** by running:
   ```bash
   node scripts/setup-test-file.cjs
   ```

## Why This Is Needed

The test suite needs to:
- Read the current Excel data
- Create test entries marked with `[TEST]`
- Update existing test entries
- Delete test entries after tests complete

The service account needs Editor access to perform these operations.

## Security Note

This is a TEST copy of your production data. The tests will:
- Only modify data marked with `[TEST]` prefix
- Automatically backup before running
- Restore from backup after completion
- Clean up any test data that remains

Your production file remains untouched.