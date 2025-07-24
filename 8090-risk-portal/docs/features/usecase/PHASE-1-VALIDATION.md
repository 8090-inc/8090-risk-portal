# Phase 1 Validation Plan - Use Cases Backend

## Overview
This document provides a step-by-step plan to validate that the Use Cases backend implementation is working correctly before proceeding to Phase 2.

## Prerequisites
1. Ensure the server is running: `npm run dev`
2. Have access to the Google Drive Excel file
3. Have a tool for API testing (curl, Postman, or similar)

## 1. Manual API Testing

### 1.1 Test Authentication
```bash
# First, ensure you're authenticated by accessing any protected endpoint
curl -X GET http://localhost:8080/api/v1/risks \
  -H "Cookie: [your-auth-cookie]"
```

### 1.2 Test Use Cases Endpoints

#### Create a Test Use Case
```bash
curl -X POST http://localhost:8080/api/v1/usecases \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-auth-cookie]" \
  -d '{
    "title": "TEST - AI Customer Service Assistant",
    "description": "Implement AI-powered customer service chatbot",
    "businessArea": "Commercial",
    "aiCategories": ["Natural Language Processing", "Machine Learning"],
    "objective": {
      "currentState": "Manual customer service with long wait times",
      "futureState": "24/7 AI-powered instant responses",
      "solution": "Deploy conversational AI platform",
      "benefits": "Reduce response time by 90%, improve customer satisfaction"
    },
    "impact": {
      "impactPoints": ["Faster response times", "24/7 availability", "Cost reduction"],
      "costSaving": 500000,
      "effortMonths": 6
    },
    "execution": {
      "functionsImpacted": ["Customer Service", "IT"],
      "dataRequirements": "Historical customer interactions, FAQs",
      "aiComplexity": "Medium",
      "feasibility": "High",
      "value": "High",
      "risk": "Low"
    },
    "status": "Under Review",
    "owner": "Test User",
    "stakeholders": ["Customer Service Manager", "IT Director"],
    "notes": "This is a test use case for validation"
  }'
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "id": "UC-001",
    "title": "TEST - AI Customer Service Assistant",
    // ... rest of the use case data
  },
  "message": "Use case created successfully"
}
```

#### List All Use Cases
```bash
curl -X GET http://localhost:8080/api/v1/usecases \
  -H "Cookie: [your-auth-cookie]"
```

#### Get Single Use Case
```bash
curl -X GET http://localhost:8080/api/v1/usecases/UC-001 \
  -H "Cookie: [your-auth-cookie]"
```

#### Test Filtering
```bash
# Filter by business area
curl -X GET "http://localhost:8080/api/v1/usecases?businessArea=Commercial" \
  -H "Cookie: [your-auth-cookie]"

# Filter by AI category
curl -X GET "http://localhost:8080/api/v1/usecases?aiCategory=Machine%20Learning" \
  -H "Cookie: [your-auth-cookie]"

# Filter by status
curl -X GET "http://localhost:8080/api/v1/usecases?status=Under%20Review" \
  -H "Cookie: [your-auth-cookie]"

# Search
curl -X GET "http://localhost:8080/api/v1/usecases?search=customer" \
  -H "Cookie: [your-auth-cookie]"
```

#### Get Statistics
```bash
curl -X GET http://localhost:8080/api/v1/usecases/statistics \
  -H "Cookie: [your-auth-cookie]"
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "total": 1,
    "byStatus": {
      "Under Review": 1
    },
    "byBusinessArea": {
      "Commercial": 1
    },
    "byAiCategory": {
      "Natural Language Processing": 1,
      "Machine Learning": 1
    },
    "totalCostSaving": 500000,
    "averageEffortMonths": 6
  }
}
```

#### Update Use Case
```bash
curl -X PUT http://localhost:8080/api/v1/usecases/UC-001 \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-auth-cookie]" \
  -d '{
    "status": "Approved",
    "implementationStart": "2024-02-01",
    "implementationEnd": "2024-08-01"
  }'
```

#### Associate Risks
```bash
# First, get available risks
curl -X GET http://localhost:8080/api/v1/risks \
  -H "Cookie: [your-auth-cookie]"

# Then associate some risks with the use case
curl -X PUT http://localhost:8080/api/v1/usecases/UC-001/risks \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-auth-cookie]" \
  -d '{
    "riskIds": ["AIR-001", "AIR-002", "AIR-003"]
  }'
```

#### Get Risks for Use Case
```bash
curl -X GET http://localhost:8080/api/v1/usecases/UC-001/risks \
  -H "Cookie: [your-auth-cookie]"
```

## 2. Excel File Validation

### 2.1 Check Excel Structure
1. Open the Google Drive Excel file
2. Verify a "Use Cases" sheet has been created (if you created a use case)
3. Check that all 26 columns are present with correct headers
4. Verify the test use case data is correctly populated

### 2.2 Check Relationships Sheet
1. Navigate to the "Relationships" sheet
2. Look for entries with:
   - Control ID = UC-001
   - Risk ID = AIR-XXX
   - Link Type = UseCase-Risk

## 3. Unit Test Execution

Run the Excel parser tests:
```bash
cd 8090-risk-portal
npm test -- server/tests/utils/excelParser.usecase.test.js
```

Expected: All tests should pass

## 4. Integration Testing

### 4.1 Transaction Testing
Test that batch operations work correctly:

```bash
# Start a batch risk association
curl -X PUT http://localhost:8080/api/v1/usecases/UC-001/risks \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-auth-cookie]" \
  -d '{
    "riskIds": ["AIR-001", "AIR-005", "AIR-010", "AIR-015", "AIR-020"]
  }'
```

Check that all relationships were created atomically.

### 4.2 Error Handling Testing

#### Test Invalid Use Case ID Format
```bash
curl -X GET http://localhost:8080/api/v1/usecases/INVALID-ID \
  -H "Cookie: [your-auth-cookie]"
```

Expected: 400 error with validation message

#### Test Non-existent Use Case
```bash
curl -X GET http://localhost:8080/api/v1/usecases/UC-999 \
  -H "Cookie: [your-auth-cookie]"
```

Expected: 404 error with USE_CASE_NOT_FOUND

#### Test Duplicate ID
```bash
curl -X POST http://localhost:8080/api/v1/usecases \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-auth-cookie]" \
  -d '{
    "id": "UC-001",
    "title": "Duplicate Test",
    "status": "Concept"
  }'
```

Expected: 422 error with DUPLICATE_USE_CASE_ID

## 5. Performance Testing

### 5.1 Response Time Check
All API endpoints should respond in under 1500ms:
```bash
time curl -X GET http://localhost:8080/api/v1/usecases \
  -H "Cookie: [your-auth-cookie]"
```

### 5.2 Concurrent Operations
Create multiple use cases concurrently to test handling:
```bash
for i in {1..5}; do
  curl -X POST http://localhost:8080/api/v1/usecases \
    -H "Content-Type: application/json" \
    -H "Cookie: [your-auth-cookie]" \
    -d "{
      \"title\": \"Concurrent Test $i\",
      \"status\": \"Concept\"
    }" &
done
wait
```

## 6. Cleanup

### 6.1 Delete Test Data
```bash
# Delete the test use case
curl -X DELETE http://localhost:8080/api/v1/usecases/UC-001 \
  -H "Cookie: [your-auth-cookie]"

# Delete any other test use cases created
# List all to find test cases
curl -X GET "http://localhost:8080/api/v1/usecases?search=TEST" \
  -H "Cookie: [your-auth-cookie]"
```

### 6.2 Verify Cleanup
1. Check that use cases are removed from Excel
2. Check that relationships are cleaned up
3. Verify no test data remains

## Validation Checklist

- [ ] Authentication works correctly
- [ ] All CRUD operations function properly
- [ ] Filtering and search work as expected
- [ ] Statistics are calculated correctly
- [ ] Risk associations create proper relationships
- [ ] Excel file is updated correctly
- [ ] Error handling returns appropriate codes
- [ ] Transaction support works for batch operations
- [ ] Performance meets requirements (<1500ms)
- [ ] Concurrent operations are handled safely
- [ ] Test data can be cleaned up completely

## Success Criteria

Phase 1 is considered validated if:
1. All API endpoints respond correctly
2. Data persists to Excel file properly
3. Relationships are managed correctly
4. Error handling works as designed
5. No data corruption occurs
6. Performance is acceptable

## Next Steps

Once validation is complete:
1. Document any issues found
2. Fix any critical bugs
3. Proceed to Phase 2 (Frontend Implementation)

---

**Document Version**: 1.0  
**Created**: 2025-07-23  
**Status**: Ready for Validation