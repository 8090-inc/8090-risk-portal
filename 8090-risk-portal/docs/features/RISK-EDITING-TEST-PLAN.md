# Risk Editing Feature - Test Plan

## 🧪 Test Scenarios

### 1. **Basic Edit Test**
**Objective**: Verify basic field editing functionality

**Steps**:
1. Navigate to Risk Detail View (e.g., `/risks/risk-001`)
2. Click "Edit Risk" button
3. Modify the following fields:
   - Change Risk Category to a different option
   - Update Risk Description with new text
   - Add/modify Notes field
4. Click "Save Changes"
5. Wait for success confirmation

**Expected Results**:
- ✅ Modal closes after successful save
- ✅ Updated values appear immediately in detail view
- ✅ No error messages displayed
- ✅ Changes persist after page refresh

**Verification**:
```bash
# Download Excel and verify:
- Risk Category column updated
- Risk Description column shows new text
- Notes column reflects changes
```

### 2. **Risk Scoring Test**
**Objective**: Verify risk calculations and scoring updates

**Steps**:
1. Open Edit Risk modal for a risk
2. Note initial values:
   - Initial Likelihood: 3, Impact: 4 (Risk Level: 12)
   - Residual Likelihood: 2, Impact: 3 (Risk Level: 6)
3. Update Initial Assessment:
   - Set Likelihood to 5
   - Set Impact to 5
   - Verify Risk Level shows 25 (Critical)
4. Update Residual Assessment:
   - Set Likelihood to 2
   - Set Impact to 2
   - Verify Risk Level shows 4 (Low)
5. Verify Risk Reduction shows:
   - Points: 21 (25-4)
   - Percentage: 84%
6. Save changes

**Expected Results**:
- ✅ Risk levels calculate automatically
- ✅ Risk categories update based on score
- ✅ Risk reduction calculations are correct
- ✅ Excel columns show correct numeric values

**Excel Verification**:
```
Initial Likelihood: 5
Initial Impact: 5
Initial Risk Level: 25
Initial Risk Category: Critical
Residual Likelihood: 2
Residual Impact: 2
Residual Risk Level: 4
Residual Risk Category: Low
```

### 3. **Relationship Management Test**
**Objective**: Verify control relationship updates

**Steps**:
1. Open Edit Risk modal
2. Note current Related Controls
3. Add 2 new controls (e.g., SEC-01, LOG-03)
4. Remove 1 existing control
5. Save changes
6. Navigate to Controls tab to verify

**Expected Results**:
- ✅ Controls tab shows updated count
- ✅ New controls appear in list
- ✅ Removed control no longer shown
- ✅ Relationships sheet in Excel updated

**Excel Verification**:
```bash
# Check Relationships sheet:
- New rows for added Risk-Control relationships
- Removed rows for deleted relationships
- LinkType column shows "Risk-Control"
- CreatedBy shows current user
```

### 4. **Excel Sync Verification**
**Objective**: Confirm all changes sync to Google Drive

**Test Data**:
```javascript
{
  riskCategory: "Security and Data Risks",
  riskDescription: "Updated description for testing Excel sync",
  initialLikelihood: 4,
  initialImpact: 5,
  residualLikelihood: 2,
  residualImpact: 3,
  agreedMitigation: "## Enhanced Mitigation Strategy\n- Implement new controls\n- Regular monitoring",
  proposedOversightOwnership: ["IT Security", "Compliance"],
  proposedSupport: ["Legal", "Privacy"],
  notes: "Test note for Excel sync verification",
  relatedControlIds: ["SEC-01", "SEC-02", "LOG-01"]
}
```

**Steps**:
1. Edit a risk with above test data
2. Save changes
3. Wait 5 seconds for sync
4. Download Excel from Google Drive
5. Open Risk Map sheet
6. Find the edited risk row

**Expected Results**:
- ✅ All fields match test data
- ✅ Array fields (ownership/support) are comma-separated
- ✅ Calculated fields (risk levels) are correct
- ✅ Excel file structure remains valid

### 5. **Error Handling Test**
**Objective**: Verify proper error handling

**Test Cases**:

#### 5.1 Validation Errors
1. Clear required fields (category, description, ownership)
2. Try to save
3. **Expected**: Save button disabled, cannot proceed

#### 5.2 Network Failure Simulation
1. Open browser DevTools
2. Go to Network tab, set to "Offline"
3. Try to save changes
4. **Expected**: Error message displayed in modal

#### 5.3 Invalid Data Types
1. Use browser console to inject invalid data
2. Try to save
3. **Expected**: Backend validation catches error

**Expected Error Messages**:
- ✅ "Failed to save risk. Please try again."
- ✅ Specific validation messages for required fields
- ✅ Network error handling

### 6. **Concurrent Access Test**
**Objective**: Test multiple users editing

**Setup**: Need 2 browser sessions (regular + incognito)

**Steps**:
1. User A: Open risk RISK-001 for editing
2. User B: Open same risk RISK-001 for editing
3. User A: Change description and save
4. User B: Change category and save
5. Both users: Refresh page

**Expected Results**:
- ✅ Last save wins (User B's changes)
- ✅ No data corruption
- ✅ Excel shows final state correctly
- ✅ No error messages for normal operation

### 7. **Special Characters Test**
**Objective**: Verify handling of special characters

**Test Data**:
- Description with quotes: `Risk with "quotes" and 'apostrophes'`
- Mitigation with markdown: `**Bold** and _italic_ with [links](http://example.com)`
- Notes with line breaks and special chars: `Line 1\nLine 2\n& < > symbols`

**Expected Results**:
- ✅ All characters saved correctly
- ✅ Excel cells show proper escaping
- ✅ No data corruption
- ✅ Markdown renders correctly in UI

## 📋 Verification Checklist

### Pre-Test Setup
- [ ] Backend server running (`npm run dev:server`)
- [ ] Frontend server running (`npm run dev`)
- [ ] Valid Google Drive permissions
- [ ] Test user logged in
- [ ] Browser DevTools open for monitoring

### During Testing
- [ ] Monitor browser console for errors
- [ ] Check Network tab for API calls
- [ ] Verify 200 status codes
- [ ] Note response times

### Post-Test Verification
- [ ] Download Excel from Google Drive
- [ ] Verify Risk Map sheet updates
- [ ] Check Relationships sheet if applicable
- [ ] Confirm formulas still work
- [ ] Test file can be re-uploaded

## 📊 Performance Metrics

### Target Metrics
| Metric | Target | Acceptable |
|--------|--------|------------|
| Modal Load Time | < 500ms | < 1s |
| Save Operation | < 2s | < 3s |
| Excel Sync Time | < 3s | < 5s |
| Error Display | < 100ms | < 200ms |

### Measurement Steps
1. Use Performance tab in DevTools
2. Record timeline for save operation
3. Note timestamps:
   - Click Save: T0
   - API Request: T1
   - API Response: T2
   - Modal Close: T3
   - UI Update: T4

## 🐛 Bug Reporting Template

If issues are found, report with:

```markdown
### Issue: [Brief description]

**Test Scenario**: [Which test case]
**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]

**Expected**: [What should happen]
**Actual**: [What actually happened]

**Error Messages**: [Any console errors]
**Screenshots**: [If applicable]
**Excel State**: [Download and attach if relevant]
```

## ✅ Test Sign-Off

### Test Summary
- [ ] All basic edit scenarios pass
- [ ] Risk calculations are accurate
- [ ] Relationships update correctly
- [ ] Excel sync is reliable
- [ ] Error handling works properly
- [ ] Performance meets targets

### Known Issues
- [List any discovered issues]

### Test Environment
- Browser: [Chrome/Firefox/Safari version]
- Date: [Test date]
- Tester: [Name]
- Excel File Version: [From Google Drive]

## 🚀 Regression Test Plan

For future releases, run abbreviated tests:

1. **Smoke Test** (5 min)
   - Edit one risk
   - Change likelihood/impact
   - Save and verify

2. **Integration Test** (15 min)
   - Full edit with all fields
   - Add/remove controls
   - Download Excel verification

3. **Edge Cases** (10 min)
   - Special characters
   - Concurrent access
   - Error scenarios

Total regression time: ~30 minutes