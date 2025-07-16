// This file handles the ES modules to CommonJS bridge
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './server/routes/auth.js';
import usersRoutes from './server/routes/users.js';
import { authenticateToken } from './server/middleware/auth.js';

// Load environment variables
dotenv.config();

// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for Cloud Run
app.set('trust proxy', true);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'risk-portal'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, usersRoutes);

// Protected API endpoints
app.get('/api/risks', authenticateToken, (req, res) => {
  res.json([
    {
      id: 'AIR-01',
      risk: 'Sample Risk',
      riskCategory: 'AI Human Impact Risks',
      initialScoring: { likelihood: 3, impact: 4, riskLevel: 12 },
      residualScoring: { likelihood: 2, impact: 3, riskLevel: 6 }
    }
  ]);
});

app.get('/api/controls', authenticateToken, (req, res) => {
  res.json([
    {
      mitigationID: 'CTRL-01',
      mitigationDescription: 'Sample Control',
      category: 'Security & Data Privacy',
      implementationStatus: 'Implemented'
    }
  ]);
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React routing - must be last
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Risk Portal server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});