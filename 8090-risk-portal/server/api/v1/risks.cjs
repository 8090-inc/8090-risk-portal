const express = require('express');
const router = express.Router();
const { RiskService } = require('../../services/index.cjs');
const GoogleDrivePersistenceProvider = require('../../persistence/GoogleDrivePersistenceProvider.cjs');
const { validateRisk } = require('../../middleware/validation.cjs');
const { asyncHandler } = require('../../utils/asyncHandler.cjs');

// Initialize service with persistence provider
// This will be properly initialized from the main server file
let riskService;

const initializeService = (driveService, fileId) => {
  const persistenceProvider = new GoogleDrivePersistenceProvider(driveService, fileId);
  riskService = new RiskService(persistenceProvider);
};

// GET /api/v1/risks
router.get('/', asyncHandler(async (req, res) => {
  const { 
    category, 
    minScore, 
    maxScore, 
    hasControls,
    page = 1, 
    limit = 20, 
    sort,
    fields 
  } = req.query;
  
  const options = {
    filters: {},
    pagination: { 
      page: parseInt(page), 
      limit: parseInt(limit) 
    }
  };
  
  // Apply filters
  if (category) options.filters.category = category;
  if (minScore) options.filters.minScore = parseInt(minScore);
  if (maxScore) options.filters.maxScore = parseInt(maxScore);
  if (hasControls !== undefined) options.filters.hasControls = hasControls === 'true';
  
  // Apply sorting
  if (sort) options.sort = sort;
  
  const result = await riskService.getAllRisks(options);
  
  // Filter fields if requested
  let risks = result.risks;
  if (fields) {
    const fieldList = fields.split(',');
    risks = risks.map(risk => {
      const filtered = {};
      fieldList.forEach(field => {
        if (risk[field] !== undefined) {
          filtered[field] = risk[field];
        }
      });
      return filtered;
    });
  }
  
  res.json({
    success: true,
    data: risks,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      timestamp: new Date().toISOString()
    }
  });
}));

// GET /api/v1/risks/statistics
router.get('/statistics', asyncHandler(async (req, res) => {
  const stats = await riskService.getRiskStatistics();
  
  res.json({
    success: true,
    data: stats,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// GET /api/v1/risks/high-risks
router.get('/high-risks', asyncHandler(async (req, res) => {
  const { threshold = 15 } = req.query;
  const highRisks = await riskService.getHighRisks(parseInt(threshold));
  
  res.json({
    success: true,
    data: highRisks,
    meta: {
      threshold: parseInt(threshold),
      count: highRisks.length,
      timestamp: new Date().toISOString()
    }
  });
}));

// GET /api/v1/risks/without-controls
router.get('/without-controls', asyncHandler(async (req, res) => {
  const unmitigatedRisks = await riskService.getRisksWithoutControls();
  
  res.json({
    success: true,
    data: unmitigatedRisks,
    meta: {
      count: unmitigatedRisks.length,
      timestamp: new Date().toISOString()
    }
  });
}));

// GET /api/v1/risks/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const risk = await riskService.getRiskById(req.params.id);
  
  res.json({
    success: true,
    data: risk,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// POST /api/v1/risks
router.post('/', validateRisk, asyncHandler(async (req, res) => {
  const newRisk = await riskService.createRisk(req.body);
  
  res.status(201).json({
    success: true,
    data: newRisk,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// PUT /api/v1/risks/:id
router.put('/:id', validateRisk, asyncHandler(async (req, res) => {
  const updatedRisk = await riskService.updateRisk(req.params.id, req.body);
  
  res.json({
    success: true,
    data: updatedRisk,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// PATCH /api/v1/risks/:id
router.patch('/:id', asyncHandler(async (req, res) => {
  // Partial update - no full validation required
  const updatedRisk = await riskService.updateRisk(req.params.id, req.body);
  
  res.json({
    success: true,
    data: updatedRisk,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// DELETE /api/v1/risks/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  await riskService.deleteRisk(req.params.id);
  
  res.status(204).send();
}));

// PUT /api/v1/risks/:id/controls
router.put('/:id/controls', asyncHandler(async (req, res) => {
  const { controlIds } = req.body;
  
  if (!Array.isArray(controlIds)) {
    return res.status(400).json({
      success: false,
      error: 'controlIds must be an array'
    });
  }
  
  const updatedRisk = await riskService.updateRisk(req.params.id, {
    relatedControlIds: controlIds
  });
  
  res.json({
    success: true,
    data: updatedRisk,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Export service getter for other modules
const getService = () => riskService;

module.exports = { router, initializeService, getService };