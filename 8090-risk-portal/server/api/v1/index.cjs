const express = require('express');
const router = express.Router();
const risksApi = require('./risks.cjs');
const controlsApi = require('./controls.cjs');
const relationshipsApi = require('./relationships.cjs');
const uploadApi = require('./upload.cjs');
const useCasesApi = require('./usecases.cjs');
const { authenticate } = require('../../middleware/auth.cjs');

// Initialize services function to be called from main server
const initializeServices = (driveService, fileId) => {
  risksApi.initializeService(driveService, fileId);
  controlsApi.initializeService(driveService, fileId);
  relationshipsApi.initializeService(driveService, fileId);
  useCasesApi.initializeService(driveService, fileId);
  
  // Get services to pass to upload
  const riskService = risksApi.getService();
  const controlService = controlsApi.getService();
  uploadApi.initializeServices(riskService, controlService);
};

// Apply authentication to all routes
router.use(authenticate);

// Mount resource routers
router.use('/risks', risksApi.router);
router.use('/controls', controlsApi.router);
router.use('/upload', uploadApi.router);
router.use('/usecases', useCasesApi.router);

// Mount relationship routers
router.use('/risks/:riskId/controls', relationshipsApi.riskControlsRouter);
router.use('/controls/:controlId/risks', relationshipsApi.controlRisksRouter);
router.use('/relationships', relationshipsApi.analysisRouter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = { router, initializeServices };