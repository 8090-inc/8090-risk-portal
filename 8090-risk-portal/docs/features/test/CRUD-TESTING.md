# CRUD Testing - End-to-End Test Suite

## Feature: CRUD Operations Testing
## Date: 2025-01-21
## Status: IN PROGRESS
## Scope: UI → Backend → Google Drive

## Overview

This document outlines the comprehensive test suite for CRUD (Create, Read, Update, Delete) operations in the Risk Portal. The tests verify the complete flow from UI interactions through the backend API to the Google Drive Excel file.

## Test Architecture

### Test Levels
1. **Unit Tests** - Individual component/function testing
2. **Integration Tests** - API endpoint testing with mocked Google Drive
3. **E2E Tests** - Full flow testing with real Google Drive (requires backup/restore)

### Test Tools
- **Frontend**: Jest, React Testing Library, MSW (Mock Service Worker)
- **Backend**: Jest, Supertest
- **E2E**: Playwright or Cypress
- **Google Drive**: Custom backup/restore utilities

## Test File Requirements

### ⚠️ CRITICAL: NEVER USE PRODUCTION FILES FOR TESTING

**ABSOLUTE RULE**: NEVER, EVER use the production Google Drive file for testing purposes.

**Production File ID**: `1OzrkAUQTWY7VUNrX-_akCWIuU2ALR3sm` - DO NOT USE FOR TESTS

**Why This is Critical**:
- Tests modify data directly in the Excel file
- There is no transactional rollback if tests fail
- Production data corruption would affect the entire system
- Even "temporary" use of production files is FORBIDDEN

**Correct Test Setup**:
1. Create a dedicated copy of the Excel file for testing
2. Name it clearly (e.g., "Copy of General AI Risk Map for TESTING")
3. Share it with the service account (Editor permission)
4. Use ONLY this test file ID in `.env.test`
5. If test file becomes inaccessible, create a new copy - NEVER use production

**Test File Requirements**:
- Must be a separate copy, not the original
- Should be clearly named as a test file
- Will be modified during tests

## Backup and Cleanup Strategy

### Before Each Test Suite
```javascript
// backup-utils.js
const backupExcelFile = async () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupId = await googleDriveService.copyFile(
    EXCEL_FILE_ID,
    `backup-${timestamp}-General AI Risk Map.xlsx`
  );
  return backupId;
};
```

### After Each Test Suite
```javascript
const restoreFromBackup = async (backupId) => {
  // Download backup content
  const backupContent = await googleDriveService.downloadFile(backupId);
  
  // Overwrite original with backup
  await googleDriveService.uploadFile(EXCEL_FILE_ID, backupContent);
  
  // Delete backup file
  await googleDriveService.deleteFile(backupId);
};
```

### Test Data Cleanup
```javascript
const cleanupTestData = async () => {
  const data = await fetchExcelData();
  
  // Remove test risks (identified by specific pattern)
  const testRisks = data.risks.filter(r => 
    r.riskDescription.includes('[TEST]') || 
    r.id.startsWith('TEST-')
  );
  
  for (const risk of testRisks) {
    await excelParser.deleteRiskById(workbook, risk.id);
  }
  
  // Remove test controls
  const testControls = data.controls.filter(c => 
    c.mitigationID.startsWith('TEST-')
  );
  
  for (const control of testControls) {
    await excelParser.deleteControlById(workbook, control.mitigationID);
  }
};
```

## Test Suites

### 1. Backend Unit Tests

#### Risk CRUD Operations
```javascript
// __tests__/backend/risk-crud.test.js
describe('Risk CRUD Operations', () => {
  let backupId;
  
  beforeAll(async () => {
    backupId = await backupExcelFile();
  });
  
  afterAll(async () => {
    await restoreFromBackup(backupId);
  });
  
  afterEach(async () => {
    await cleanupTestData();
  });
  
  describe('POST /api/risks', () => {
    it('should create a new risk and persist to Google Drive', async () => {
      const newRisk = {
        riskCategory: 'Behavioral Risks',
        risk: '[TEST] Automated Test Risk',
        riskDescription: '[TEST] This risk was created by automated testing',
        initialScoring: {
          likelihood: 3,
          impact: 4,
          riskLevel: 12,
          riskLevelCategory: 'High'
        },
        residualScoring: {
          likelihood: 2,
          impact: 3,
          riskLevel: 6,
          riskLevelCategory: 'Medium'
        },
        agreedMitigation: '[TEST] Automated test mitigation',
        proposedOversightOwnership: ['Test Owner'],
        proposedSupport: ['Test Support'],
        notes: '[TEST] Automated test notes'
      };
      
      // Create risk via API
      const response = await request(app)
        .post('/api/risks')
        .set('X-Goog-Authenticated-User-Email', 'accounts.google.com:test@dompe.com')
        .send(newRisk);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      
      // Verify in Google Drive
      const excelData = await fetchExcelData();
      const createdRisk = excelData.risks.find(r => 
        r.riskDescription === '[TEST] This risk was created by automated testing'
      );
      
      expect(createdRisk).toBeDefined();
      expect(createdRisk.risk).toBe('[TEST] Automated Test Risk');
      expect(createdRisk.agreedMitigation).toBe('[TEST] Automated test mitigation');
    });
  });
  
  describe('PUT /api/risks/:id', () => {
    it('should update an existing risk in Google Drive', async () => {
      // First create a test risk
      const createResponse = await request(app)
        .post('/api/risks')
        .set('X-Goog-Authenticated-User-Email', 'accounts.google.com:test@dompe.com')
        .send({
          riskCategory: 'Behavioral Risks',
          risk: '[TEST] Risk to Update',
          riskDescription: '[TEST] Original description',
          initialScoring: { likelihood: 3, impact: 3, riskLevel: 9, riskLevelCategory: 'Medium' },
          residualScoring: { likelihood: 2, impact: 2, riskLevel: 4, riskLevelCategory: 'Low' }
        });
      
      const riskId = createResponse.body.id;
      
      // Update the risk
      const updateResponse = await request(app)
        .put(`/api/risks/${riskId}`)
        .set('X-Goog-Authenticated-User-Email', 'accounts.google.com:test@dompe.com')
        .send({
          riskDescription: '[TEST] Updated description',
          agreedMitigation: '[TEST] New mitigation strategy'
        });
      
      expect(updateResponse.status).toBe(200);
      
      // Verify in Google Drive
      const excelData = await fetchExcelData();
      const updatedRisk = excelData.risks.find(r => r.id === riskId);
      
      expect(updatedRisk.riskDescription).toBe('[TEST] Updated description');
      expect(updatedRisk.agreedMitigation).toBe('[TEST] New mitigation strategy');
    });
  });
  
  describe('DELETE /api/risks/:id', () => {
    it('should delete a risk from Google Drive', async () => {
      // First create a test risk
      const createResponse = await request(app)
        .post('/api/risks')
        .set('X-Goog-Authenticated-User-Email', 'accounts.google.com:test@dompe.com')
        .send({
          riskCategory: 'Behavioral Risks',
          risk: '[TEST] Risk to Delete',
          riskDescription: '[TEST] This risk will be deleted',
          initialScoring: { likelihood: 3, impact: 3, riskLevel: 9, riskLevelCategory: 'Medium' },
          residualScoring: { likelihood: 2, impact: 2, riskLevel: 4, riskLevelCategory: 'Low' }
        });
      
      const riskId = createResponse.body.id;
      
      // Delete the risk
      const deleteResponse = await request(app)
        .delete(`/api/risks/${riskId}`)
        .set('X-Goog-Authenticated-User-Email', 'accounts.google.com:test@dompe.com');
      
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);
      
      // Verify deletion in Google Drive
      const excelData = await fetchExcelData();
      const deletedRisk = excelData.risks.find(r => r.id === riskId);
      
      expect(deletedRisk).toBeUndefined();
    });
  });
});
```

### 2. Frontend Integration Tests

#### Risk Store Tests
```javascript
// __tests__/store/riskStore.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useRiskStore } from '../../src/store/riskStore';
import { server } from '../mocks/server';
import { rest } from 'msw';

describe('Risk Store CRUD Operations', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  
  describe('createRisk', () => {
    it('should create a risk and update store', async () => {
      const { result } = renderHook(() => useRiskStore());
      
      const newRisk = {
        riskCategory: 'Behavioral Risks',
        risk: 'Test Risk',
        riskDescription: 'Test Description',
        initialScoring: { likelihood: 3, impact: 3, riskLevel: 9, riskLevelCategory: 'Medium' },
        residualScoring: { likelihood: 2, impact: 2, riskLevel: 4, riskLevelCategory: 'Low' }
      };
      
      await act(async () => {
        await result.current.createRisk(newRisk);
      });
      
      expect(result.current.risks).toHaveLength(1);
      expect(result.current.risks[0].risk).toBe('Test Risk');
    });
  });
  
  describe('updateRisk', () => {
    it('should update a risk via API and update store', async () => {
      const { result } = renderHook(() => useRiskStore());
      
      // Mock initial risk
      server.use(
        rest.get('/api/risks', (req, res, ctx) => {
          return res(ctx.json([{
            id: 'test-123',
            risk: 'Original Risk',
            riskDescription: 'Original Description'
          }]));
        })
      );
      
      await act(async () => {
        await result.current.loadRisks();
      });
      
      // Update risk
      await act(async () => {
        await result.current.updateRisk({
          id: 'test-123',
          riskDescription: 'Updated Description'
        });
      });
      
      expect(result.current.risks[0].riskDescription).toBe('Updated Description');
    });
  });
  
  describe('deleteRisk', () => {
    it('should delete a risk via API and remove from store', async () => {
      const { result } = renderHook(() => useRiskStore());
      
      // Mock initial risks
      server.use(
        rest.get('/api/risks', (req, res, ctx) => {
          return res(ctx.json([
            { id: 'test-123', risk: 'Risk to Delete' },
            { id: 'test-456', risk: 'Risk to Keep' }
          ]));
        })
      );
      
      await act(async () => {
        await result.current.loadRisks();
      });
      
      expect(result.current.risks).toHaveLength(2);
      
      // Delete risk
      await act(async () => {
        await result.current.deleteRisk('test-123');
      });
      
      expect(result.current.risks).toHaveLength(1);
      expect(result.current.risks[0].id).toBe('test-456');
    });
  });
});
```

### 3. UI Component Tests

#### SimpleRiskMatrixView Tests
```javascript
// __tests__/views/SimpleRiskMatrixView.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SimpleRiskMatrixView } from '../../src/views/SimpleRiskMatrixView';
import { server } from '../mocks/server';
import { rest } from 'msw';

describe('SimpleRiskMatrixView CRUD Operations', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  
  describe('Bulk Delete', () => {
    it('should select risks and delete them', async () => {
      // Mock risks data
      server.use(
        rest.get('/api/risks', (req, res, ctx) => {
          return res(ctx.json([
            { id: 'risk-1', risk: 'Risk 1', riskCategory: 'Behavioral Risks' },
            { id: 'risk-2', risk: 'Risk 2', riskCategory: 'Behavioral Risks' },
            { id: 'risk-3', risk: 'Risk 3', riskCategory: 'Security Risks' }
          ]));
        })
      );
      
      render(<SimpleRiskMatrixView />);
      
      // Wait for risks to load
      await waitFor(() => {
        expect(screen.getByText('Risk 1')).toBeInTheDocument();
      });
      
      // Select first two risks
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // First risk checkbox
      fireEvent.click(checkboxes[2]); // Second risk checkbox
      
      // Delete button should appear
      const deleteButton = await screen.findByText(/Delete Selected \(2\)/);
      expect(deleteButton).toBeInTheDocument();
      
      // Click delete
      fireEvent.click(deleteButton);
      
      // Confirm deletion
      const confirmButton = await screen.findByText('Delete 2 Risks');
      fireEvent.click(confirmButton);
      
      // Verify API calls
      await waitFor(() => {
        expect(screen.queryByText('Risk 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Risk 2')).not.toBeInTheDocument();
        expect(screen.getByText('Risk 3')).toBeInTheDocument();
      });
    });
  });
  
  describe('Inline Editing', () => {
    it('should edit risk fields and save changes', async () => {
      server.use(
        rest.get('/api/risks', (req, res, ctx) => {
          return res(ctx.json([{
            id: 'risk-1',
            risk: 'Original Name',
            riskDescription: 'Original Description',
            riskCategory: 'Behavioral Risks',
            initialScoring: { likelihood: 3, impact: 3 },
            residualScoring: { likelihood: 2, impact: 2 }
          }]));
        })
      );
      
      render(<SimpleRiskMatrixView />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Original Name')).toBeInTheDocument();
      });
      
      // Edit risk name
      const riskNameInput = screen.getByDisplayValue('Original Name');
      fireEvent.change(riskNameInput, { target: { value: 'Updated Name' } });
      
      // Apply changes button should appear
      const applyButton = await screen.findByText(/Apply Changes/);
      fireEvent.click(applyButton);
      
      // Verify update was called
      await waitFor(() => {
        expect(screen.getByDisplayValue('Updated Name')).toBeInTheDocument();
      });
    });
  });
});
```

### 4. E2E Tests with Real Google Drive

#### Full CRUD Flow Test
```javascript
// __tests__/e2e/crud-flow.e2e.js
const { test, expect } = require('@playwright/test');
const { backupExcelFile, restoreFromBackup, cleanupTestData } = require('../utils/drive-backup');

test.describe('CRUD E2E Tests', () => {
  let backupId;
  
  test.beforeAll(async () => {
    backupId = await backupExcelFile();
  });
  
  test.afterAll(async () => {
    await restoreFromBackup(backupId);
  });
  
  test.afterEach(async () => {
    await cleanupTestData();
  });
  
  test('Complete CRUD flow', async ({ page }) => {
    // Navigate to Risk Matrix
    await page.goto('http://localhost:3000/matrix');
    
    // Wait for risks to load
    await page.waitForSelector('text=Risk Matrix');
    
    // 1. CREATE - Add new risk
    await page.click('text=Add Risk');
    
    // Fill form
    await page.selectOption('select[name="category"]', 'Behavioral Risks');
    await page.fill('input[name="name"]', '[E2E TEST] New Risk');
    await page.fill('textarea[name="description"]', '[E2E TEST] Risk created by E2E test');
    await page.fill('textarea[name="agreedMitigation"]', '[E2E TEST] Test mitigation');
    
    // Save
    await page.click('text=Add Risk');
    await page.waitForSelector('text=Risk added successfully!');
    
    // Verify risk appears in table
    await expect(page.locator('text=[E2E TEST] New Risk')).toBeVisible();
    
    // 2. UPDATE - Edit the risk
    const riskRow = page.locator('tr', { hasText: '[E2E TEST] New Risk' });
    const descriptionCell = riskRow.locator('textarea[value*="E2E TEST"]');
    
    await descriptionCell.fill('[E2E TEST] Updated risk description');
    await page.click('text=Apply Changes');
    await page.waitForSelector('text=Changes applied successfully!');
    
    // Verify update persisted
    await page.reload();
    await expect(page.locator('text=[E2E TEST] Updated risk description')).toBeVisible();
    
    // 3. DELETE - Remove the risk
    const checkbox = riskRow.locator('input[type="checkbox"]');
    await checkbox.check();
    
    await page.click('text=Delete Selected');
    await page.click('text=Delete 1 Risk');
    
    await page.waitForSelector('text=Successfully deleted 1 risk');
    
    // Verify deletion
    await expect(page.locator('text=[E2E TEST] New Risk')).not.toBeVisible();
    
    // 4. Verify in Google Drive
    const { downloadFile } = require('../../server/services/googleDriveService');
    const excelBuffer = await downloadFile(process.env.GOOGLE_DRIVE_FILE_ID);
    const { parseRiskMatrixData } = require('../../server/utils/excelParser');
    const data = parseRiskMatrixData(excelBuffer);
    
    const testRisk = data.risks.find(r => r.risk.includes('[E2E TEST]'));
    expect(testRisk).toBeUndefined();
  });
});
```

## Test Utilities

### Mock Service Worker Setup
```javascript
// __tests__/mocks/handlers.js
import { rest } from 'msw';

export const handlers = [
  // GET /api/risks
  rest.get('/api/risks', (req, res, ctx) => {
    return res(ctx.json([]));
  }),
  
  // POST /api/risks
  rest.post('/api/risks', (req, res, ctx) => {
    const risk = req.body;
    return res(ctx.json({
      id: 'test-' + Date.now(),
      ...risk
    }));
  }),
  
  // PUT /api/risks/:id
  rest.put('/api/risks/:id', (req, res, ctx) => {
    const { id } = req.params;
    const updates = req.body;
    return res(ctx.json({
      id,
      ...updates
    }));
  }),
  
  // DELETE /api/risks/:id
  rest.delete('/api/risks/:id', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  })
];
```

### Google Drive Test Utilities
```javascript
// __tests__/utils/drive-backup.js
const { google } = require('googleapis');
const fs = require('fs').promises;

class DriveTestUtils {
  constructor() {
    this.auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });
    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }
  
  async backupFile(fileId) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const response = await this.drive.files.copy({
      fileId: fileId,
      requestBody: {
        name: `backup-${timestamp}-test.xlsx`
      }
    });
    return response.data.id;
  }
  
  async restoreFile(originalId, backupId) {
    // Download backup
    const response = await this.drive.files.get({
      fileId: backupId,
      alt: 'media'
    }, { responseType: 'arraybuffer' });
    
    // Update original
    await this.drive.files.update({
      fileId: originalId,
      media: {
        body: Buffer.from(response.data)
      }
    });
    
    // Delete backup
    await this.drive.files.delete({
      fileId: backupId
    });
  }
}

module.exports = new DriveTestUtils();
```

## Running the Tests

### Setup
```bash
# Install test dependencies
npm install --save-dev jest supertest @testing-library/react @testing-library/react-hooks
npm install --save-dev msw @playwright/test

# Create test environment file
cp .env .env.test
echo "GOOGLE_DRIVE_FILE_ID=your-test-file-id" >> .env.test
```

### Commands
```bash
# Run all tests
npm test

# Run backend tests only
npm test -- __tests__/backend

# Run frontend tests only  
npm test -- __tests__/store __tests__/views

# Run E2E tests
npm run test:e2e

# Run with coverage
npm test -- --coverage
```

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: CRUD Tests

on:
  pull_request:
    paths:
      - 'src/**'
      - 'server/**'
      - '__tests__/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Setup test credentials
      run: |
        echo "${{ secrets.GOOGLE_SERVICE_ACCOUNT_KEY }}" > service-account-key.json
        echo "GOOGLE_DRIVE_FILE_ID=${{ secrets.TEST_FILE_ID }}" >> .env.test
        
    - name: Run unit tests
      run: npm test -- --testPathIgnorePatterns=e2e
      
    - name: Run E2E tests
      run: npm run test:e2e
      
    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

## Best Practices

1. **Always use test prefixes** - Mark test data with `[TEST]` or `TEST-` prefix
2. **Backup before tests** - Create backup before any test that modifies Google Drive
3. **Clean up after tests** - Remove all test data even if tests fail
4. **Use transactions** - Group related operations to minimize API calls
5. **Mock when possible** - Only use real Google Drive for E2E tests
6. **Test edge cases** - Include tests for errors, timeouts, and conflicts

## Troubleshooting

### Common Issues

1. **Backup fails**
   - Check service account permissions
   - Verify file ID is correct
   - Ensure quota not exceeded

2. **Cleanup incomplete**
   - Manually run cleanup script
   - Check for test data patterns
   - Restore from backup if needed

3. **Tests timeout**
   - Increase jest timeout: `jest.setTimeout(30000)`
   - Check network connectivity
   - Verify Google Drive API status

### Manual Cleanup Script
```bash
node scripts/cleanup-test-data.js
```

## Success Metrics

- All CRUD operations tested end-to-end
- 80%+ code coverage for CRUD paths
- Tests run in < 5 minutes
- Zero test data pollution in production
- Automated backup/restore working reliably