# Comprehensive Frontend API Issues Found

## 1. Fixed Issues ✅

### Response Format Mismatch
- **Issue**: Backend returns `{ success, data, meta }` but frontend expected raw arrays
- **Fix Applied**: Updated `riskStore.ts` and `controlStore.ts` to use `response.data.data`

### Pagination
- **Issue**: API returning only 20 items by default
- **Fix Applied**: Added `?limit=1000` to GET requests

### Missing Upload Endpoint
- **Issue**: Frontend called `/api/v1/upload/excel` but it didn't exist
- **Fix Applied**: Created upload endpoint in backend

### Authentication Format
- **Issue**: Frontend expected `authenticated` field but backend returned `success`
- **Fix Applied**: Updated `/api/auth/me` endpoint

### Missing Control Delete API Call
- **Issue**: `deleteControl` only updated local state, no API call
- **Fix Applied**: Added `axios.delete('/api/controls/${controlId}')` call

## 2. Critical Issues Still Present ❌

### 1. Risk-Control Relationship Management
**Problem**: Frontend stores `relatedControlIds` and `relatedRiskIds` but there's no way to update these relationships after creation.

**Current State**:
- When creating risks/controls, relationships are passed in the initial data
- No API calls to update relationships after creation
- Views like `SimpleRiskMatrixView` show relationship selectors but don't update them

**Required Fixes**:
- Add API calls to update risk-control relationships
- Implement `updateRiskControls` and `updateControlRisks` methods (already added to stores)
- Update UI components to call these methods when relationships change

### 2. Relationship Store Using Static Data
**Problem**: `relationshipStore.ts` loads data from static JSON file instead of API

**Current State**:
```typescript
import extractedData from '../data/extracted-excel-data.json';
```

**Required Fixes**:
- Create API endpoints for relationship analysis
- Update store to fetch from API instead of static file
- Implement proper CRUD operations for relationships

### 3. Reports View Using Static Data
**Problem**: `ReportsView` imports static data instead of using API data

**Current State**:
```typescript
import riskData from '../data/extracted-excel-data.json';
```

**Required Fixes**:
- Use data from `riskStore` and `controlStore` instead
- Or create a report generation API endpoint

### 4. Missing Relationship API Endpoints
**Problem**: No backend endpoints for managing relationships

**Current State**:
- `/api/risks/:id/controls` endpoint exists but not used by frontend
- `/api/controls/:id/risks` endpoint exists but not used by frontend

**Required Fixes**:
- Update frontend to use these endpoints when managing relationships
- Ensure endpoints support PUT requests to update relationships

## 3. Code Quality Issues ⚠️

### 1. Inconsistent API Client Usage
- Some components use `axios` (stores)
- Others use `fetch` (auth, upload)
- Should standardize on one approach

### 2. Error Handling Inconsistency
- Some places check `error.response.data`
- Others just use `error.message`
- Need consistent error extraction

### 3. Missing Loading States
- Some views don't show loading indicators during API calls
- User might think the app is frozen

## 4. Implementation Priority

### High Priority (Breaking Functionality):
1. Fix relationship management API calls
2. Update relationship store to use API
3. Fix reports view to use live data

### Medium Priority (User Experience):
1. Standardize API client usage
2. Improve error handling consistency
3. Add proper loading states

### Low Priority (Nice to Have):
1. Add optimistic updates for better UX
2. Implement proper caching strategy
3. Add retry logic for failed requests

## 5. Testing Recommendations

After fixing these issues, test:
1. Create a risk and add controls to it
2. Edit a risk and change its controls
3. Edit a control and change its associated risks
4. Delete a control and verify relationships are updated
5. Generate reports with live data
6. Test all error scenarios (network failure, validation errors)

## 6. Files That Need Updates

### Must Update:
- `src/views/SimpleRiskMatrixView.tsx` - Add relationship update calls
- `src/store/relationshipStore.ts` - Replace static data with API calls
- `src/views/ReportsView.tsx` - Use live data instead of static JSON
- `src/views/RiskDetailView.tsx` - Add ability to edit relationships
- `src/views/ControlDetailView.tsx` - Add ability to edit relationships

### Should Review:
- Any component showing risk-control relationships
- Any component allowing relationship editing
- Error handling in all API calls