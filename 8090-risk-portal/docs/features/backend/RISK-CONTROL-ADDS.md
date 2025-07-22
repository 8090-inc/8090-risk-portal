# Risk Matrix View Enhancement - Google Drive Integration

## Feature ID: FEATURE-006
## Date: 2025-07-21
## Status: MOSTLY IMPLEMENTED
## Priority: HIGH

## Overview

This feature enhances the Risk Matrix View with the ability to add/edit risks and controls, with all data persisted to a Google Drive-hosted Excel file as the single source of truth.

## Features to Implement

### 1. Add Risk with Controls Selection
- Modify the existing "Add Risk" modal in RiskMatrixView to include a multi-select dropdown for controls
- Add a new field "Related Controls" after the "Proposed Support" field
- Use the existing MultiSelect component to allow selection of multiple controls
- When saving, update the Excel file in Google Drive

### 2. Add New Control Button and Modal
- Add a "+ Add Control" button next to the existing "+ Add Risk" button
- Create a new modal for adding controls with fields:
  - Control Category (dropdown)
  - Control ID (auto-generated or manual input)
  - Description (textarea)
  - Implementation Status (dropdown)
  - Effectiveness (dropdown)
  - Compliance mappings (text inputs for each framework)
  - Related Risks (multi-select dropdown of all risks)
- When saving, update the Excel file in Google Drive

### 3. Fix Export CSV Functionality
- The Export CSV button currently uses AG-Grid's built-in export
- Replace with custom CSV export using the existing exportRisksToCSV utility
- Ensure all risk data is properly exported including the new control relationships

### 4. Remove "(Simple View)" from Title
- Change the PageHeader title from "Risk Matrix (Simple View)" to just "Risk Matrix"
- Simple text change in the RiskMatrixView component

## Data Architecture - Google Drive as Single Source of Truth

### Current State
- App loads from static `extracted-excel-data.json`
- Changes only saved to browser localStorage
- No persistence between users or sessions

### Future State
- `General AI Risk Map.xlsx` hosted on Google Drive
- All data operations read/write to this file
- Real-time data for all users

## Implementation Plan

### Phase 1: Google Drive Setup (User Action Required)

**Required from User:**
1. Upload `General AI Risk Map.xlsx` to 8090 Inc Team Drive
2. Create service account in Google Cloud Console
3. Share Excel file with service account (Editor permission)
4. Provide:
   - Google Drive File ID
   - Service account JSON key file

### Phase 2: Server-Side Implementation

#### 2.1 Google Drive Service
Create `server/services/googleDriveService.js`:
```javascript
class GoogleDriveService {
  constructor() {
    this.fileId = process.env.DRIVE_EXCEL_FILE_ID;
    this.auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });
    this.drive = google.drive({version: 'v3', auth: this.auth});
  }

  async downloadExcel() {
    // Download Excel from Drive to temp file
  }

  async uploadExcel(tempFilePath) {
    // Upload modified Excel back to Drive
  }
}
```

#### 2.2 API Endpoints
Update `server.js`:

```javascript
// Load data on startup
app.get('/api/risks', async (req, res) => {
  const excel = await driveService.downloadExcel();
  const risks = parseRisksFromExcel(excel);
  res.json(risks);
});

app.get('/api/controls', async (req, res) => {
  const excel = await driveService.downloadExcel();
  const controls = parseControlsFromExcel(excel);
  res.json(controls);
});

// Create new risk
app.post('/api/risks', async (req, res) => {
  // Download Excel
  // Add new risk
  // Update control relationships
  // Upload Excel
  // Return success
});

// Create new control
app.post('/api/controls', async (req, res) => {
  // Similar flow
});
```

### Phase 3: Client-Side Updates

#### 3.1 Update Stores
Modify `riskStore.ts`:
```typescript
loadRisks: async () => {
  const response = await fetch('/api/risks');
  const risks = await response.json();
  // Set state with loaded risks
}

createRisk: async (riskInput) => {
  const response = await fetch('/api/risks', {
    method: 'POST',
    body: JSON.stringify(riskInput)
  });
  // Handle response
}
```

#### 3.2 Remove Static Data Dependencies
- Delete references to `extracted-excel-data.json`
- Remove localStorage persistence
- Update all data loading to use API

### Phase 4: UI Implementation

#### 4.1 Add Risk Modal Enhancement
- Add MultiSelect for controls
- Update create handler to include control IDs

#### 4.2 Add Control Modal
- New modal component
- Form fields for control data
- MultiSelect for related risks

#### 4.3 Fix CSV Export
- Use exportRisksToCSV utility
- Ensure includes all current data

#### 4.4 Update Title
- Remove "(Simple View)" text

## Environment Configuration

### Local Development
```bash
# .env.local
DRIVE_EXCEL_FILE_ID=1a2b3c4d5e6f...
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

### Production (Cloud Run)
```bash
# Environment variables
DRIVE_EXCEL_FILE_ID=1a2b3c4d5e6f...
# Mount service account key as secret
GOOGLE_APPLICATION_CREDENTIALS=/secrets/drive-key/key.json
```

## Data Flow

### App Startup
1. Client requests `/api/risks` and `/api/controls`
2. Server downloads Excel from Google Drive
3. Parses Excel data
4. Returns JSON to client
5. Client populates stores

### Data Modification
1. User adds/edits risk or control
2. Client sends POST/PUT to API
3. Server downloads latest Excel
4. Updates Excel with changes
5. Uploads back to Drive
6. Returns success to client
7. Client updates local state

## Benefits

- **Single Source of Truth**: Excel file in Google Drive
- **Real-time Data**: All users see same data
- **Version History**: Google Drive tracks all changes
- **Easy Access**: View/download Excel directly from Drive
- **No Database**: Simplified architecture

## Success Criteria

1. Risks and controls load from Google Drive Excel
2. Can add new risks with control relationships
3. Can add new controls with risk relationships
4. Changes persist to Excel file
5. CSV export includes all data
6. Title updated to remove "(Simple View)"
7. Works in both local and cloud environments

## Testing Plan

### Manual Testing
1. Upload test Excel to Drive
2. Verify data loads correctly
3. Add new risk with controls
4. Add new control with risks
5. Verify Excel updated in Drive
6. Test CSV export
7. Deploy to Cloud Run and test

### Unit Tests

#### 1. Test: Risks and controls load from Google Drive Excel
```typescript
// __tests__/googleDriveService.test.ts
describe('GoogleDriveService', () => {
  it('should download and parse risks from Excel', async () => {
    const mockExcel = createMockExcel();
    mockDrive.files.get.mockResolvedValue(mockExcel);
    
    const risks = await service.loadRisks();
    
    expect(risks).toHaveLength(33);
    expect(risks[0]).toHaveProperty('risk');
    expect(risks[0]).toHaveProperty('riskCategory');
  });
  
  it('should download and parse controls from Excel', async () => {
    const controls = await service.loadControls();
    expect(controls).toHaveLength(13);
    expect(controls[0]).toHaveProperty('mitigationID');
  });
});
```

#### 2. Test: Can add new risks with control relationships
```typescript
// __tests__/riskApi.test.ts
describe('Risk API', () => {
  it('should create risk with control relationships', async () => {
    const newRisk = {
      risk: 'Test Risk',
      riskCategory: 'Behavioral Risks',
      relatedControlIds: ['ACC-01', 'SEC-01']
    };
    
    const response = await request(app)
      .post('/api/risks')
      .send(newRisk);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    
    // Verify Excel was updated
    expect(mockDrive.files.update).toHaveBeenCalled();
  });
});
```

#### 3. Test: Can add new controls with risk relationships
```typescript
// __tests__/controlApi.test.ts
describe('Control API', () => {
  it('should create control with risk relationships', async () => {
    const newControl = {
      mitigationID: 'TEST-01',
      mitigationDescription: 'Test Control',
      relatedRiskIds: ['risk_001', 'risk_002']
    };
    
    const response = await request(app)
      .post('/api/controls')
      .send(newControl);
    
    expect(response.status).toBe(201);
    expect(mockDrive.files.update).toHaveBeenCalled();
  });
});
```

#### 4. Test: Changes persist to Excel file
```typescript
// __tests__/persistence.test.ts
describe('Excel Persistence', () => {
  it('should persist risk changes to Excel', async () => {
    const risk = { risk: 'New Risk' };
    
    await service.createRisk(risk);
    
    // Verify Excel was downloaded, modified, and uploaded
    expect(mockDrive.files.get).toHaveBeenCalled();
    expect(mockXLSX.utils.sheet_add_json).toHaveBeenCalled();
    expect(mockDrive.files.update).toHaveBeenCalled();
  });
});
```

#### 5. Test: CSV export includes all data
```typescript
// __tests__/export.test.ts
describe('CSV Export', () => {
  it('should export all risks with relationships', async () => {
    const risks = [
      { risk: 'Risk 1', relatedControlIds: ['ACC-01'] },
      { risk: 'Risk 2', relatedControlIds: ['SEC-01', 'SEC-02'] }
    ];
    
    const csv = exportRisksToCSV(risks);
    
    expect(csv).toContain('Risk 1');
    expect(csv).toContain('ACC-01');
    expect(csv).toContain('SEC-01, SEC-02');
  });
});
```

#### 6. Test: Title updated to remove "(Simple View)"
```typescript
// __tests__/RiskMatrixView.test.tsx
describe('RiskMatrixView', () => {
  it('should display correct title without Simple View', () => {
    render(<RiskMatrixView />);
    
    expect(screen.getByText('Risk Matrix')).toBeInTheDocument();
    expect(screen.queryByText('(Simple View)')).not.toBeInTheDocument();
  });
});
```

#### 7. Test: Works in both local and cloud environments
```typescript
// __tests__/environment.test.ts
describe('Environment Configuration', () => {
  it('should use local file in development', () => {
    process.env.NODE_ENV = 'development';
    const service = new GoogleDriveService();
    
    expect(service.credentials).toContain('service-account-key.json');
  });
  
  it('should use secret in production', () => {
    process.env.NODE_ENV = 'production';
    const service = new GoogleDriveService();
    
    expect(service.credentials).toContain('/secrets/drive-key');
  });
});
```