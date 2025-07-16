import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import { authenticateToken } from './middleware/auth.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy if behind Cloud Run
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', true);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/users', authenticateToken, usersRoutes);

// Simple risks endpoint (protected)
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

// Simple controls endpoint (protected)
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server with explicit host binding
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});