# Data Backend Refactoring Plan

## Executive Summary

**Critical Issue**: The current system has a data persistence bug where **user edits are silently lost**. Only CREATE operations persist to Excel, while UPDATE operations only modify local UI state.

**Solution**: Refactor to a simplified, reliable data architecture that ensures all user changes persist to Excel while providing better UX through optimistic updates and real-time synchronization.

---

## 🚨 Critical Problems with Current Architecture

### 1. **Data Loss Bug** (CRITICAL)
```typescript
// Current UPDATE - Data is LOST on refresh
updateRisk: async (riskUpdate) => {
  // ❌ Only updates Zustand store - NO API call
  // ❌ Changes disappear when cache clears
  // ❌ Users think edits are saved but they're not
}
```

**Impact**: Users lose their work without knowing it. This is a **data integrity failure**.

### 2. **Complex Multi-Layer Caching**
```
Google Drive Excel → Server Cache (5min) → Zustand Store → localStorage
```

**Problems**:
- Filter bugs (like we just debugged) due to stale cached data
- Data inconsistency between layers
- Manual "Clear Cache" buttons needed
- 70% of debugging time spent tracing data flow

### 3. **Poor User Experience**
- No real-time updates between users
- Manual refresh required to see latest data
- Filters break with cached data mismatches
- No feedback when operations fail

### 4. **Developer Experience Issues**
- 4 different storage mechanisms to debug
- Complex error handling across layers
- Manual cache invalidation logic
- Difficult to trace data flow issues

---

## 🎯 Proposed Solution: Simplified Excel-as-Database Architecture

### Core Principles

1. **Excel File = Single Source of Truth** (unchanged)
2. **Single Cache Layer** (server-side only)
3. **Smart Invalidation** (based on Excel modification time)
4. **React Query for Frontend** (replaces Zustand + localStorage)
5. **Optimistic Updates** (immediate UI feedback)
6. **Real-time Synchronization** (changes propagate immediately)

### Architecture Comparison

| Current (Complex) | Proposed (Simple) |
|------------------|------------------|
| 4 storage layers | 1 cache layer |
| Manual cache management | Automatic invalidation |
| Update bug (data loss) | All operations persist |
| Complex debugging | Single data flow |
| No real-time updates | Automatic synchronization |
| Filter consistency issues | Always consistent |

---

## 📐 Technical Design

### 1. **Unified Data Service** (Server)

```typescript
class ExcelDataService {
  constructor() {
    this.cache = new Map();
    this.lastModified = null;
    this.subscribers = new Set();
  }

  // Smart caching with modification detection
  async getData(type: 'risks' | 'controls') {
    const fileMetadata = await googleDrive.getFileMetadata(FILE_ID);
    
    // Only refresh if Excel file actually changed
    if (this.lastModified !== fileMetadata.modifiedTime) {
      console.log('Excel modified, refreshing cache');
      await this.refreshCache();
      this.lastModified = fileMetadata.modifiedTime;
      this.notifySubscribers('data-updated', { type });
    }
    
    return this.cache.get(type);
  }

  // Persist changes back to Excel
  async updateData(type: 'risks' | 'controls', id: string, updates: any) {
    // 1. Update Excel file
    await this.updateExcelFile(type, id, updates);
    
    // 2. Refresh cache
    await this.refreshCache();
    
    // 3. Notify all clients
    this.notifySubscribers('data-updated', { type, id, updates });
    
    return this.cache.get(type).find(item => item.id === id);
  }

  // Real-time change broadcasting
  notifySubscribers(event: string, data: any) {
    this.subscribers.forEach(callback => callback(event, data));
  }
}
```

### 2. **React Query Frontend** (Client)

```typescript
// Replace ALL Zustand stores with React Query hooks

// Reading data
export const useRisks = () => {
  return useQuery({
    queryKey: ['risks'],
    queryFn: () => api.get('/api/risks').then(r => r.data),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000 // Background refresh
  });
};

// Updating data with optimistic updates
export const useUpdateRisk = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (risk: UpdateRiskInput) => 
      api.put(`/api/risks/${risk.id}`, risk),
    
    // Immediate UI update (optimistic)
    onMutate: async (updatedRisk) => {
      await queryClient.cancelQueries(['risks']);
      const previousRisks = queryClient.getQueryData(['risks']);
      
      queryClient.setQueryData(['risks'], (old: Risk[]) =>
        old.map(r => r.id === updatedRisk.id ? {...r, ...updatedRisk} : r)
      );
      
      return { previousRisks };
    },
    
    // Rollback on error
    onError: (err, updatedRisk, context) => {
      queryClient.setQueryData(['risks'], context.previousRisks);
      toast.error('Failed to update risk: ' + err.message);
    },
    
    // Always refetch to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries(['risks']);
    }
  });
};
```

### 3. **API Endpoints** (Simplified)

```typescript
// Single data service instance
const dataService = new ExcelDataService();

// GET - Smart caching
app.get('/api/risks', async (req, res) => {
  const risks = await dataService.getData('risks');
  res.json(risks);
});

// PUT - Update existing (FIX THE BUG)
app.put('/api/risks/:id', async (req, res) => {
  const updatedRisk = await dataService.updateData('risks', req.params.id, req.body);
  res.json(updatedRisk);
});

// POST - Create new
app.post('/api/risks', async (req, res) => {
  const newRisk = await dataService.createData('risks', req.body);
  res.json(newRisk);
});

// Real-time updates via Server-Sent Events
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  dataService.subscribe(sendEvent);
  
  req.on('close', () => {
    dataService.unsubscribe(sendEvent);
  });
});
```

---

## 🔄 Migration Plan

### **Phase 1: Backend Foundation** (Day 1-2)
- [ ] Create `ExcelDataService` class
- [ ] Implement smart file modification detection
- [ ] Add proper UPDATE endpoints (fix the data loss bug)
- [ ] Add Server-Sent Events for real-time updates
- [ ] Test Excel persistence for all operations

### **Phase 2: Frontend Migration** (Day 3-4)
- [ ] Install React Query, remove Zustand dependencies
- [ ] Create React Query hooks (`useRisks`, `useControls`, etc.)
- [ ] Replace `useRiskStore` calls with `useRisks` hook
- [ ] Replace `useControlStore` calls with `useControls` hook
- [ ] Implement optimistic updates for mutations

### **Phase 3: Filter System** (Day 5)
- [ ] Replace filter localStorage with URL query params
- [ ] Remove `useFilters` hook localStorage persistence
- [ ] Implement filter state in URL for bookmarkability
- [ ] Test filter consistency across page refreshes

### **Phase 4: Real-time Features** (Day 6)
- [ ] Add Server-Sent Events client connection
- [ ] Implement automatic cache invalidation on changes
- [ ] Add conflict detection for concurrent edits
- [ ] Test multi-user scenarios

### **Phase 5: Cleanup & Testing** (Day 7)
- [ ] Remove all Zustand store files
- [ ] Remove localStorage persistence code
- [ ] Remove manual "Clear Cache" buttons
- [ ] Add comprehensive error boundaries
- [ ] Performance testing and optimization

---

## 🎁 Benefits After Refactoring

### **User Experience Improvements**
- ✅ **No Data Loss**: All edits persist to Excel immediately
- ✅ **Real-time Updates**: Changes appear across all browser tabs
- ✅ **Reliable Filters**: No more filter cache inconsistencies
- ✅ **Optimistic UI**: Immediate feedback on user actions
- ✅ **Better Error Handling**: Clear messages when operations fail

### **Developer Experience Improvements**
- ✅ **70% Less Code**: Single data flow vs. 4 storage layers
- ✅ **Easier Debugging**: One place to check for data issues
- ✅ **Consistent Patterns**: All CRUD operations work the same way
- ✅ **Automatic Caching**: No manual cache invalidation needed
- ✅ **Better Testing**: Easier to mock and test single data service

### **System Reliability Improvements**
- ✅ **Data Consistency**: Single source of truth maintained
- ✅ **Predictable Behavior**: Same patterns for all operations
- ✅ **Error Recovery**: Automatic rollback on failures
- ✅ **Conflict Detection**: Handle concurrent user edits gracefully

---

## ⚠️ Risk Mitigation

### **During Migration**
- Keep current Excel file as backup
- Deploy incrementally (backend first, then frontend)
- Add comprehensive logging for troubleshooting
- Implement feature flags for gradual rollout

### **Data Safety**
- Validate all Excel operations before committing
- Add data integrity checks after each update
- Implement rollback mechanism for failed operations
- Monitor for data corruption during migration

### **User Impact**
- Schedule migration during low-usage hours
- Communicate changes to users in advance
- Provide rollback plan if issues arise
- Monitor user feedback post-migration

---

## 📊 Success Metrics

### **Technical Metrics**
- **Bug Resolution**: Zero data loss incidents (currently happening)
- **Performance**: < 100ms API response times
- **Reliability**: 99.9% successful Excel persistence
- **Code Complexity**: 70% reduction in data-related code

### **User Metrics**
- **Filter Issues**: Zero filter cache problems (currently frequent)
- **Data Freshness**: < 30 seconds for updates to propagate
- **Error Rate**: < 1% failed operations with clear error messages
- **User Satisfaction**: No "lost work" complaints

---

## 🚀 Ready to Proceed?

This refactoring fixes the critical data loss bug while dramatically simplifying the architecture. The migration can be done incrementally with minimal user disruption.

**Next Step**: Approval to proceed with Phase 1 (Backend Foundation) to fix the data persistence bug.
