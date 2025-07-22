const express = require('express');
const { RelationshipService } = require('../../services/index.cjs');
const GoogleDrivePersistenceProvider = require('../../persistence/GoogleDrivePersistenceProvider.cjs');
const { validateRelationship } = require('../../middleware/validation.cjs');
const { asyncHandler } = require('../../utils/asyncHandler.cjs');

// Initialize service with persistence provider
let relationshipService;

const initializeService = (driveService, fileId) => {
  const persistenceProvider = new GoogleDrivePersistenceProvider(driveService, fileId);
  relationshipService = new RelationshipService(persistenceProvider);
};

// Risk -> Controls relationship routes
const createRiskControlsRouter = () => {
  const router = express.Router({ mergeParams: true });
  
  // GET /api/v1/risks/:riskId/controls
  router.get('/', asyncHandler(async (req, res) => {
    const result = await relationshipService.getControlsForRisk(req.params.riskId);
    
    res.json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  }));
  
  // PUT /api/v1/risks/:riskId/controls
  router.put('/', validateRelationship, asyncHandler(async (req, res) => {
    const { controlIds } = req.body;
    const result = await relationshipService.setControlsForRisk(req.params.riskId, controlIds);
    
    res.json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  }));
  
  // POST /api/v1/risks/:riskId/controls/:controlId
  router.post('/:controlId', asyncHandler(async (req, res) => {
    const result = await relationshipService.addControlToRisk(
      req.params.riskId, 
      req.params.controlId
    );
    
    res.status(201).json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  }));
  
  // DELETE /api/v1/risks/:riskId/controls/:controlId
  router.delete('/:controlId', asyncHandler(async (req, res) => {
    const result = await relationshipService.removeControlFromRisk(
      req.params.riskId, 
      req.params.controlId
    );
    
    res.json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  }));
  
  // POST /api/v1/risks/:riskId/controls/bulk
  router.post('/bulk', asyncHandler(async (req, res) => {
    const { controlIds } = req.body;
    const results = await relationshipService.linkMultipleControlsToRisk(
      req.params.riskId, 
      controlIds
    );
    
    res.status(201).json({
      success: true,
      data: results,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  }));
  
  return router;
};

// Control -> Risks relationship routes
const createControlRisksRouter = () => {
  const router = express.Router({ mergeParams: true });
  
  // GET /api/v1/controls/:controlId/risks
  router.get('/', asyncHandler(async (req, res) => {
    const result = await relationshipService.getRisksForControl(req.params.controlId);
    
    res.json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  }));
  
  // PUT /api/v1/controls/:controlId/risks
  router.put('/', validateRelationship, asyncHandler(async (req, res) => {
    const { riskIds } = req.body;
    const result = await relationshipService.setRisksForControl(req.params.controlId, riskIds);
    
    res.json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  }));
  
  // POST /api/v1/controls/:controlId/risks/:riskId
  router.post('/:riskId', asyncHandler(async (req, res) => {
    const result = await relationshipService.addRiskToControl(
      req.params.controlId, 
      req.params.riskId
    );
    
    res.status(201).json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  }));
  
  // DELETE /api/v1/controls/:controlId/risks/:riskId
  router.delete('/:riskId', asyncHandler(async (req, res) => {
    const result = await relationshipService.removeRiskFromControl(
      req.params.controlId, 
      req.params.riskId
    );
    
    res.json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  }));
  
  // POST /api/v1/controls/:controlId/risks/bulk
  router.post('/bulk', asyncHandler(async (req, res) => {
    const { riskIds } = req.body;
    const results = await relationshipService.linkMultipleRisksToControl(
      req.params.controlId, 
      riskIds
    );
    
    res.status(201).json({
      success: true,
      data: results,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  }));
  
  return router;
};

// Analysis endpoints
const createAnalysisRouter = () => {
  const router = express.Router();
  
  // GET /api/v1/relationships/matrix
  router.get('/matrix', asyncHandler(async (req, res) => {
    const matrix = await relationshipService.getRelationshipMatrix();
    
    res.json({
      success: true,
      data: matrix,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  }));
  
  // GET /api/v1/relationships/orphaned
  router.get('/orphaned', asyncHandler(async (req, res) => {
    const orphaned = await relationshipService.getOrphanedEntities();
    
    res.json({
      success: true,
      data: orphaned,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  }));
  
  // GET /api/v1/relationships/validate
  router.get('/validate', asyncHandler(async (req, res) => {
    const validation = await relationshipService.validateAllRelationships();
    
    res.json({
      success: true,
      data: validation,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  }));
  
  return router;
};

module.exports = { 
  riskControlsRouter: createRiskControlsRouter(),
  controlRisksRouter: createControlRisksRouter(),
  analysisRouter: createAnalysisRouter(),
  initializeService
};