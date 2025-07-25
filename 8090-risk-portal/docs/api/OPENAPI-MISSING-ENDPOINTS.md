# Missing Endpoints in OpenAPI Specification

## Summary
After comparing the implemented backend endpoints with the OpenAPI specification, the following endpoints exist in the code but are missing from the documentation:

### 1. Authentication Endpoint
- `GET /api/auth/me` - Get current authenticated user (implemented in server.cjs)

### 2. Partial Update Endpoints  
- `PATCH /api/v1/risks/{id}` - Partial update for risks
- `PATCH /api/v1/controls/{id}` - Partial update for controls

### 3. Control Maintenance
- `POST /api/v1/controls/cleanup-duplicates` - Remove duplicate controls

### 4. Use Case Management (CRUD operations)
- `POST /api/v1/usecases` - Create new use case
- `PUT /api/v1/usecases/{id}` - Update existing use case  
- `DELETE /api/v1/usecases/{id}` - Delete use case

### 5. Relationship Endpoints (Risk perspective)
The control-perspective relationships are documented, but the risk-perspective ones are missing:
- `POST /api/v1/relationships/risks/{riskId}` - Add control to risk
- `DELETE /api/v1/relationships/risks/{riskId}` - Remove control from risk
- `POST /api/v1/relationships/risks/bulk` - Bulk update risk relationships

## Implementation Details

All these endpoints are fully implemented and functional in the codebase:
- Auth endpoint is in `server.cjs`
- Other endpoints are in their respective route files under `server/api/v1/`
- They follow the same response format and error handling as documented endpoints

## Recommendation
These endpoints should be added to the OpenAPI specification to ensure complete API documentation. The spec should reflect the actual implementation without adding any non-existent endpoints.