# Use Cases Feature - Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for the Use Cases feature, covering unit tests, integration tests, end-to-end tests, and performance testing.

## Testing Principles

1. **Test Safety**: Never use production data for testing
2. **Data Cleanup**: Always clean up test data after tests
3. **Isolation**: Tests should not depend on each other
4. **Coverage**: Aim for minimum 80% code coverage
5. **Performance**: Tests should complete within reasonable time

## Test Data Management

### Test Data Identification
All test data must be clearly identifiable:
- Use Case IDs: Start with `UC-9XX` (UC-900 to UC-999)
- Titles: Include "TEST" in the title
- Created By: Use test user emails (test.user@example.com)

### Test File Setup
```javascript
// test-setup.js
const TEST_FILE_ID = process.env.TEST_GOOGLE_DRIVE_FILE_ID;
const BACKUP_FILE_ID = process.env.BACKUP_GOOGLE_DRIVE_FILE_ID;

beforeAll(async () => {
  // Create backup of test file
  await createBackup(TEST_FILE_ID, BACKUP_FILE_ID);
});

afterAll(async () => {
  // Clean up test data
  await cleanupTestUseCases();
  
  // Verify cleanup
  const remaining = await findTestData();
  if (remaining.length > 0) {
    console.error('Test data cleanup failed');
    await restoreFromBackup(BACKUP_FILE_ID, TEST_FILE_ID);
  }
});
```

## Unit Tests

### 1. Excel Parser Tests
**File**: `server/tests/utils/excelParser.usecase.test.js`

```javascript
describe('Use Case Excel Parser', () => {
  describe('parseUseCases', () => {
    it('should parse valid use cases from Excel');
    it('should skip rows without valid UC-XXX ID');
    it('should handle empty use cases sheet');
    it('should parse multi-value fields correctly');
    it('should handle missing optional fields');
  });
  
  describe('addUseCaseToWorkbook', () => {
    it('should add use case to existing sheet');
    it('should create sheet if not exists');
    it('should generate next sequential ID');
    it('should handle special characters in text');
    it('should prevent CSV injection');
  });
  
  describe('validateUseCaseId', () => {
    it('should accept valid UC-XXX format');
    it('should reject invalid formats');
    it('should handle boundary cases (UC-001, UC-999)');
  });
});
```

### 2. Service Layer Tests
**File**: `server/tests/services/UseCaseService.test.js`

```javascript
describe('UseCaseService', () => {
  let service;
  let mockPersistence;
  
  beforeEach(() => {
    mockPersistence = createMockPersistence();
    service = new UseCaseService(mockPersistence);
  });
  
  describe('getAllUseCases', () => {
    it('should return all use cases');
    it('should filter by business area');
    it('should filter by AI category');
    it('should filter by status');
    it('should handle multiple filters');
    it('should include risk count');
  });
  
  describe('createUseCase', () => {
    it('should create use case with valid data');
    it('should reject duplicate titles');
    it('should validate required fields');
    it('should add metadata automatically');
    it('should handle concurrent creates');
  });
  
  describe('updateUseCaseRisks', () => {
    it('should update risk associations');
    it('should validate risk IDs exist');
    it('should handle empty risk array');
    it('should maintain relationship integrity');
  });
});
```

### 3. Validation Middleware Tests
**File**: `server/tests/middleware/validateUseCase.test.js`

```javascript
describe('Use Case Validation', () => {
  describe('Text Field Validation', () => {
    it('should sanitize HTML tags');
    it('should prevent XSS attempts');
    it('should enforce length limits');
    it('should handle Unicode characters');
  });
  
  describe('Numeric Field Validation', () => {
    it('should accept valid numbers');
    it('should reject negative costs');
    it('should enforce reasonable limits');
    it('should handle decimal values');
  });
  
  describe('Category Validation', () => {
    it('should accept valid AI categories');
    it('should reject invalid categories');
    it('should handle multiple categories');
  });
});
```

### 4. Frontend Component Tests
**File**: `src/components/usecases/__tests__/UseCaseCard.test.tsx`

```typescript
describe('UseCaseCard', () => {
  it('should render use case information');
  it('should display risk count');
  it('should format currency correctly');
  it('should handle missing optional fields');
  it('should navigate to detail on click');
  it('should show edit button for authorized users');
});
```

## Integration Tests

### 1. API Integration Tests
**File**: `server/tests/integration/useCaseApi.test.js`

```javascript
describe('Use Case API Integration', () => {
  let authToken;
  const testUseCases = [];
  
  beforeAll(async () => {
    authToken = await getTestAuthToken();
  });
  
  afterAll(async () => {
    // Clean up all test use cases
    for (const id of testUseCases) {
      await deleteTestUseCase(id, authToken);
    }
  });
  
  describe('Full CRUD Flow', () => {
    it('should create, read, update, and delete use case', async () => {
      // Create
      const createRes = await request(app)
        .post('/api/v1/usecases')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testUseCaseData);
      
      expect(createRes.status).toBe(201);
      const useCaseId = createRes.body.data.id;
      testUseCases.push(useCaseId);
      
      // Read
      const getRes = await request(app)
        .get(`/api/v1/usecases/${useCaseId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(getRes.status).toBe(200);
      expect(getRes.body.data.id).toBe(useCaseId);
      
      // Update
      const updateRes = await request(app)
        .put(`/api/v1/usecases/${useCaseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'Inactive' });
      
      expect(updateRes.status).toBe(200);
      
      // Delete
      const deleteRes = await request(app)
        .delete(`/api/v1/usecases/${useCaseId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(deleteRes.status).toBe(204);
    });
  });
  
  describe('Risk Association Flow', () => {
    it('should associate and disassociate risks');
    it('should validate risk IDs');
    it('should update risk count');
  });
  
  describe('Authorization Tests', () => {
    it('should allow admin all operations');
    it('should allow manager read and update');
    it('should restrict viewer to read only');
    it('should return 403 for unauthorized');
  });
});
```

### 2. Google Drive Integration Tests
**File**: `server/tests/integration/googleDrive.test.js`

```javascript
describe('Google Drive Integration', () => {
  it('should read use cases from Excel');
  it('should write new use case to Excel');
  it('should update existing use case');
  it('should handle concurrent modifications');
  it('should recover from network errors');
});
```

## End-to-End Tests

### 1. Use Case Creation Flow
**File**: `tests/e2e/createUseCase.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Create Use Case E2E', () => {
  test('should create use case through UI', async ({ page }) => {
    // Login
    await page.goto('/');
    await loginAsAdmin(page);
    
    // Navigate to use cases
    await page.click('[data-testid="nav-usecases"]');
    await page.waitForSelector('[data-testid="usecases-grid"]');
    
    // Open create form
    await page.click('[data-testid="add-usecase-btn"]');
    
    // Fill form - Step 1: Basic Info
    await page.fill('[data-testid="usecase-title"]', 'E2E TEST - AI Assistant');
    await page.selectOption('[data-testid="business-area"]', 'Medical');
    await page.check('[data-testid="ai-category-content-generation"]');
    await page.click('[data-testid="next-step"]');
    
    // Step 2: Objective
    await page.fill('[data-testid="current-state"]', 'Manual process');
    await page.fill('[data-testid="future-state"]', 'Automated with AI');
    await page.fill('[data-testid="solution"]', 'Implement AI solution');
    await page.click('[data-testid="next-step"]');
    
    // Step 3: Impact
    await page.fill('[data-testid="impact-point-0"]', 'Reduce time by 50%');
    await page.fill('[data-testid="cost-saving"]', '100000');
    await page.fill('[data-testid="effort-months"]', '6');
    await page.click('[data-testid="next-step"]');
    
    // Step 4: Execution
    await page.fill('[data-testid="functions-impacted"]', 'Medical, IT');
    await page.check('[data-testid="feasibility-high"]');
    await page.check('[data-testid="value-high"]');
    await page.check('[data-testid="risk-medium"]');
    
    // Submit
    await page.click('[data-testid="submit-usecase"]');
    
    // Verify creation
    await expect(page.locator('text=Use case created successfully')).toBeVisible();
    await expect(page.locator('text=E2E TEST - AI Assistant')).toBeVisible();
    
    // Cleanup
    await cleanupE2ETestData(page);
  });
});
```

### 2. Risk Association Flow
**File**: `tests/e2e/associateRisks.spec.ts`

```typescript
test.describe('Risk Association E2E', () => {
  test('should associate risks with use case', async ({ page }) => {
    // Navigate to use case detail
    await page.goto('/usecases/UC-901'); // Test use case
    
    // Open risk selector
    await page.click('[data-testid="manage-risks-btn"]');
    
    // Select risks
    await page.check('[data-testid="risk-checkbox-AIR-001"]');
    await page.check('[data-testid="risk-checkbox-AIR-002"]');
    
    // Save associations
    await page.click('[data-testid="save-associations"]');
    
    // Verify
    await expect(page.locator('text=2 associated risks')).toBeVisible();
  });
});
```

### 3. Search and Filter Flow
**File**: `tests/e2e/searchFilter.spec.ts`

```typescript
test.describe('Search and Filter E2E', () => {
  test('should filter use cases', async ({ page }) => {
    await page.goto('/usecases');
    
    // Filter by business area
    await page.selectOption('[data-testid="filter-business-area"]', 'Medical');
    await expect(page.locator('[data-testid="usecase-card"]')).toHaveCount(5);
    
    // Filter by AI category
    await page.click('[data-testid="filter-ai-category"]');
    await page.check('text=Content Generation');
    await expect(page.locator('[data-testid="usecase-card"]')).toHaveCount(3);
    
    // Search
    await page.fill('[data-testid="search-input"]', 'inquiry');
    await expect(page.locator('[data-testid="usecase-card"]')).toHaveCount(1);
    
    // Clear filters
    await page.click('[data-testid="clear-filters"]');
    await expect(page.locator('[data-testid="usecase-card"]').first()).toBeVisible();
  });
});
```

## Performance Tests

### 1. Load Testing
**File**: `tests/performance/useCaseLoad.test.js`

```javascript
describe('Use Case Load Testing', () => {
  it('should handle 100 use cases efficiently', async () => {
    const start = Date.now();
    
    const response = await request(app)
      .get('/api/v1/usecases?limit=100')
      .set('Authorization', `Bearer ${authToken}`);
    
    const duration = Date.now() - start;
    
    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(1000); // Under 1 second
    expect(response.body.data).toHaveLength(100);
  });
  
  it('should filter large datasets quickly', async () => {
    const start = Date.now();
    
    const response = await request(app)
      .get('/api/v1/usecases?businessArea=Medical&aiCategory=Content Generation')
      .set('Authorization', `Bearer ${authToken}`);
    
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(500); // Under 500ms
  });
});
```

### 2. Concurrent Operations
**File**: `tests/performance/concurrent.test.js`

```javascript
describe('Concurrent Operations', () => {
  it('should handle concurrent creates', async () => {
    const promises = Array(10).fill(null).map((_, i) => 
      createTestUseCase(`Concurrent Test ${i}`)
    );
    
    const results = await Promise.all(promises);
    
    // All should succeed
    expect(results.every(r => r.status === 201)).toBe(true);
    
    // All should have unique IDs
    const ids = results.map(r => r.body.data.id);
    expect(new Set(ids).size).toBe(10);
  });
});
```

## Security Testing

### 1. XSS Prevention Tests
```javascript
describe('XSS Prevention', () => {
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    'javascript:alert("XSS")',
    '<iframe src="javascript:alert(\'XSS\')"></iframe>'
  ];
  
  xssPayloads.forEach(payload => {
    it(`should sanitize payload: ${payload}`, async () => {
      const response = await createUseCase({
        title: payload,
        description: payload
      });
      
      expect(response.body.data.title).not.toContain('<script>');
      expect(response.body.data.title).not.toContain('javascript:');
    });
  });
});
```

### 2. Authorization Tests
```javascript
describe('Authorization', () => {
  it('should prevent viewer from creating', async () => {
    const response = await request(app)
      .post('/api/v1/usecases')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send(testUseCaseData);
    
    expect(response.status).toBe(403);
  });
});
```

## Test Data Cleanup

### Cleanup Script
**File**: `scripts/cleanup-test-usecases.js`

```javascript
const cleanupTestUseCases = async () => {
  console.log('Starting test use case cleanup...');
  
  const drive = await getDriveService();
  const fileId = process.env.TEST_GOOGLE_DRIVE_FILE_ID;
  
  // Download Excel file
  const buffer = await downloadFile(drive, fileId);
  const workbook = XLSX.read(buffer);
  
  // Find test use cases
  const sheet = workbook.Sheets['Use Cases'];
  const range = XLSX.utils.decode_range(sheet['!ref']);
  const testRows = [];
  
  for (let row = 1; row <= range.e.r; row++) {
    const id = getCellValue(sheet, row, 0);
    const title = getCellValue(sheet, row, 1);
    
    if (id?.startsWith('UC-9') || title?.includes('TEST')) {
      testRows.push(row);
    }
  }
  
  // Remove test rows (in reverse order)
  testRows.reverse().forEach(row => {
    deleteRow(sheet, row);
  });
  
  // Upload cleaned file
  await uploadFile(drive, fileId, workbook);
  
  console.log(`Cleaned up ${testRows.length} test use cases`);
};
```

## Test Execution Plan

### Local Development
```bash
# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests
npm run test
```

### CI/CD Pipeline
```yaml
test:
  stage: test
  script:
    - npm run test:unit -- --coverage
    - npm run test:integration
    - npm run test:e2e -- --headed=false
  artifacts:
    reports:
      coverage: coverage/lcov.info
```

### Pre-deployment
```bash
# Full test suite with coverage
npm run test:full

# Security tests
npm run test:security

# Performance tests
npm run test:performance
```

## Test Metrics

### Coverage Goals
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

### Performance Targets
- Unit tests: < 5 seconds
- Integration tests: < 30 seconds
- E2E tests: < 2 minutes
- Full suite: < 5 minutes

### Quality Gates
- No failing tests
- Coverage meets targets
- No security vulnerabilities
- Performance within limits

---

**Document Version**: 1.0  
**Last Updated**: 2025-07-23  
**Author**: QA Team  
**Next Review**: After implementation