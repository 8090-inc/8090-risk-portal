const express = require('express');
const router = express.Router();
const UseCaseService = require('../../services/UseCaseService.cjs');
const GoogleDrivePersistenceProvider = require('../../persistence/GoogleDrivePersistenceProvider.cjs');
const { asyncHandler } = require('../../utils/asyncHandler.cjs');
const {
  validateUseCase,
  validateUseCaseId,
  validateRiskAssociations
} = require('../../middleware/validateUseCase.cjs');

// Initialize service with persistence provider
// This will be properly initialized from the main server file
let useCaseService;

const initializeService = (driveService, fileId) => {
  const persistenceProvider = new GoogleDrivePersistenceProvider(driveService, fileId);
  useCaseService = new UseCaseService(persistenceProvider);
};

const getService = () => useCaseService;

/**
 * GET /api/v1/usecases
 * Get all use cases with optional filtering
 */
router.get('/', 
  asyncHandler(async (req, res) => {
    const filters = {
      businessArea: req.query.businessArea,
      aiCategory: req.query.aiCategory,
      status: req.query.status,
      owner: req.query.owner,
      search: req.query.search
    };
    
    const useCases = await useCaseService.getAllUseCases(filters);
    
    res.json({
      success: true,
      data: useCases,
      metadata: {
        count: useCases.length,
        filters: Object.keys(filters).filter(key => filters[key])
      }
    });
  })
);

/**
 * GET /api/v1/usecases/statistics
 * Get use case statistics
 */
router.get('/statistics', 
  asyncHandler(async (req, res) => {
    const statistics = await useCaseService.getUseCaseStatistics();
    
    res.json({
      success: true,
      data: statistics
    });
  })
);

/**
 * GET /api/v1/usecases/:id
 * Get a single use case by ID
 */
router.get('/:id',
  validateUseCaseId,
  asyncHandler(async (req, res) => {
    const useCase = await useCaseService.getUseCaseById(req.params.id);
    
    res.json({
      success: true,
      data: useCase
    });
  })
);

/**
 * GET /api/v1/usecases/:id/risks
 * Get risks associated with a use case
 */
router.get('/:id/risks',
  validateUseCaseId,
  asyncHandler(async (req, res) => {
    const risks = await useCaseService.getRisksForUseCase(req.params.id);
    
    res.json({
      success: true,
      data: risks,
      metadata: {
        count: risks.length,
        useCaseId: req.params.id
      }
    });
  })
);

/**
 * POST /api/v1/usecases
 * Create a new use case
 */
router.post('/',
  validateUseCase,
  asyncHandler(async (req, res) => {
    // Add audit fields
    const useCaseData = {
      ...req.body,
      createdBy: req.user.email,
      createdDate: new Date().toISOString()
    };
    
    const useCase = await useCaseService.createUseCase(useCaseData);
    
    res.status(201).json({
      success: true,
      data: useCase,
      message: 'Use case created successfully'
    });
  })
);

/**
 * PUT /api/v1/usecases/:id
 * Update an existing use case
 */
router.put('/:id',
  validateUseCaseId,
  validateUseCase,
  asyncHandler(async (req, res) => {
    // Add audit fields
    const updates = {
      ...req.body,
      lastUpdatedBy: req.user.email,
      lastUpdated: new Date().toISOString()
    };
    
    const useCase = await useCaseService.updateUseCase(req.params.id, updates);
    
    res.json({
      success: true,
      data: useCase,
      message: 'Use case updated successfully'
    });
  })
);

/**
 * PUT /api/v1/usecases/:id/risks
 * Update risk associations for a use case
 */
router.put('/:id/risks',
  validateUseCaseId,
  validateRiskAssociations,
  asyncHandler(async (req, res) => {
    const { riskIds } = req.body;
    
    const useCase = await useCaseService.updateUseCaseRisks(req.params.id, riskIds);
    
    res.json({
      success: true,
      data: useCase,
      message: 'Risk associations updated successfully'
    });
  })
);

/**
 * DELETE /api/v1/usecases/:id
 * Delete a use case
 */
router.delete('/:id',
  validateUseCaseId,
  asyncHandler(async (req, res) => {
    await useCaseService.deleteUseCase(req.params.id);
    
    res.status(204).send();
  })
);

module.exports = { router, initializeService, getService };