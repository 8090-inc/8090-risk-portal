/**
 * Upload API endpoints
 * Handles Excel file uploads for importing risks and controls
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { parseRisksFromWorkbook, parseControlsFromWorkbook } = require('../../utils/excelParser.cjs');
const { asyncHandler } = require('../../utils/asyncHandler.cjs');
const ApiError = require('../../errors/ApiError.cjs');
const { ErrorCodes } = require('../../errors/errorCodes.cjs');

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only Excel files
    const allowedMimeTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  }
});

// Service instances will be injected
let riskService, controlService;

const initializeServices = (riskSvc, controlSvc) => {
  riskService = riskSvc;
  controlService = controlSvc;
};

// POST /api/v1/upload/excel
router.post('/excel', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, {
      code: 'NO_FILE_UPLOADED',
      message: 'No file was uploaded',
      suggestion: 'Please select an Excel file to upload'
    });
  }

  try {
    // Parse the Excel file
    const buffer = req.file.buffer;
    const risks = await parseRisksFromWorkbook(buffer);
    const controls = await parseControlsFromWorkbook(buffer);

    // Statistics to return
    const stats = {
      risksFound: risks.length,
      controlsFound: controls.length,
      risksImported: 0,
      controlsImported: 0,
      risksSkipped: 0,
      controlsSkipped: 0,
      errors: []
    };

    // Import risks
    for (const risk of risks) {
      try {
        // Check if risk already exists
        const existingRisk = await riskService.getRiskById(risk.id).catch(() => null);
        
        if (existingRisk) {
          stats.risksSkipped++;
          stats.errors.push(`Risk ${risk.id} already exists`);
        } else {
          await riskService.createRisk(risk);
          stats.risksImported++;
        }
      } catch (error) {
        stats.errors.push(`Failed to import risk ${risk.id}: ${error.message}`);
      }
    }

    // Import controls
    for (const control of controls) {
      try {
        // Check if control already exists
        const existingControl = await controlService.getControlById(control.mitigationID).catch(() => null);
        
        if (existingControl) {
          stats.controlsSkipped++;
          stats.errors.push(`Control ${control.mitigationID} already exists`);
        } else {
          await controlService.createControl(control);
          stats.controlsImported++;
        }
      } catch (error) {
        stats.errors.push(`Failed to import control ${control.mitigationID}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      data: {
        message: 'File processed successfully',
        fileName: req.file.originalname,
        ...stats
      }
    });
  } catch (error) {
    throw new ApiError(500, ErrorCodes.EXCEL_PARSE_ERROR, {
      details: error.message
    });
  }
}));

module.exports = {
  router,
  initializeServices
};