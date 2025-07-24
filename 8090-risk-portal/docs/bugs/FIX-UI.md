# Frontend API Integration Fix Plan

## Executive Summary

The frontend has partial API integration with the backend. While Add functionality works for both risks and controls, Edit functionality only exists for controls, and Delete functionality is completely missing. Additionally, there are API response format mismatches and inadequate error handling throughout.

## Current State Analysis

### ✅ What's Working

1. **Add Risk Button** (SimpleRiskMatrixView)
   - Creates new risks via `POST /api/risks`
   - Basic form validation
   - Shows success/failure alerts

2. **Add Control Button** (SimpleRiskMatrixView)
   - Creates new controls via `POST /api/controls`
   - Generates control IDs automatically
   - Shows success/failure alerts

3. **Edit Control Button** (ControlDetailView)
   - Opens EditControlModal
   - Updates via `PUT /api/controls/:id`
   - Has proper form UI

### ⚠️ What's Partially Working

1. **API Response Handling**
   - Frontend expects: `response.data` to be the resource
   - Backend returns: `{ success: true, data: resource }`
   - This mismatch causes potential issues

2. **Error Handling**
   - Generic alerts: "Failed to add risk/control"
   - No display of specific validation errors
   - No user-friendly error messages

### ❌ What's Missing

1. **Edit Risk Functionality**
   - No edit buttons on risk rows
   - No EditRiskModal component
   - No way to update existing risks

2. **Delete Functionality**
   - No delete buttons for risks
   - No delete buttons for controls
   - No confirmation dialogs

3. **Detailed Error Messages**
   - API returns detailed error objects
   - Frontend doesn't display them
   - Users don't know why operations fail

## Problem Analysis

### 1. API Response Format Mismatch

**Backend Response Format:**
```json
{
  "success": true,
  "data": {
    "id": "RISK-EXAMPLE",
    "risk": "Example Risk",
    ...
  },
  "meta": {
    "timestamp": "2025-01-22T10:00:00Z"
  }
}
```

**Frontend Expectation:**
```javascript
const response = await axios.post('/api/risks', riskInput);
const newRisk = response.data; // ❌ This is the wrapper, not the risk!
```

### 2. Missing Risk Edit UI

The SimpleRiskMatrixView has inline editing for some fields but no proper edit modal:
- No comprehensive edit form
- No way to edit all risk fields
- No validation on inline edits

### 3. Inadequate Error Handling

**Current Pattern:**
```javascript
try {
  await createRisk(riskInput);
  alert('Risk added successfully!');
} catch {
  alert('Failed to add risk. Please check all required fields.');
}
```

**Problems:**
- Swallows actual error information
- Doesn't show validation errors
- Poor user experience

### 4. No Delete Functionality

- Delete APIs exist: `DELETE /api/risks/:id` and `DELETE /api/controls/:id`
- Store methods exist: `deleteRisk` and `deleteControl`
- But no UI buttons or confirmation dialogs

## Implementation Plan

### Phase 1: Fix Store API Response Handling (Critical)

#### 1.1 Update riskStore.ts

```typescript
// Fix createRisk
createRisk: async (riskInput) => {
  set({ isLoading: true, error: null });
  
  try {
    const response = await axios.post('/api/risks', riskInput);
    const newRisk: Risk = response.data.data; // ✅ Access nested data
    
    // ... rest of the logic
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      const apiError = error.response.data.error;
      set({ 
        error: new Error(apiError.message || 'Failed to create risk'),
        isLoading: false 
      });
      // Throw with details for UI to handle
      throw new Error(apiError.suggestion || apiError.message);
    }
    // ... handle other errors
  }
}

// Fix updateRisk similarly
updateRisk: async (riskId, updates) => {
  // ... similar pattern
  const response = await axios.put(`/api/risks/${riskId}`, updates);
  const updatedRisk: Risk = response.data.data; // ✅ Access nested data
}
```

#### 1.2 Update controlStore.ts

Apply the same pattern for `createControl` and `updateControl`.

### Phase 2: Add Risk Edit Functionality

#### 2.1 Create EditRiskModal Component

```typescript
// src/components/risks/EditRiskModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import type { Risk, RiskCategory } from '../../types';

interface EditRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  risk: Risk;
  onSave: (riskId: string, updates: Partial<Risk>) => Promise<void>;
}

export const EditRiskModal: React.FC<EditRiskModalProps> = ({
  isOpen,
  onClose,
  risk,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<Risk>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && risk) {
      setFormData({
        risk: risk.risk,
        riskCategory: risk.riskCategory,
        riskDescription: risk.riskDescription,
        initialScoring: { ...risk.initialScoring },
        residualScoring: { ...risk.residualScoring },
        agreedMitigation: risk.agreedMitigation,
        proposedOversightOwnership: [...risk.proposedOversightOwnership],
        proposedSupport: [...risk.proposedSupport],
        notes: risk.notes
      });
      setError(null);
    }
  }, [isOpen, risk]);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onSave(risk.id, formData);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save risk');
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of the component with form fields
};
```

#### 2.2 Add Edit Buttons to Risk Rows

In SimpleRiskMatrixView, add edit buttons to each risk row and handle the modal state.

### Phase 3: Improve Error Handling

#### 3.1 Create Toast Notification System

```typescript
// src/components/ui/Toast.tsx
export const Toast = ({ message, type, onClose }) => {
  // Implementation for toast notifications
};

// src/hooks/useToast.ts
export const useToast = () => {
  // Hook for managing toast notifications
};
```

#### 3.2 Update Error Handling in Views

```typescript
const handleAddRisk = async () => {
  try {
    // ... existing logic
    await createRisk(riskInput);
    showToast('Risk added successfully!', 'success');
    setShowAddRiskModal(false);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add risk';
    showToast(message, 'error');
    // Don't close modal on error - let user fix issues
  }
};
```

### Phase 4: Add Delete Functionality

#### 4.1 Add Delete Buttons

```typescript
// In risk/control row actions
<Button
  size="sm"
  variant="ghost"
  onClick={() => handleDelete(risk.id)}
  className="text-red-600 hover:text-red-700"
>
  <Trash2 className="h-4 w-4" />
</Button>
```

#### 4.2 Add Confirmation Dialog

```typescript
const handleDelete = async (id: string) => {
  if (confirm('Are you sure you want to delete this risk? This action cannot be undone.')) {
    try {
      await deleteRisk(id);
      showToast('Risk deleted successfully', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }
};
```

### Phase 5: Testing Checklist

#### API Integration Tests

- [ ] **Create Risk**
  - [ ] Valid data creates risk successfully
  - [ ] Invalid data shows validation errors
  - [ ] Duplicate risk name shows specific error
  - [ ] Network error handled gracefully

- [ ] **Update Risk**
  - [ ] All fields can be edited
  - [ ] Validation errors display properly
  - [ ] Optimistic updates work correctly
  - [ ] Concurrent edit conflicts handled

- [ ] **Delete Risk**
  - [ ] Confirmation dialog appears
  - [ ] Successful deletion updates UI
  - [ ] Related controls updated
  - [ ] Error on delete shows message

- [ ] **Create Control**
  - [ ] ID generated correctly
  - [ ] All fields saved properly
  - [ ] Validation works

- [ ] **Update Control**
  - [ ] All fields editable
  - [ ] Compliance fields update
  - [ ] Related risks maintained

- [ ] **Delete Control**
  - [ ] Confirmation required
  - [ ] UI updates after delete
  - [ ] Related risks updated

#### Error Scenarios

- [ ] Network timeout shows appropriate message
- [ ] 401 unauthorized redirects to login
- [ ] 403 forbidden shows permission error
- [ ] 422 validation errors display field-specific messages
- [ ] 500 server error shows generic message with retry

## Code Examples

### Proper API Response Handling

```typescript
// In store
try {
  const response = await axios.post('/api/risks', riskInput);
  
  // Handle the actual API response format
  if (response.data.success && response.data.data) {
    const newRisk: Risk = response.data.data;
    // Process the risk...
  } else {
    throw new Error('Invalid response format');
  }
} catch (error) {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data?.error;
    if (apiError) {
      // Use the detailed error information
      console.error('API Error:', apiError.code, apiError.message);
      throw new Error(apiError.suggestion || apiError.message);
    }
  }
  throw error;
}
```

### Validation Error Display

```typescript
// In modal component
{error && (
  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
    <div className="flex">
      <AlertCircle className="h-5 w-5 text-red-400" />
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">
          Error saving risk
        </h3>
        <p className="mt-1 text-sm text-red-700">{error}</p>
      </div>
    </div>
  </div>
)}
```

## Migration Steps

1. **Backup Current Code**
   - Create feature branch
   - Document current behavior

2. **Update Stores First**
   - Fix API response handling
   - Add proper error propagation
   - Test with Postman/curl

3. **Add Missing UI Components**
   - Create EditRiskModal
   - Add delete buttons
   - Implement confirmations

4. **Improve Error UX**
   - Replace alerts with toasts
   - Show field-specific errors
   - Add loading states

5. **Test Everything**
   - Manual testing checklist
   - Error scenario testing
   - Cross-browser testing

## Success Criteria

1. All CRUD operations work for both risks and controls
2. Users see specific error messages when operations fail
3. Validation errors highlight specific fields
4. Delete operations require confirmation
5. Loading states prevent duplicate submissions
6. API format mismatches are handled gracefully
7. Network errors don't crash the application

## Timeline Estimate

- Phase 1 (Fix Stores): 2-3 hours
- Phase 2 (Risk Edit): 3-4 hours  
- Phase 3 (Error Handling): 2-3 hours
- Phase 4 (Delete): 2 hours
- Phase 5 (Testing): 2-3 hours

**Total: 11-15 hours**

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing functionality | High | Comprehensive testing, feature flags |
| API contract changes | Medium | Version API endpoints |
| State management complexity | Medium | Use existing store patterns |
| Performance degradation | Low | Implement optimistic updates |

## Next Steps

1. Review this plan with the team
2. Create feature branch
3. Implement Phase 1 (most critical)
4. Test thoroughly before moving to next phase
5. Deploy behind feature flag if needed