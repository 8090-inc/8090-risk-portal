# Feature: Use Cases Management

## Overview

The Use Cases feature allows grouping and management of AI risks by specific business use cases. Each use case represents a potential AI implementation with associated risks, benefits, and implementation details. This feature provides a business-oriented view of AI initiatives and their risk profiles.

## Business Requirements

### Key Features
1. Create and manage AI use cases with comprehensive opportunity cards
2. Associate multiple risks with each use case
3. Track business value, implementation effort, and risk scores
4. Filter and search use cases by business area, AI category, and status
5. Export use case data for executive reporting
6. Support for 100+ use cases with good performance

### User Access
- All authenticated users have full access to create, read, update, and delete use cases
- Authentication is handled through IAP (Identity-Aware Proxy)
- No role-based restrictions - if you can access the application, you can perform all operations

## Technical Design

### Data Model

```typescript
interface UseCase {
  id: string;                    // Format: UC-XXX (UC-001 to UC-999)
  title: string;                 // 3-200 characters
  businessArea: string;          // Medical, Operations, R&D, etc.
  aiCategories: string[];        // Multiple categories allowed
  
  objective: {
    currentState: string;        // Current process description
    futureState: string;         // Desired future state
    solution: string;            // Proposed AI solution
  };
  
  impactAndEffort: {
    impact: string[];            // Bullet points of benefits
    costSaving: number;          // Annual cost savings in USD
    effort: {
      months: number;            // Implementation timeline
      buildCost: number;         // Initial development cost
      maintenanceCost: number;   // Annual maintenance cost
    };
    enablers: {
      requiredData: string[];    // Data sources needed
      requiredAPIs: string[];    // API integrations required
    };
  };
  
  executionElements: {
    functionsImpacted: string[]; // Departments affected
    feasibilityScore: 'Low' | 'Medium' | 'High';
    valueScore: 'Low' | 'Medium' | 'High';
    riskAssessmentScore: 'Low' | 'Medium' | 'High';
    stakeholders: {
      functionalSponsor: string; // Business sponsor
      executionLead: string;     // Technical lead
    };
  };
  
  complianceLegalConsiderations: string[];
  associatedRiskIds: string[];   // Array of risk IDs
  status: 'Active' | 'Inactive' | 'Planning' | 'Implementation';
  
  metadata: {
    createdBy: string;
    createdAt: string;
    lastUpdatedBy: string;
    lastUpdated: string;
  };
}
```

### Excel Schema

**Sheet Name**: "Use Cases"

| Column | Field | Type | Description |
|--------|-------|------|-------------|
| A | Use Case ID | String | UC-001, UC-002, etc. |
| B | Title | String | Use case title |
| C | Business Area | String | Business area/department |
| D | AI Categories | String | Comma-separated list |
| E | Current State | Text | Current process description |
| F | Future State | Text | Desired future state |
| G | Solution | Text | Proposed solution |
| H | Impact Points | Text | Pipe-separated list |
| I | Cost Saving | Number | Annual savings in USD |
| J | Effort Months | Number | Implementation timeline |
| K | Build Cost | Number | Initial cost |
| L | Maintenance Cost | Number | Annual maintenance |
| M | Required Data | Text | Pipe-separated list |
| N | Functions Impacted | String | Affected departments |
| O | Feasibility Score | String | Low/Medium/High |
| P | Value Score | String | Low/Medium/High |
| Q | Risk Score | String | Low/Medium/High |
| R | Functional Sponsor | String | Business sponsor name |
| S | Execution Lead | String | Technical lead name |
| T | Compliance | Text | Legal considerations |
| U | Status | String | Active/Inactive/Planning/Implementation |
| V | Created By | String | Creator email |
| W | Created Date | Date | ISO date string |
| X | Last Updated By | String | Last modifier email |
| Y | Last Updated | Date | ISO date string |

**Relationships Sheet Update**:
- Add "UseCase-Risk" as a relationship type
- Format: `UseCase-Risk | UC-001 | AIR-001 | Primary`

## API Endpoints

### 1. List Use Cases
```
GET /api/v1/usecases
```

Query Parameters:
- `businessArea`: Filter by business area
- `aiCategory`: Filter by AI category
- `status`: Filter by status
- `search`: Search in title and description
- `limit`: Pagination limit (default: 20, max: 100)
- `offset`: Pagination offset

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "UC-001",
      "title": "Medical Inquiry Response Documents",
      "businessArea": "Medical",
      "aiCategories": ["Content Generation", "Workflow Automation"],
      "riskCount": 12,
      "costSaving": 50000,
      "status": "Active"
    }
  ],
  "meta": {
    "total": 45,
    "limit": 20,
    "offset": 0
  }
}
```

### 2. Get Use Case Detail
```
GET /api/v1/usecases/:id
```

Response: Complete use case object with all fields

### 3. Create Use Case
```
POST /api/v1/usecases
```

Request Body: Use case object (without id and metadata)

Response:
```json
{
  "success": true,
  "data": {
    "id": "UC-046",
    // ... complete use case object
  }
}
```

### 4. Update Use Case
```
PUT /api/v1/usecases/:id
```

Request Body: Updated use case fields

### 5. Delete Use Case
```
DELETE /api/v1/usecases/:id
```

Note: Soft delete - marks as inactive

### 6. Manage Risk Associations
```
PUT /api/v1/usecases/:id/risks
```

Request Body:
```json
{
  "riskIds": ["AIR-001", "AIR-015", "AIR-023"]
}
```

### 7. Get Use Cases Summary
```
GET /api/v1/usecases/summary
```

Response:
```json
{
  "success": true,
  "data": {
    "totalUseCases": 45,
    "byStatus": {
      "Active": 30,
      "Planning": 10,
      "Implementation": 5
    },
    "byBusinessArea": {
      "Medical": 15,
      "Operations": 12,
      "R&D": 18
    },
    "totalPotentialSavings": 25000000,
    "averageImplementationTime": 4.5
  }
}
```

## Frontend Implementation

### Views

1. **Use Cases List View** (`/usecases`)
   - Grid layout with cards (3 columns on desktop, 1 on mobile)
   - Each card shows: ID, title, business area, risk count, cost savings
   - Filters: Business area, AI category, status
   - Search bar for title/description
   - "Add Use Case" button (for authorized users)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 🏠 Dashboard  📊 Risk Matrix  ⚠️ Risks  🛡️ Controls  💼 Use Cases  📈 Reports  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ Use Cases                                                    [+ Add Use Case]   │
│                                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────┐   │
│ │ Search use cases...                                                  🔍  │   │
│ └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│ Business Area: [All Areas ▼]  AI Category: [All Categories ▼]  Status: [All ▼] │
│                                                                                 │
│ Showing 12 of 45 use cases                                                     │
│                                                                                 │
│ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐      │
│ │ UC-001             │ │ UC-002             │ │ UC-003             │      │
│ │                    │ │                    │ │                    │      │
│ │ Medical Inquiry    │ │ Predictive         │ │ Drug Discovery     │      │
│ │ Response Docs      │ │ Maintenance        │ │ AI Assistant       │      │
│ │                    │ │                    │ │                    │      │
│ │ Medical            │ │ Operations         │ │ R&D                │      │
│ │ 12 Risks           │ │ 8 Risks            │ │ 15 Risks           │      │
│ │                    │ │                    │ │                    │      │
│ │ $50K/year          │ │ $2M/year           │ │ $5M/year           │      │
│ │                    │ │                    │ │                    │      │
│ │ [Active]           │ │ [Active]           │ │ [Planning]         │      │
│ └─────────────────────┘ └─────────────────────┘ └─────────────────────┘      │
│                                                                                 │
│ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐      │
│ │ UC-004             │ │ UC-005             │ │ UC-006             │      │
│ │                    │ │                    │ │                    │      │
│ │ Clinical Trial     │ │ Supply Chain       │ │ Patient            │      │
│ │ Optimization       │ │ Analytics          │ │ Monitoring         │      │
│ │                    │ │                    │ │                    │      │
│ │ Clinical           │ │ Logistics          │ │ Medical            │      │
│ │ 10 Risks           │ │ 6 Risks            │ │ 9 Risks            │      │
│ │                    │ │                    │ │                    │      │
│ │ $3M/year           │ │ $800K/year         │ │ $1.2M/year         │      │
│ │                    │ │                    │ │                    │      │
│ │ [Implementation]   │ │ [Active]           │ │ [Active]           │      │
│ └─────────────────────┘ └─────────────────────┘ └─────────────────────┘      │
│                                                                                 │
│ [Previous]  Page 1 of 4  [Next]                                               │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

2. **Use Case Detail View** (`/usecases/:id`)
   - Clean, minimalist layout following Apple design principles
   - Sections: Overview, Impact, Solution, Associated Risks
   - Edit and delete buttons (for authorized users)
   - Risk association management

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 🏠 Dashboard  📊 Risk Matrix  ⚠️ Risks  🛡️ Controls  💼 Use Cases  📈 Reports  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ ← Back to Use Cases                                         [Edit] [Delete]     │
│                                                                                 │
│ UC-001: Medical Inquiry Response Documents (CRD/SRD)                           │
│ ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│ ┌─────────────────────────────────────┬─────────────────────────────────────┐ │
│ │ Objective and Solution              │ Impact and Effort                   │ │
│ ├─────────────────────────────────────┼─────────────────────────────────────┤ │
│ │ Current State:                      │ Impact:                             │ │
│ │ • The current process is tedious    │ • Improve accuracy of CRD/SRDs      │ │
│ │   and time-consuming                │ • Reduce cycle time of drafting     │ │
│ │ • Manual literature searches        │ • Reduce manual effort              │ │
│ │ • Manual data retrieval             │                                     │ │
│ │                                     │ Cost Saving: $50K/year              │ │
│ │ Future State:                       │                                     │ │
│ │ • AI-assisted tool to automate      │ Effort:                             │ │
│ │   key aspects of CRD/SRD creation   │ • Implementation: 4 months          │ │
│ │ • Integrate with existing systems   │ • Build Cost: $150K                 │ │
│ │                                     │ • Maintenance: $20K/year            │ │
│ │ Solution:                           │                                     │ │
│ │ Generate search strings from HCP    │ Required:                           │ │
│ │ queries, summarize literature into  │ • API for PubMed and Embase        │ │
│ │ CRD/SRD template, integrate with    │ • API for SharePoint                │ │
│ │ ReadCube                            │ • API for Veeva MedComms            │ │
│ └─────────────────────────────────────┴─────────────────────────────────────┘ │
│                                                                                 │
│ Execution Elements                                                              │
│ ─────────────────                                                              │
│ Business Area: Medical                      Status: Active                      │
│ Functions Impacted: Medical Information, Operations                             │
│ Feasibility Score: High                     Value Score: Medium                 │
│ Risk Assessment: Medium                                                         │
│ Functional Sponsor: Medical Affairs/Medical Information                         │
│ Execution Lead: John Doe                                                        │
│                                                                                 │
│ Compliance/Legal Considerations                                                 │
│ ───────────────────────────────                                               │
│ • Confirm solution vendor safeguards confidential PHI/PII data                 │
│ • Confirm API access to Dompe systems complies with industry standards         │
│                                                                                 │
│ Associated Risks (12)                                    [Manage Associations]  │
│ ─────────────────────                                                         │
│ ┌─────────────────────────────────────────────────────────────────────────┐   │
│ │ AIR-001  Hallucination Risk              AI Accuracy    High    3 Ctrls │   │
│ │ AIR-015  PHI/PII Data Exposure           Privacy        High    5 Ctrls │   │
│ │ AIR-023  Regulatory Compliance           Compliance     Med     4 Ctrls │   │
│ │ AIR-031  API Integration Failures        Technical      Low     2 Ctrls │   │
│ │ AIR-042  Vendor Lock-in                  Operational    Med     1 Ctrl  │   │
│ │                                                         [Show More...]   │   │
│ └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

3. **Create/Edit Use Case Modal**
   - Multi-step form with validation
   - Step 1: Basic information
   - Step 2: Objective and solution
   - Step 3: Impact and effort
   - Step 4: Execution elements

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Add New Use Case                                                           [X] │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ Step 1 of 4: Basic Information                                                 │
│                                                                                 │
│ Use Case Title *                                                               │
│ ┌─────────────────────────────────────────────────────────────────────────┐   │
│ │                                                                         │   │
│ └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│ Business Area *                         AI Categories * (select multiple)       │
│ ┌─────────────────────┐                ☐ AI-Assisted Analytics               │
│ │ Select Area      ▼ │                ☐ Content Generation                   │
│ └─────────────────────┘                ☐ AI Simulation                        │
│                                         ☐ Workflow Automation                  │
│ Status *                                ☐ Insight Mining                       │
│ ┌─────────────────────┐                ☐ Q&A Chatbot                         │
│ │ Active           ▼ │                                                       │
│ └─────────────────────┘                                                       │
│                                                                                 │
│ ─────────────────────────────────────────────────────────────────────────────── │
│                                                              [Cancel] [Next →]  │
└─────────────────────────────────────────────────────────────────────────────────┘

Step 2:
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Add New Use Case                                                           [X] │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ Step 2 of 4: Objective and Solution                                           │
│                                                                                 │
│ Current State * (Describe the current process and pain points)                 │
│ ┌─────────────────────────────────────────────────────────────────────────┐   │
│ │                                                                         │   │
│ │                                                                         │   │
│ │                                                                         │   │
│ └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│ Future State * (Describe the desired outcome)                                  │
│ ┌─────────────────────────────────────────────────────────────────────────┐   │
│ │                                                                         │   │
│ │                                                                         │   │
│ │                                                                         │   │
│ └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│ Solution * (Describe the AI solution to achieve future state)                  │
│ ┌─────────────────────────────────────────────────────────────────────────┐   │
│ │                                                                         │   │
│ │                                                                         │   │
│ │                                                                         │   │
│ └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│ ─────────────────────────────────────────────────────────────────────────────── │
│                                                    [← Back] [Cancel] [Next →]  │
└─────────────────────────────────────────────────────────────────────────────────┘

Step 3:
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Add New Use Case                                                           [X] │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ Step 3 of 4: Impact and Effort                                                │
│                                                                                 │
│ Impact Points * (Add key benefits)                          [+ Add Impact]     │
│ ┌─────────────────────────────────────────────────────────────────────────┐   │
│ │ • Reduce processing time by 60%                                     [X] │   │
│ │ • Improve accuracy to 95%                                           [X] │   │
│ │ • Enable 24/7 availability                                          [X] │   │
│ └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│ Financial Impact                        Implementation Effort                   │
│                                                                                 │
│ Annual Cost Saving *                    Implementation Time *                   │
│ ┌─────────────────────┐                ┌─────────────────────┐               │
│ │ $               .00 │                │                months│               │
│ └─────────────────────┘                └─────────────────────┘               │
│                                                                                 │
│ Build Cost                              Maintenance Cost (Annual)               │
│ ┌─────────────────────┐                ┌─────────────────────┐               │
│ │ $               .00 │                │ $               .00 │               │
│ └─────────────────────┘                └─────────────────────┘               │
│                                                                                 │
│ Required Resources                                          [+ Add Resource]    │
│ ┌─────────────────────────────────────────────────────────────────────────┐   │
│ │ • API access to internal systems                                    [X] │   │
│ │ • Historical data for training                                      [X] │   │
│ └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│ ─────────────────────────────────────────────────────────────────────────────── │
│                                                    [← Back] [Cancel] [Next →]  │
└─────────────────────────────────────────────────────────────────────────────────┘

Step 4:
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Add New Use Case                                                           [X] │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ Step 4 of 4: Execution Elements                                               │
│                                                                                 │
│ Functions Impacted *                                                           │
│ ┌─────────────────────────────────────────────────────────────────────────┐   │
│ │                                                                         │   │
│ └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│ Assessment Scores *                                                            │
│                                                                                 │
│ Feasibility Score        Value Score           Risk Assessment                 │
│ ○ Low                    ○ Low                 ○ Low                          │
│ ● Medium                 ● Medium              ○ Medium                       │
│ ○ High                   ○ High                ● High                         │
│                                                                                 │
│ Stakeholders                                                                   │
│                                                                                 │
│ Functional Sponsor *                                                           │
│ ┌─────────────────────────────────────────────────────────────────────────┐   │
│ │                                                                         │   │
│ └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│ Execution Lead                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────┐   │
│ │                                                                         │   │
│ └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│ Compliance/Legal Considerations                                                │
│ ┌─────────────────────────────────────────────────────────────────────────┐   │
│ │                                                                         │   │
│ │                                                                         │   │
│ └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│ ─────────────────────────────────────────────────────────────────────────────── │
│                                                  [← Back] [Cancel] [Save Use Case] │
└─────────────────────────────────────────────────────────────────────────────────┘
```

4. **Risk Association Modal**
   - Used when clicking "Manage Associations" from use case detail view

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Manage Risk Associations - UC-001                                          [X] │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ Select risks to associate with this use case                                   │
│                                                                                 │
│ Search risks...                                                           🔍   │
│                                                                                 │
│ Category: [All Categories ▼]    Risk Level: [All Levels ▼]                    │
│                                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────┐   │
│ │ ☑ AIR-001  Hallucination Risk              AI Accuracy    High         │   │
│ │ ☐ AIR-002  Model Bias                      AI Fairness    High         │   │
│ │ ☐ AIR-003  Data Quality Issues             Data Quality   Medium       │   │
│ │ ☐ AIR-004  Model Drift                     AI Accuracy    Medium       │   │
│ │ ☑ AIR-015  PHI/PII Data Exposure           Privacy        High         │   │
│ │ ☐ AIR-016  Unauthorized Access             Security       High         │   │
│ │ ☐ AIR-022  Vendor Dependency               Operational    Low          │   │
│ │ ☑ AIR-023  Regulatory Compliance           Compliance     Medium       │   │
│ │ ☑ AIR-031  API Integration Failures        Technical      Low          │   │
│ │ ☐ AIR-032  System Downtime                 Availability   Medium       │   │
│ │ ☑ AIR-042  Vendor Lock-in                  Operational    Medium       │   │
│ │ ☐ AIR-043  Cost Overruns                   Financial      Low          │   │
│ └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│ Selected: 5 risks                                                              │
│                                                                                 │
│ ─────────────────────────────────────────────────────────────────────────────── │
│                                                        [Cancel] [Save Changes]  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Components

```
src/
  components/
    usecases/
      UseCaseCard.tsx         // Individual card component
      UseCaseGrid.tsx         // Responsive grid container
      UseCaseDetail.tsx       // Detail view component
      UseCaseForm.tsx         // Create/edit form
      UseCaseFilters.tsx      // Filter controls
      UseCaseRiskList.tsx     // Associated risks display
      UseCaseRiskSelector.tsx // Risk association modal
  views/
    UseCasesView.tsx          // List view
    UseCaseDetailView.tsx     // Detail view
  store/
    useCaseStore.ts           // Zustand store for use cases
```

### Store Structure

```typescript
interface UseCaseStore {
  // State
  useCases: UseCase[];
  selectedUseCase: UseCase | null;
  loading: boolean;
  error: string | null;
  filters: {
    businessArea: string | null;
    aiCategory: string | null;
    status: string | null;
    search: string;
  };
  
  // Actions
  fetchUseCases: () => Promise<void>;
  fetchUseCaseById: (id: string) => Promise<void>;
  createUseCase: (data: Partial<UseCase>) => Promise<UseCase>;
  updateUseCase: (id: string, data: Partial<UseCase>) => Promise<void>;
  deleteUseCase: (id: string) => Promise<void>;
  updateRiskAssociations: (id: string, riskIds: string[]) => Promise<void>;
  setFilters: (filters: Partial<UseCaseFilters>) => void;
  clearFilters: () => void;
}
```

## Excel Persistence Layer

### Overview

The Use Cases feature integrates with the existing GoogleDrivePersistenceProvider to store data in the Excel file hosted on Google Drive. This ensures consistency with the existing risk and control data management approach.

### GoogleDrivePersistenceProvider Integration

The persistence layer follows the same pattern as risks and controls:

```javascript
// server/services/UseCaseService.cjs
class UseCaseService {
  constructor(persistenceProvider) {
    this.persistence = persistenceProvider; // GoogleDrivePersistenceProvider instance
  }
  
  async createUseCase(useCaseData, currentUser) {
    // Get current data with Excel buffer
    const data = await this.persistence.getData();
    
    // Add use case to Excel
    const buffer = this.inTransaction ? 
      this.persistence.transactionBuffer : 
      data.buffer;
      
    const updatedBuffer = await addUseCaseToWorkbook(buffer, useCaseData);
    
    // Upload to Google Drive
    if (!this.inTransaction) {
      await this.persistence.uploadFile(updatedBuffer);
    }
    
    return useCaseData;
  }
}
```

### Excel Parser Extensions

Add these functions to `server/utils/excelParser.cjs`:

```javascript
// Parse use cases from Excel
const parseUseCasesFromWorkbook = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('use case')
  );
  
  if (!sheetName) {
    return [];
  }
  
  const sheet = workbook.Sheets[sheetName];
  const useCases = [];
  const range = XLSX.utils.decode_range(sheet['!ref']);
  
  for (let row = 1; row <= range.e.r; row++) {
    const id = getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: 0 })]);
    
    if (!id || !/^UC-\d{3}$/.test(id)) {
      continue;
    }
    
    const useCase = {
      id,
      title: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: 1 })]),
      businessArea: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: 2 })]),
      aiCategories: parsePipeSeparated(getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: 3 })])),
      // ... parse all fields according to schema
      metadata: {
        createdBy: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: 21 })]),
        createdAt: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: 22 })]),
        lastUpdatedBy: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: 23 })]),
        lastUpdated: getCellValue(sheet[XLSX.utils.encode_cell({ r: row, c: 24 })])
      }
    };
    
    useCases.push(useCase);
  }
  
  return useCases;
};

// Add use case to workbook
const addUseCaseToWorkbook = async (buffer, newUseCase) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  
  // Find or create Use Cases sheet
  let sheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('use case')
  );
  
  if (!sheetName) {
    sheetName = 'Use Cases';
    const headers = [
      'Use Case ID', 'Title', 'Business Area', 'AI Categories',
      // ... all column headers
    ];
    const newSheet = XLSX.utils.aoa_to_sheet([headers]);
    workbook.Sheets[sheetName] = newSheet;
    workbook.SheetNames.push(sheetName);
  }
  
  const sheet = workbook.Sheets[sheetName];
  const range = XLSX.utils.decode_range(sheet['!ref']);
  const newRow = range.e.r + 1;
  
  // Generate next ID if not provided
  if (!newUseCase.id) {
    newUseCase.id = generateNextUseCaseId(sheet, range);
  }
  
  // Add row data
  const rowData = [
    newUseCase.id,
    newUseCase.title,
    newUseCase.businessArea,
    newUseCase.aiCategories.join(', '),
    newUseCase.objective.currentState,
    newUseCase.objective.futureState,
    newUseCase.objective.solution,
    newUseCase.impactAndEffort.impact.join(' | '),
    // ... map all fields to columns
  ];
  
  rowData.forEach((value, colIndex) => {
    const cell = { t: 's', v: value || '' };
    sheet[XLSX.utils.encode_cell({ r: newRow, c: colIndex })] = cell;
  });
  
  // Update range
  sheet['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: newRow, c: rowData.length - 1 }
  });
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};
```

### Extending GoogleDrivePersistenceProvider

Update the provider to handle use cases:

```javascript
class GoogleDrivePersistenceProvider extends IPersistenceProvider {
  
  async getData(forceRefresh = false) {
    if (!forceRefresh && this.cache && Date.now() - this.cache.timestamp < this.cacheExpiry) {
      return this.cache.data;
    }
    
    try {
      const buffer = await this.downloadFile();
      const risks = await parseRisksFromWorkbook(buffer);
      const controls = await parseControlsFromWorkbook(buffer);
      const relationships = await parseRelationshipsFromWorkbook(buffer);
      const useCases = await parseUseCasesFromWorkbook(buffer); // NEW
      
      // Build relationships including use case associations
      const data = this.buildRelationships(risks, controls, relationships, useCases);
      
      this.cache = {
        data: { ...data, buffer },
        timestamp: Date.now()
      };
      
      return this.cache.data;
    } catch (error) {
      throw new ApiError(500, ErrorCodes.EXCEL_PARSE_ERROR, { 
        details: error.message 
      });
    }
  }
  
  buildRelationships(risks, controls, relationships, useCases) {
    // Existing risk-control relationship building...
    
    // Build use case-risk relationships
    const useCaseRiskMap = new Map();
    
    relationships
      .filter(rel => rel.type === 'UseCase-Risk')
      .forEach(rel => {
        if (!useCaseRiskMap.has(rel.sourceId)) {
          useCaseRiskMap.set(rel.sourceId, []);
        }
        useCaseRiskMap.get(rel.sourceId).push(rel.targetId);
      });
    
    // Apply relationships to use cases
    useCases.forEach(useCase => {
      useCase.associatedRiskIds = useCaseRiskMap.get(useCase.id) || [];
    });
    
    // Add use case associations to risks
    risks.forEach(risk => {
      risk.associatedUseCaseIds = useCases
        .filter(uc => uc.associatedRiskIds.includes(risk.id))
        .map(uc => uc.id);
    });
    
    return { risks, controls, relationships, useCases };
  }
  
  // Use Case operations
  async getAllUseCases(options = {}) {
    const data = await this.getData();
    return data.useCases || [];
  }
  
  async getUseCaseById(id) {
    const data = await this.getData();
    const useCase = data.useCases.find(uc => uc.id === id);
    
    if (!useCase) {
      throw new ApiError(404, ErrorCodes.USE_CASE_NOT_FOUND, { id });
    }
    
    return useCase;
  }
  
  async createUseCase(useCase) {
    const data = await this.getData();
    
    // Check for duplicate title
    const existing = data.useCases.find(uc => 
      uc.title.toLowerCase() === useCase.title.toLowerCase()
    );
    if (existing) {
      throw new ApiError(422, ErrorCodes.DUPLICATE_USE_CASE_TITLE, {
        title: useCase.title
      });
    }
    
    const buffer = this.inTransaction ? this.transactionBuffer : data.buffer;
    const updatedBuffer = await addUseCaseToWorkbook(buffer, useCase);
    
    if (this.inTransaction) {
      this.transactionBuffer = updatedBuffer;
    } else {
      await this.uploadFile(updatedBuffer);
      // Update cache
      data.useCases.push(useCase);
      data.buffer = updatedBuffer;
    }
    
    return useCase;
  }
  
  async updateUseCase(id, useCaseUpdates) {
    const data = await this.getData();
    
    const existingIndex = data.useCases.findIndex(uc => uc.id === id);
    if (existingIndex === -1) {
      throw new ApiError(404, ErrorCodes.USE_CASE_NOT_FOUND, { id });
    }
    
    const existingUseCase = data.useCases[existingIndex];
    const updatedUseCase = {
      ...existingUseCase,
      ...useCaseUpdates,
      id: existingUseCase.id, // Preserve ID
      metadata: {
        ...existingUseCase.metadata,
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: useCaseUpdates.currentUser?.email
      }
    };
    
    const buffer = this.inTransaction ? this.transactionBuffer : data.buffer;
    const updatedBuffer = await updateUseCaseInWorkbook(buffer, id, updatedUseCase);
    
    if (this.inTransaction) {
      this.transactionBuffer = updatedBuffer;
    } else {
      await this.uploadFile(updatedBuffer);
      // Update cache
      data.useCases[existingIndex] = updatedUseCase;
      data.buffer = updatedBuffer;
    }
    
    return updatedUseCase;
  }
  
  async deleteUseCase(id) {
    const data = await this.getData();
    const useCase = data.useCases.find(uc => uc.id === id);
    
    if (!useCase) {
      throw new ApiError(404, ErrorCodes.USE_CASE_NOT_FOUND, { id });
    }
    
    let buffer = this.inTransaction ? this.transactionBuffer : data.buffer;
    
    // Remove all relationships for this use case
    buffer = await removeAllRelationshipsForUseCase(buffer, id);
    
    // Delete the use case
    const updatedBuffer = await deleteUseCaseFromWorkbook(buffer, id);
    
    if (this.inTransaction) {
      this.transactionBuffer = updatedBuffer;
    } else {
      await this.uploadFile(updatedBuffer);
      // Update cache
      data.useCases = data.useCases.filter(uc => uc.id !== id);
      data.relationships = data.relationships.filter(
        rel => !(rel.type === 'UseCase-Risk' && rel.sourceId === id)
      );
      data.buffer = updatedBuffer;
    }
  }
  
  // Use Case-Risk relationship operations
  async addUseCaseRiskRelationship(useCaseId, riskId) {
    const useCase = await this.getUseCaseById(useCaseId);
    const risk = await this.getRiskById(riskId);
    const data = await this.getData();
    
    // Check if relationship already exists
    const existingRelationship = data.relationships.find(
      rel => rel.type === 'UseCase-Risk' && 
             rel.sourceId === useCaseId && 
             rel.targetId === riskId
    );
    
    if (existingRelationship) {
      return; // Relationship already exists
    }
    
    // Create new relationship
    const relationship = {
      type: 'UseCase-Risk',
      sourceId: useCaseId,
      targetId: riskId,
      linkStrength: 'Primary',
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    const buffer = this.inTransaction ? this.transactionBuffer : data.buffer;
    const updatedBuffer = await addRelationshipToWorkbook(
      buffer, 
      'UseCase-Risk',
      useCaseId,
      riskId,
      'Primary'
    );
    
    if (this.inTransaction) {
      this.transactionBuffer = updatedBuffer;
    } else {
      await this.uploadFile(updatedBuffer);
      // Update cache
      data.relationships.push(relationship);
      if (!useCase.associatedRiskIds.includes(riskId)) {
        useCase.associatedRiskIds.push(riskId);
      }
      if (!risk.associatedUseCaseIds) {
        risk.associatedUseCaseIds = [];
      }
      if (!risk.associatedUseCaseIds.includes(useCaseId)) {
        risk.associatedUseCaseIds.push(useCaseId);
      }
      data.buffer = updatedBuffer;
    }
  }
}
```

### Transaction Support

The Use Cases feature leverages the existing transaction support for batch operations:

```javascript
// Example: Create use case with risk associations
async createUseCaseWithRisks(useCaseData, riskIds) {
  await this.persistence.beginTransaction();
  
  try {
    // Create use case
    const useCase = await this.persistence.createUseCase(useCaseData);
    
    // Add risk associations
    for (const riskId of riskIds) {
      await this.persistence.addUseCaseRiskRelationship(useCase.id, riskId);
    }
    
    await this.persistence.commitTransaction();
    return useCase;
  } catch (error) {
    await this.persistence.rollbackTransaction();
    throw error;
  }
}
```

### Caching Strategy

The GoogleDrivePersistenceProvider implements a 5-minute cache to optimize performance:

1. **Cache Structure**: Includes risks, controls, relationships, and use cases
2. **Cache Invalidation**: Automatic after any write operation
3. **Force Refresh**: Available via `getData(true)` for immediate updates

### Error Handling

Use case operations follow the same error handling pattern:

```javascript
// Error codes to add
const ErrorCodes = {
  USE_CASE_NOT_FOUND: {
    code: 'USE_CASE_NOT_FOUND',
    message: 'Use case with ID {id} not found',
    suggestion: 'Check the use case ID and try again'
  },
  DUPLICATE_USE_CASE_TITLE: {
    code: 'DUPLICATE_USE_CASE_TITLE',
    message: 'A use case with title "{title}" already exists',
    suggestion: 'Use a different title or update the existing use case'
  }
};
```

### Performance Considerations

1. **Batch Operations**: Use transactions for multiple related updates
2. **Pagination**: Implement at service layer for large datasets
3. **Selective Loading**: Only parse use cases when needed
4. **Buffer Reuse**: Minimize Excel file parsing by reusing buffers

## Security Considerations

### 1. Input Validation
- Sanitize all text inputs to prevent XSS
- Validate field lengths and formats
- Ensure numeric fields are within reasonable ranges
- Validate AI categories against allowed list

### 2. Authentication
- Verify user is authenticated via IAP headers
- Log all modifications with user information
- No additional authorization checks needed

### 3. Data Protection
- Encrypt sensitive financial data at rest
- Use HTTPS for all API communications
- Implement audit logging for compliance

## Integration Points

### 1. Risk Management
- Risks can be associated with multiple use cases
- Risk detail view shows associated use cases
- Deleting a use case removes risk associations

### 2. Dashboard
- Add use cases widget showing summary metrics
- Include use case count in header stats
- Show top use cases by potential savings

### 3. Reports
- Export use cases to CSV/Excel
- Generate executive summary with opportunity cards
- Create risk-use case matrix report

## Testing Strategy

### 1. Unit Tests
- Excel parser functions
- Use case service methods
- Validation functions
- Store actions

### 2. Integration Tests
- API endpoints
- Google Drive operations
- Risk association management

### 3. E2E Tests
- Create use case flow
- Risk association flow
- Export functionality
- Search and filter operations

### 4. Performance Tests
- Load 100+ use cases
- Filter large datasets
- Concurrent user operations

## Implementation Phases

### Phase 1: Backend Foundation (Week 1)
1. Update Excel parser for use cases sheet
2. Create UseCaseService class
3. Implement API endpoints
4. Add validation middleware
5. Update relationships handling

### Phase 2: Frontend Core (Week 2)
1. Create Zustand store
2. Build list view with grid layout
3. Implement detail view
4. Create form components
5. Add routing

### Phase 3: Integration & Polish (Week 3)
1. Risk association management
2. Dashboard integration
3. Export functionality
4. Testing and bug fixes
5. Documentation

## Success Metrics

1. **Performance**: Page load < 2 seconds with 100 use cases
2. **Usability**: Users can create use case in < 3 minutes
3. **Reliability**: 99.9% uptime, no data loss
4. **Adoption**: 80% of risks associated with use cases within 3 months

## Rollback Plan

If issues arise:
1. Feature can be disabled via feature flag
2. Excel sheet can be removed without affecting other data
3. API endpoints return empty arrays if sheet missing
4. UI gracefully handles missing use case data

## Future Enhancements

1. **Templates**: Pre-defined use case templates by industry
2. **Workflow**: Approval workflow for use cases
3. **Analytics**: ROI tracking and realization metrics
4. **Integration**: Connect with project management tools
5. **AI Suggestions**: Auto-suggest risks based on use case type