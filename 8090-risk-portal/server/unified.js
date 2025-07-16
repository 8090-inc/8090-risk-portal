const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

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

// Import and use routes with error handling
try {
  const authRoutes = require('./routes/auth.js');
  const usersRoutes = require('./routes/users.js');
  const { authenticateToken } = require('./middleware/auth.js');
  
  // API Routes
  app.use('/api/auth', authRoutes.default || authRoutes);
  app.use('/api/users', authenticateToken, usersRoutes.default || usersRoutes);
  
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
} catch (error) {
  console.error('Error loading routes:', error);
  // Continue without routes if they fail to load
}

// Serve static files from React build
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Handle React routing - must be last
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
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

module.exports = app;