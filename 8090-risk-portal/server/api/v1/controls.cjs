const express = require('express');
const router = express.Router();
const { ControlService } = require('../../services/index.cjs');
const GoogleDrivePersistenceProvider = require('../../persistence/GoogleDrivePersistenceProvider.cjs');
const { validateControl } = require('../../middleware/validation.cjs');
const { asyncHandler } = require('../../utils/asyncHandler.cjs');

// Initialize service with persistence provider
let controlService;

const initializeService = (driveService, fileId) => {
  const persistenceProvider = new GoogleDrivePersistenceProvider(driveService, fileId);
  controlService = new ControlService(persistenceProvider);
};

// GET /api/v1/controls
router.get('/', asyncHandler(async (req, res) => {
  const { 
    category, 
    implementationStatus,
    effectiveness,
    hasRisks,
    compliance,
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
  if (implementationStatus) options.filters.implementationStatus = implementationStatus;
  if (effectiveness) options.filters.effectiveness = effectiveness;
  if (hasRisks !== undefined) options.filters.hasRisks = hasRisks === 'true';
  if (compliance) options.filters.compliance = compliance;
  
  // Apply sorting
  if (sort) options.sort = sort;
  
  const result = await controlService.getAllControls(options);
  
  // Filter fields if requested
  let controls = result.controls;
  if (fields) {
    const fieldList = fields.split(',');
    controls = controls.map(control => {
      const filtered = {};
      fieldList.forEach(field => {
        if (control[field] !== undefined) {
          filtered[field] = control[field];
        }
      });
      return filtered;
    });
  }
  
  res.json({
    success: true,
    data: controls,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      timestamp: new Date().toISOString()
    }
  });
}));

// GET /api/v1/controls/statistics
router.get('/statistics', asyncHandler(async (req, res) => {
  const stats = await controlService.getControlStatistics();
  
  res.json({
    success: true,
    data: stats,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// GET /api/v1/controls/by-category
router.get('/by-category', asyncHandler(async (req, res) => {
  const controlsByCategory = await controlService.getControlsByCategory();
  
  res.json({
    success: true,
    data: controlsByCategory,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// GET /api/v1/controls/without-risks
router.get('/without-risks', asyncHandler(async (req, res) => {
  const orphanedControls = await controlService.getControlsWithoutRisks();
  
  res.json({
    success: true,
    data: orphanedControls,
    meta: {
      count: orphanedControls.length,
      timestamp: new Date().toISOString()
    }
  });
}));

// GET /api/v1/controls/effectiveness-report
router.get('/effectiveness-report', asyncHandler(async (req, res) => {
  const report = await controlService.getControlEffectivenessReport();
  
  res.json({
    success: true,
    data: report,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// GET /api/v1/controls/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const control = await controlService.getControlById(req.params.id);
  
  res.json({
    success: true,
    data: control,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// POST /api/v1/controls
router.post('/', validateControl, asyncHandler(async (req, res) => {
  const newControl = await controlService.createControl(req.body);
  
  res.status(201).json({
    success: true,
    data: newControl,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// PUT /api/v1/controls/:id
router.put('/:id', validateControl, asyncHandler(async (req, res) => {
  const updatedControl = await controlService.updateControl(req.params.id, req.body);
  
  res.json({
    success: true,
    data: updatedControl,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// PATCH /api/v1/controls/:id
router.patch('/:id', asyncHandler(async (req, res) => {
  // Partial update - no full validation required
  const updatedControl = await controlService.updateControl(req.params.id, req.body);
  
  res.json({
    success: true,
    data: updatedControl,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// DELETE /api/v1/controls/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  await controlService.deleteControl(req.params.id);
  
  res.status(204).send();
}));

// PUT /api/v1/controls/:id/risks
router.put('/:id/risks', asyncHandler(async (req, res) => {
  const { riskIds } = req.body;
  
  if (!Array.isArray(riskIds)) {
    return res.status(400).json({
      success: false,
      error: 'riskIds must be an array'
    });
  }
  
  const updatedControl = await controlService.updateControl(req.params.id, {
    relatedRiskIds: riskIds
  });
  
  res.json({
    success: true,
    data: updatedControl,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}));

// Export service getter for other modules
const getService = () => controlService;

module.exports = { router, initializeService, getService };