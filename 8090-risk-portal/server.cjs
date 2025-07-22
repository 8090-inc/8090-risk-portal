const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const {
  parseRisksFromWorkbook,
  parseControlsFromWorkbook,
  addRiskToWorkbook,
  updateRiskInWorkbook,
  deleteRiskFromWorkbook,
  addControlToWorkbook,
  updateControlInWorkbook,
  deleteControlFromWorkbook
} = require('./server/utils/excelParser.cjs');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: [
    'https://dompe-dev-439304.web.app',
    'https://dompe-dev-439304.firebaseapp.com', 
    'https://dompe.airiskportal.com',
    'http://localhost:3000',
    'http://localhost:3003'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Goog-Authenticated-User-Email', 'X-Goog-Authenticated-User-Id']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', true);

// Google Drive Configuration
const GOOGLE_DRIVE_FILE_ID = process.env.GOOGLE_DRIVE_FILE_ID || '1OzrkAUQTWY7VUNrX-_akCWIuU2ALR3sm';
let driveService = null;
let cachedData = { risks: [], controls: [], lastFetch: null };

// Initialize Google Drive Service
const initializeDriveService = async () => {
  try {
    let credentials;
    
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      // Production: Use environment variable
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    } else if (fs.existsSync('./service-account-key.json')) {
      // Development: Use local file
      credentials = JSON.parse(fs.readFileSync('./service-account-key.json', 'utf8'));
    } else {
      throw new Error('No Google service account credentials found');
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.file']
    });

    driveService = google.drive({ version: 'v3', auth });
    
    console.log('Service Account Email:', credentials.client_email);
    console.log('Google Drive service initialized successfully');
    
    return driveService;
  } catch (error) {
    console.error('Failed to initialize Google Drive service:', error);
    throw error;
  }
};

// Download file from Google Drive (with team drive support)
const downloadFileFromDrive = async (fileId) => {
  try {
    if (!driveService) {
      driveService = await initializeDriveService();
    }

    console.log('Attempting to download file:', fileId);
    
    // Get file metadata with team drive support
    const fileMetadata = await driveService.files.get({
      fileId: fileId,
      fields: 'name, mimeType, driveId',
      supportsAllDrives: true
    });
    
    console.log('File found:', fileMetadata.data.name, 'Type:', fileMetadata.data.mimeType);
    console.log('Drive ID:', fileMetadata.data.driveId);

    let buffer;
    
    // Handle different file types
    if (fileMetadata.data.mimeType === 'application/vnd.google-apps.spreadsheet') {
      console.log('Detected Google Sheets - exporting as Excel...');
      // Export Google Sheets as Excel
      const response = await driveService.files.export({
        fileId: fileId,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        supportsAllDrives: true
      }, {
        responseType: 'arraybuffer'
      });
      buffer = Buffer.from(response.data);
    } else if (fileMetadata.data.mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      console.log('Detected Excel file - downloading directly...');
      // Download Excel file directly
      const response = await driveService.files.get({
        fileId: fileId,
        alt: 'media',
        supportsAllDrives: true
      }, {
        responseType: 'arraybuffer'
      });
      buffer = Buffer.from(response.data);
    } else {
      console.log('Unknown file type, attempting direct download...');
      // Try direct download for unknown types
      const response = await driveService.files.get({
        fileId: fileId,
        alt: 'media',
        supportsAllDrives: true
      }, {
        responseType: 'arraybuffer'
      });
      buffer = Buffer.from(response.data);
    }

    console.log('File downloaded successfully, size:', buffer.length, 'bytes');
    
    return buffer;
  } catch (error) {
    console.error('Error downloading file from Google Drive:', error);
    throw error;
  }
};

// Upload file to Google Drive (with team drive support)
const uploadFileToDrive = async (fileId, buffer, filename = 'General AI Risk Map.xlsx') => {
  try {
    if (!driveService) {
      driveService = await initializeDriveService();
    }

    const media = {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      body: buffer
    };

    await driveService.files.update({
      fileId: fileId,
      media: media,
      supportsAllDrives: true
    });

    console.log('File uploaded successfully to Google Drive');
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    throw error;
  }
};

// Parse Excel data - Focus on perfect Excel parsing
// REMOVED: parseExcelData function - now using excelParser.cjs functions

// Generate default controls
const generateDefaultControls = () => {
  return [
    {
      mitigationID: 'ACC-01',
      mitigationDescription: 'Human-in-the-Loop verification with enhanced security features',
      category: 'Accuracy & Judgment',
      compliance: {
        cfrPart11Annex11: '11.10(a), 11.50, 11.100',
        hipaaSafeguard: '§ 164.308(a)(1)(i)',
        gdprArticle: 'Art. 22 (Enhanced)',
        euAiActArticle: 'Art. 14 (Human Oversight)',
        nist80053: 'IA-2, IA-4, IA-5',
        soc2TSC: 'PI 1.2, PI 1.4'
      },
      relatedRiskIds: [],
      implementationStatus: 'Not Started',
      implementationDate: null,
      implementationNotes: '',
      effectiveness: 'Not Assessed',
      lastAssessmentDate: null,
      nextAssessmentDate: null,
      complianceScore: 1,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      mitigationID: 'ACC-02',
      mitigationDescription: 'Training on AI limitations, critical thinking, and independent verification.',
      category: 'Accuracy & Judgment',
      compliance: {
        cfrPart11Annex11: '11.10(i); Annex 11: 2',
        hipaaSafeguard: '§ 164.308(a)(5) (Security Awareness)',
        gdprArticle: 'Art. 32 (Security of processing)',
        euAiActArticle: 'Art. 14(5) (Training of users)',
        nist80053: 'AT-2, AT-3',
        soc2TSC: 'CC1.2, CC2.2'
      },
      relatedRiskIds: [],
      implementationStatus: 'Not Started',
      implementationDate: null,
      implementationNotes: '',
      effectiveness: 'Not Assessed',
      lastAssessmentDate: null,
      nextAssessmentDate: null,
      complianceScore: 1,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      mitigationID: 'ACC-03',
      mitigationDescription: 'Implement a Retrieval-Augmented Generation (RAG) architecture grounded in a validated, version-controlled corpus.',
      category: 'Accuracy & Judgment',
      compliance: {
        cfrPart11Annex11: '11.10(a); Annex 11: 4 (Validation)',
        hipaaSafeguard: '§ 164.310(d)(1) (Data Integrity)',
        gdprArticle: 'Art. 25 (Data protection by design)',
        euAiActArticle: 'Art. 10 (Data and data governance)',
        nist80053: 'SI-7, CM-2, SA-8',
        soc2TSC: 'PI 1.1, A1.1'
      },
      relatedRiskIds: [],
      implementationStatus: 'Not Started',
      implementationDate: null,
      implementationNotes: '',
      effectiveness: 'Not Assessed',
      lastAssessmentDate: null,
      nextAssessmentDate: null,
      complianceScore: 1,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  ];
};

// Fetch and cache data from Google Drive
const fetchDataFromDrive = async () => {
  try {
    console.log('Fetching fresh data from Google Drive...');
    
    // Force reinitialization to ensure fresh connection
    console.log('Forcing reinitialization of Google Drive service...');
    driveService = await initializeDriveService();
    
    const buffer = await downloadFileFromDrive(GOOGLE_DRIVE_FILE_ID);
    
    // Use excelParser functions
    const risks = await parseRisksFromWorkbook(buffer);
    const controls = await parseControlsFromWorkbook(buffer);
    
    cachedData = {
      risks,
      controls,
      lastFetch: new Date(),
      buffer: buffer // Keep buffer for updates
    };
    
    return cachedData;
  } catch (error) {
    console.error('Error fetching data from Google Drive:', error);
    
    // Return cached data if available
    if (cachedData.risks && cachedData.risks.length > 0) {
      console.log('Returning cached data');
      return cachedData;
    }
    
    throw error;
  }
};

// Get cached data or fetch fresh
const getData = async () => {
  const maxAge = 30 * 60 * 1000; // 30 minutes
  const now = new Date();
  
  if (!cachedData.lastFetch || (now - cachedData.lastFetch) > maxAge) {
    try {
      return await fetchDataFromDrive();
    } catch (error) {
      console.log('Google Drive failed, using test data');
      // Fall back to simple test data
      const testData = JSON.parse(fs.readFileSync('./test-data.json', 'utf8'));
      // Convert test data to simple format
      const simpleRisks = testData.risk_areas.map(risk => ({
        id: risk.id,
        risk: risk.risk,
        riskCategory: risk.risk_category,
        riskName: risk.risk,
        riskDescription: risk.risk_description,
        initialScoring: {
          likelihood: risk.initial_risk_scoring.likelihood,
          impact: risk.initial_risk_scoring.impact,
          riskLevel: risk.initial_risk_scoring.risk_level,
          riskLevelCategory: risk.initial_risk_scoring.risk_level_category
        },
        exampleMitigations: risk.mitigations.example_mitigations,
        agreedMitigation: risk.mitigations.agreed_workable_mitigation,
        proposedOversightOwnership: risk.mitigations.proposed_oversight_ownership,
        proposedSupport: risk.mitigations.proposed_support,
        notes: risk.mitigations.notes,
        residualScoring: {
          likelihood: risk.residual_risk_scoring.likelihood,
          impact: risk.residual_risk_scoring.impact,
          riskLevel: risk.residual_risk_scoring.risk_level,
          riskLevelCategory: risk.residual_risk_scoring.risk_level_category
        },
        riskReduction: risk.initial_risk_scoring.risk_level - risk.residual_risk_scoring.risk_level,
        riskReductionPercentage: Math.round(((risk.initial_risk_scoring.risk_level - risk.residual_risk_scoring.risk_level) / risk.initial_risk_scoring.risk_level) * 100),
        mitigationEffectiveness: 'High',
        relatedControlIds: [],
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }));
      
      cachedData = {
        risks: simpleRisks,
        controls: generateDefaultControls(),
        lastFetch: new Date(),
        buffer: null // No buffer for test data
      };
      return cachedData;
    }
  }
  
  console.log('Returning cached data');
  return cachedData;
};

// IAP user identity middleware
app.use((req, res, next) => {
  const iapEmail = req.header('X-Goog-Authenticated-User-Email');
  const iapUserId = req.header('X-Goog-Authenticated-User-Id');

  if (iapEmail) {
    const email = iapEmail.split(':')[1];
    const userId = iapUserId ? iapUserId.split(':')[1] : null;

    req.user = {
      email: email,
      id: userId || email.split('@')[0],
      name: email.split('@')[0],
      role: 'user'
    };
  } else if (process.env.NODE_ENV !== 'production') {
    req.user = {
      email: 'test.user@dompe.com',
      id: 'test.user',
      name: 'test.user',
      role: 'admin'
    };
  }

  next();
});

// Routes

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

// Auth endpoints
app.get('/api/auth/me', (req, res) => {
  console.log('=== /api/auth/me called ===');
  console.log('User:', req.user);

  if (req.user) {
    res.json({
      authenticated: true,
      user: req.user
    });
  } else {
    res.status(401).json({
      authenticated: false,
      error: 'Not authenticated'
    });
  }
});

// Risks endpoints
app.get('/api/risks', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const data = await getData();
    res.json(data.risks);
  } catch (error) {
    console.error('Error fetching risks:', error);
    res.status(500).json({ error: 'Failed to fetch risks' });
  }
});

app.get('/api/risks/:id', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const data = await getData();
    const risk = data.risks.find(r => r.id === req.params.id);
    
    if (!risk) {
      return res.status(404).json({ error: 'Risk not found' });
    }

    res.json(risk);
  } catch (error) {
    console.error('Error fetching risk:', error);
    res.status(500).json({ error: 'Failed to fetch risk' });
  }
});

app.post('/api/risks', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Generate consistent ID using the same logic as excelParser
    const generateConsistentRiskId = (riskName) => {
      const sanitized = riskName.replace(/[^a-zA-Z0-9]/g, '-').toUpperCase();
      const timestamp = Date.now().toString().slice(-4);
      return `RISK-${sanitized}-${timestamp}`;
    };

    const newRisk = {
      ...req.body,
      id: req.body.id || generateConsistentRiskId(req.body.risk || 'UNKNOWN'),
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const data = await getData();
    
    // Add to Excel and upload
    const updatedBuffer = await addRiskToWorkbook(data.buffer, newRisk);
    await uploadFileToDrive(GOOGLE_DRIVE_FILE_ID, updatedBuffer);
    
    // Update cache
    cachedData.risks.push(newRisk);
    cachedData.buffer = updatedBuffer;
    
    res.status(201).json(newRisk);
  } catch (error) {
    console.error('Error creating risk:', error);
    res.status(500).json({ error: 'Failed to create risk' });
  }
});

app.put('/api/risks/:id', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const riskId = req.params.id;
    const updatedRisk = {
      ...req.body,
      id: riskId,
      lastUpdated: new Date().toISOString()
    };

    const data = await getData();
    const riskIndex = data.risks.findIndex(r => r.id === riskId);
    
    if (riskIndex === -1) {
      return res.status(404).json({ error: 'Risk not found' });
    }

    // Update in Excel and upload
    const updatedBuffer = await updateRiskInWorkbook(data.buffer, riskId, updatedRisk);
    await uploadFileToDrive(GOOGLE_DRIVE_FILE_ID, updatedBuffer);
    
    // Update cache
    cachedData.risks[riskIndex] = updatedRisk;
    cachedData.buffer = updatedBuffer;
    
    res.json(updatedRisk);
  } catch (error) {
    console.error('Error updating risk:', error);
    res.status(500).json({ error: 'Failed to update risk' });
  }
});

app.delete('/api/risks/:id', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const riskId = req.params.id;
    const data = await getData();
    const riskIndex = data.risks.findIndex(r => r.id === riskId);
    
    if (riskIndex === -1) {
      return res.status(404).json({ error: 'Risk not found' });
    }

    // Delete from Excel and upload
    const updatedBuffer = await deleteRiskFromWorkbook(data.buffer, riskId);
    await uploadFileToDrive(GOOGLE_DRIVE_FILE_ID, updatedBuffer);
    
    // Update cache
    cachedData.risks.splice(riskIndex, 1);
    cachedData.buffer = updatedBuffer;
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting risk:', error);
    res.status(500).json({ error: 'Failed to delete risk' });
  }
});

// Controls endpoints
app.get('/api/controls', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const data = await getData();
    res.json(data.controls);
  } catch (error) {
    console.error('Error fetching controls:', error);
    res.status(500).json({ error: 'Failed to fetch controls' });
  }
});

app.get('/api/controls/:id', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const data = await getData();
    const control = data.controls.find(c => c.mitigationID === req.params.id);
    
    if (!control) {
      return res.status(404).json({ error: 'Control not found' });
    }

    res.json(control);
  } catch (error) {
    console.error('Error fetching control:', error);
    res.status(500).json({ error: 'Failed to fetch control' });
  }
});

app.post('/api/controls', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const newControl = {
      ...req.body,
      mitigationID: req.body.mitigationID || `CTRL-${Date.now()}`,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const data = await getData();
    
    // Add to Excel and upload
    const updatedBuffer = await addControlToWorkbook(data.buffer, newControl);
    await uploadFileToDrive(GOOGLE_DRIVE_FILE_ID, updatedBuffer);
    
    // Update cache
    cachedData.controls.push(newControl);
    cachedData.buffer = updatedBuffer;
    
    res.status(201).json(newControl);
  } catch (error) {
    console.error('Error creating control:', error);
    res.status(500).json({ error: 'Failed to create control' });
  }
});

app.put('/api/controls/:id', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const controlId = req.params.id;
    const updatedControl = {
      ...req.body,
      mitigationID: controlId,
      lastUpdated: new Date().toISOString()
    };

    const data = await getData();
    const controlIndex = data.controls.findIndex(c => c.mitigationID === controlId);
    
    if (controlIndex === -1) {
      return res.status(404).json({ error: 'Control not found' });
    }

    // Update in Excel and upload
    const updatedBuffer = await updateControlInWorkbook(data.buffer, controlId, updatedControl);
    await uploadFileToDrive(GOOGLE_DRIVE_FILE_ID, updatedBuffer);
    
    // Update cache
    cachedData.controls[controlIndex] = updatedControl;
    cachedData.buffer = updatedBuffer;
    
    res.json(updatedControl);
  } catch (error) {
    console.error('Error updating control:', error);
    res.status(500).json({ error: 'Failed to update control' });
  }
});

app.delete('/api/controls/:id', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const controlId = req.params.id;
    const data = await getData();
    const controlIndex = data.controls.findIndex(c => c.mitigationID === controlId);
    
    if (controlIndex === -1) {
      return res.status(404).json({ error: 'Control not found' });
    }

    // Delete from Excel and upload
    const updatedBuffer = await deleteControlFromWorkbook(data.buffer, controlId);
    await uploadFileToDrive(GOOGLE_DRIVE_FILE_ID, updatedBuffer);
    
    // Update cache
    cachedData.controls.splice(controlIndex, 1);
    cachedData.buffer = updatedBuffer;
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting control:', error);
    res.status(500).json({ error: 'Failed to delete control' });
  }
});

// Serve static React build from ./dist
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});


// Export app for testing
if (process.env.NODE_ENV === 'test') {
  module.exports = app;
} else {
  // Start server only when not in test mode
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Unified server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Google Drive File ID: ${GOOGLE_DRIVE_FILE_ID}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
}
