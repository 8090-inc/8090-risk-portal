const ApiError = require('../errors/ApiError.cjs');
const ErrorCodes = require('../errors/errorCodes.cjs');
const { isValidControlId } = require('../utils/idGenerator.cjs');

/**
 * Valid risk categories
 */
const VALID_RISK_CATEGORIES = [
  'Behavioral Risks',
  'Accuracy',
  'Transparency Risks',
  'Security and Data Risks',
  'Business/Cost Related Risks',
  'AI Human Impact Risks',
  'Other Risks'
];

/**
 * Valid effectiveness levels
 */
const VALID_EFFECTIVENESS_LEVELS = ['High', 'Medium', 'Low', 'Not Assessed'];

/**
 * Valid implementation statuses
 */
const VALID_IMPLEMENTATION_STATUSES = ['Implemented', 'In Progress', 'Planned', 'Not Started'];

/**
 * Validate risk data
 */
const validateRisk = (req, res, next) => {
  const errors = [];
  const risk = req.body;
  
  // Required fields for POST
  if (req.method === 'POST') {
    if (!risk.risk) {
      errors.push({ field: 'risk', message: 'Risk name is required' });
    }
    if (!risk.riskCategory) {
      errors.push({ field: 'riskCategory', message: 'Risk category is required' });
    }
  }
  
  // Validate risk category if provided
  if (risk.riskCategory && !VALID_RISK_CATEGORIES.includes(risk.riskCategory)) {
    errors.push({ 
      field: 'riskCategory', 
      message: `Must be one of: ${VALID_RISK_CATEGORIES.join(', ')}` 
    });
  }
  
  // Validate scoring if provided
  if (risk.initialScoring) {
    if (risk.initialScoring.likelihood !== undefined) {
      const likelihood = risk.initialScoring.likelihood;
      if (!Number.isInteger(likelihood) || likelihood < 1 || likelihood > 5) {
        errors.push({ 
          field: 'initialScoring.likelihood', 
          message: 'Must be an integer between 1 and 5' 
        });
      }
    }
    
    if (risk.initialScoring.impact !== undefined) {
      const impact = risk.initialScoring.impact;
      if (!Number.isInteger(impact) || impact < 1 || impact > 5) {
        errors.push({ 
          field: 'initialScoring.impact', 
          message: 'Must be an integer between 1 and 5' 
        });
      }
    }
  }
  
  // Validate residual scoring if provided
  if (risk.residualScoring) {
    if (risk.residualScoring.likelihood !== undefined) {
      const likelihood = risk.residualScoring.likelihood;
      if (!Number.isInteger(likelihood) || likelihood < 1 || likelihood > 5) {
        errors.push({ 
          field: 'residualScoring.likelihood', 
          message: 'Must be an integer between 1 and 5' 
        });
      }
    }
    
    if (risk.residualScoring.impact !== undefined) {
      const impact = risk.residualScoring.impact;
      if (!Number.isInteger(impact) || impact < 1 || impact > 5) {
        errors.push({ 
          field: 'residualScoring.impact', 
          message: 'Must be an integer between 1 and 5' 
        });
      }
    }
  }
  
  // Validate arrays
  if (risk.proposedOversightOwnership && !Array.isArray(risk.proposedOversightOwnership)) {
    errors.push({ 
      field: 'proposedOversightOwnership', 
      message: 'Must be an array of strings' 
    });
  }
  
  if (risk.proposedSupport && !Array.isArray(risk.proposedSupport)) {
    errors.push({ 
      field: 'proposedSupport', 
      message: 'Must be an array of strings' 
    });
  }
  
  if (risk.relatedControlIds && !Array.isArray(risk.relatedControlIds)) {
    errors.push({ 
      field: 'relatedControlIds', 
      message: 'Must be an array of control IDs' 
    });
  }
  
  // If there are errors, throw validation error
  if (errors.length > 0) {
    throw new ApiError(400, ErrorCodes.INVALID_RISK_DATA, {
      details: `${errors.length} validation error(s)`,
      errors
    });
  }
  
  next();
};

/**
 * Validate control data
 */
const validateControl = (req, res, next) => {
  const errors = [];
  const control = req.body;
  
  // Required fields for POST
  if (req.method === 'POST') {
    if (!control.mitigationID) {
      errors.push({ field: 'mitigationID', message: 'Control ID is required' });
    } else if (!isValidControlId(control.mitigationID)) {
      errors.push({ 
        field: 'mitigationID', 
        message: 'Must match pattern: ACC-01, SEC-02, LOG-03, GOV-04, TEST-99' 
      });
    }
    
    if (!control.mitigationDescription) {
      errors.push({ field: 'mitigationDescription', message: 'Control description is required' });
    }
  }
  
  // Validate control ID pattern for updates
  if (req.method === 'PUT' && control.mitigationID) {
    if (!isValidControlId(control.mitigationID)) {
      errors.push({ 
        field: 'mitigationID', 
        message: 'Must match pattern: ACC-01, SEC-02, LOG-03, GOV-04, TEST-99' 
      });
    }
  }
  
  // Validate effectiveness if provided
  if (control.effectiveness && !VALID_EFFECTIVENESS_LEVELS.includes(control.effectiveness)) {
    errors.push({ 
      field: 'effectiveness', 
      message: `Must be one of: ${VALID_EFFECTIVENESS_LEVELS.join(', ')}` 
    });
  }
  
  // Validate implementation status if provided
  if (control.implementationStatus && !VALID_IMPLEMENTATION_STATUSES.includes(control.implementationStatus)) {
    errors.push({ 
      field: 'implementationStatus', 
      message: `Must be one of: ${VALID_IMPLEMENTATION_STATUSES.join(', ')}` 
    });
  }
  
  // Validate arrays
  if (control.relatedRiskIds && !Array.isArray(control.relatedRiskIds)) {
    errors.push({ 
      field: 'relatedRiskIds', 
      message: 'Must be an array of risk IDs' 
    });
  }
  
  // If there are errors, throw validation error
  if (errors.length > 0) {
    throw new ApiError(400, ErrorCodes.INVALID_CONTROL_DATA, {
      details: `${errors.length} validation error(s)`,
      errors
    });
  }
  
  next();
};

/**
 * Validate relationship data
 */
const validateRelationship = (req, res, next) => {
  const errors = [];
  const { controlIds, riskIds } = req.body;
  
  // Validate control IDs
  if (controlIds !== undefined) {
    if (!Array.isArray(controlIds)) {
      errors.push({ field: 'controlIds', message: 'Must be an array of control IDs' });
    } else {
      controlIds.forEach((id, index) => {
        if (!isValidControlId(id)) {
          errors.push({ 
            field: `controlIds[${index}]`, 
            message: `Invalid control ID format: ${id}` 
          });
        }
      });
    }
  }
  
  // Validate risk IDs
  if (riskIds !== undefined) {
    if (!Array.isArray(riskIds)) {
      errors.push({ field: 'riskIds', message: 'Must be an array of risk IDs' });
    } else {
      riskIds.forEach((id, index) => {
        if (!id || !id.startsWith('RISK-')) {
          errors.push({ 
            field: `riskIds[${index}]`, 
            message: `Invalid risk ID format: ${id}` 
          });
        }
      });
    }
  }
  
  // If there are errors, throw validation error
  if (errors.length > 0) {
    throw new ApiError(400, ErrorCodes.INVALID_RISK_DATA, {
      details: `${errors.length} validation error(s)`,
      errors
    });
  }
  
  next();
};

module.exports = {
  validateRisk,
  validateControl,
  validateRelationship,
  VALID_RISK_CATEGORIES,
  VALID_EFFECTIVENESS_LEVELS,
  VALID_IMPLEMENTATION_STATUSES
};