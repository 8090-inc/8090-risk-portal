# Simplified Excel-as-Database Architecture

## Core Principles
- Excel file = Single source of truth
- One cache layer (server memory)
- React Query for frontend state
- Smart invalidation based on file modification time

## Data Flow

### 1. Server Layer (Simplified)
```javascript
class ExcelDataService {
  constructor() {
    this.cache = null;
    this.lastModified = null;
  }

  async getData() {
    const fileMetadata = await googleDrive.getFileMetadata(FILE_ID);
    
    // Check if Excel was modified
    if (this.lastModified !== fileMetadata.modifiedTime) {
      console.log('Excel file changed, refreshing cache');
      await this.refreshCache();
      this.lastModified = fileMetadata.modifiedTime;
    }
    
    return this.cache;
  }

  async refreshCache() {
    const buffer = await googleDrive.downloadFile(FILE_ID);
    this.cache = excelParser.parseData(buffer);
  }
}
```

### 2. Frontend Layer (React Query)
```typescript
// Replace all Zustand stores with React Query
export const useControls = () => {
  return useQuery({
    queryKey: ['controls'],
    queryFn: () => api.get('/api/controls'),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true
  });
};

export const useRisks = () => {
  return useQuery({
    queryKey: ['risks'], 
    queryFn: () => api.get('/api/risks'),
    staleTime: 2 * 60 * 1000
  });
};
```

### 3. API Endpoints (Simplified)
```javascript
// Single data service instance
const dataService = new ExcelDataService();

app.get('/api/controls', async (req, res) => {
  const data = await dataService.getData();
  res.json(data.controls);
});

app.get('/api/risks', async (req, res) => {
  const data = await dataService.getData();
  res.json(data.risks);
});

// Force refresh endpoint
app.post('/api/refresh', async (req, res) => {
  await dataService.refreshCache();
  res.json({ success: true });
});
```

## Benefits
1. **Predictable**: Excel → Server Cache → Frontend
2. **Fresh Data**: Automatic detection of Excel changes
3. **Simple State**: React Query handles everything
4. **Real-time**: Manual refresh button for immediate updates
5. **Reliable**: One cache layer, fewer points of failure

## Migration Steps
1. Remove Zustand stores and localStorage
2. Replace with React Query hooks
3. Simplify server caching logic
4. Add Excel modification time checking
5. Add manual refresh functionality
