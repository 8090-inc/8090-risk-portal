/**
 * Main server with API v1 routes
 */

const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Import API routes and middleware
const apiRouter = require('./server/api/index.cjs');
const { errorHandler } = require('./server/middleware/errorHandler.cjs');
const { ApiError } = require('./server/errors/ApiError.cjs');
const { ErrorCodes } = require('./server/errors/errorCodes.cjs');

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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Goog-Authenticated-User-Email', 'X-Goog-Authenticated-User-Id']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', true);

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Google Drive Configuration
const GOOGLE_DRIVE_FILE_ID = process.env.GOOGLE_DRIVE_FILE_ID || '1OzrkAUQTWY7VUNrX-_akCWIuU2ALR3sm';
console.log(`Server using Google Drive file ID: ${GOOGLE_DRIVE_FILE_ID}`);
console.log(`Environment: ${process.env.NODE_ENV}`);
let driveService = null;

// Initialize Google Drive service
const initializeDriveService = async () => {
  try {
    let credentials;
    
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    } else if (fs.existsSync('./service-account-key.json')) {
      credentials = JSON.parse(fs.readFileSync('./service-account-key.json', 'utf8'));
    } else {
      throw new Error('No Google service account credentials found');
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    driveService = google.drive({ version: 'v3', auth });
    
    console.log('Service Account Email:', credentials.client_email);
    console.log('Google Drive service initialized successfully');
    
    // Initialize API services with drive service
    apiRouter.initializeServices(driveService, GOOGLE_DRIVE_FILE_ID);
    
    return driveService;
  } catch (error) {
    console.error('Failed to initialize Google Drive:', error);
    throw error;
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    driveService: driveService ? 'initialized' : 'not initialized',
    version: '1.0.0'
  });
});

// Legacy authentication endpoint for backward compatibility
app.get('/api/auth/me', (req, res) => {
  console.log('=== /api/auth/me called ===');
  console.log('Headers:', req.headers);
  
  // Extract user from IAP headers
  const email = req.headers['x-goog-authenticated-user-email'] || '';
  const userId = req.headers['x-goog-authenticated-user-id'] || '';
  
  // Handle both accounts.google.com and securetoken.google.com formats
  const cleanEmail = email.split(':').pop() || '';
  const cleanUserId = userId.split(':').pop() || '';
  
  // Extract name from email (part before @)
  const extractNameFromEmail = (email) => {
    if (!email) return 'User';
    const localPart = email.split('@')[0];
    // Convert firstname.lastname to "Firstname Lastname"
    return localPart
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };
  
  const user = email ? {
    id: cleanUserId,
    email: cleanEmail,
    name: extractNameFromEmail(cleanEmail),
    role: 'viewer', // Default role - should be determined from user database
    department: 'IT Operations', // Default department - should be from user database
    isActive: true,
    emailVerified: true,
    createdAt: new Date(),
    lastLogin: new Date()
  } : null;
  
  // For local development, always return authenticated with a test user
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || !email) {
    res.json({
      authenticated: true,
      user: {
        id: 'local-user-id',
        email: 'local.user@dompe.com',
        name: 'Local User',
        role: 'admin',
        department: 'IT Operations',
        isActive: true,
        emailVerified: true,
        createdAt: new Date(),
        lastLogin: new Date()
      }
    });
  } else {
    res.json({
      authenticated: !!user,
      user: user
    });
  }
});

// Mount API routes
app.use('/api', apiRouter.router);

// Static file serving (if needed)
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

// Auth pages
app.get('/auth.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize and start server
const startServer = async () => {
  try {
    await initializeDriveService();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API Version: v1`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();