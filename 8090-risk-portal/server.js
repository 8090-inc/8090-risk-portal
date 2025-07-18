import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Trust proxy
app.set('trust proxy', true);

// Serve auth.html for IAP authentication
app.use('/auth.html', express.static(path.join(__dirname, 'public')));
app.use('/gcip-iap-bundle.js', express.static(path.join(__dirname, 'public')));

// Handle IAP authentication mode requests
app.use((req, res, next) => {
  // Check if this is an IAP authentication request
  if (req.query['gcp-iap-mode'] === 'GCIP_AUTHENTICATING') {
    // This is IAP trying to establish a session after GCIP authentication
    // We should NOT intercept this - let it pass through to IAP
    // IAP will handle the token validation and session creation
    console.log('IAP GCIP authentication request detected, passing through...');
  }
  next();
});

// IAP user identity middleware
app.use((req, res, next) => {
  const iapEmail = req.header('X-Goog-Authenticated-User-Email');
  const iapUserId = req.header('X-Goog-Authenticated-User-Id');
  
  if (iapEmail) {
    // Extract email from the IAP header format: accounts.google.com:user@example.com
    const email = iapEmail.split(':')[1];
    const userId = iapUserId ? iapUserId.split(':')[1] : null;
    
    // Attach user info to request
    req.user = {
      email: email,
      id: userId || email.split('@')[0],
      name: email.split('@')[0],
      role: 'user' // In production, you'd map roles based on email/domain
    };
  } else if (process.env.NODE_ENV !== 'production') {
    // Development mode: simulate IAP authentication
    req.user = {
      email: 'test.user@dompe.com',
      id: 'test.user',
      name: 'test.user',
      role: 'admin'
    };
  }
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Current user endpoint - returns IAP authenticated user
app.get('/api/auth/me', (req, res) => {
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

// Basic risks endpoint - now protected by IAP
app.get('/api/risks', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  res.json([
    {
      id: 'AIR-01',
      risk: 'Sample Risk',
      riskCategory: 'AI Human Impact Risks',
      initialScoring: { likelihood: 3, impact: 4, riskLevel: 12 },
      residualScoring: { likelihood: 2, impact: 3, riskLevel: 6 },
      createdBy: req.user.email
    }
  ]);
});

// Basic controls endpoint - now protected by IAP
app.get('/api/controls', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  res.json([
    {
      mitigationID: 'CTRL-01',
      mitigationDescription: 'Sample Control',
      category: 'Security & Data Privacy',
      implementationStatus: 'Implemented',
      assignedTo: req.user.email
    }
  ]);
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

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Unified server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});