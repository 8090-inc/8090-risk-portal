# OpenAPI Specification Update Summary

## Endpoints Added

### 1. Authentication
✅ **Added** `GET /api/auth/me` - Get current user information
- Added Authentication tag to the tags section
- Documented the IAP-based authentication response

### 2. Risk Management  
✅ **Added** `PATCH /api/v1/risks/{id}` - Partial update for risks
- Added between PUT and DELETE operations
- Includes examples for common update scenarios

### 3. Control Management
✅ **Already existed** `PATCH /api/v1/controls/{id}` - Was already documented
✅ **Added** `POST /api/v1/controls/cleanup-duplicates` - Remove duplicate controls
- Added after effectiveness-report endpoint
- Documented the duplicate detection and cleanup logic

### 4. Use Case Management
✅ **Already existed** All CRUD operations were already documented:
- GET /api/v1/usecases
- POST /api/v1/usecases  
- GET /api/v1/usecases/{id}
- PUT /api/v1/usecases/{id}
- DELETE /api/v1/usecases/{id}
- GET /api/v1/usecases/{id}/risks
- PUT /api/v1/usecases/{id}/risks

### 5. Relationship Management
✅ **Already existed** All relationship endpoints were already documented:
- Risk perspective: /risks/{riskId}/controls/*
- Control perspective: /controls/{controlId}/risks/*
- Analysis endpoints: /relationships/*

## Summary
The OpenAPI specification has been updated to include:
1. The authentication endpoint that was missing
2. PATCH endpoint for risks (controls already had it)
3. The cleanup-duplicates maintenance endpoint for controls

All other endpoints that exist in the implementation were already properly documented in the OpenAPI spec. The specification now accurately reflects the actual API implementation without adding any non-existent endpoints.