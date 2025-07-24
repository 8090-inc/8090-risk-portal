const ApiError = require('../errors/ApiError.cjs');
const { ErrorCodes } = require('../errors/errorCodes.cjs');

// Valid values for use case fields
const VALID_BUSINESS_AREAS = [
  'General',
  'Medical',
  'R&D',
  'Commercial',
  'Manufacturing',
  'Pharmacovigilance',
  'Legal',
  'Clinical',
  'Quality Management',
  'Supply Chain',
  'Finance'
];

const VALID_AI_CATEGORIES = [
  'Content Generation',
  'Data Analysis',
  'Image Analysis',
  'Natural Language Processing',
  'Speech Recognition',
  'Machine Learning',
  'Computer Vision',
  'Predictive Analytics',
  'Process Automation',
  'Decision Support'
];

const VALID_STATUSES = [
  'Concept',
  'Under Review',
  'Approved',
  'In Development',
  'Pilot',
  'In Production',
  'On Hold',
  'Cancelled'
];

const VALID_COMPLEXITIES = ['Low', 'Medium', 'High'];
const VALID_LEVELS = ['Low', 'Medium', 'High'];

// Helper to sanitize text input
const sanitizeText = (value) => {
  if (!value) return value;
  // Remove any HTML tags and trim
  return value.toString().replace(/<[^>]*>/g, '').trim();
};

// Helper to validate UC-XXX ID format
const isValidUseCaseId = (id) => {
  return /^UC-\d{3}$/.test(id);
};

/**
 * Validate use case data
 */
const validateUseCase = (req, res, next) => {
  const errors = [];
  const useCase = req.body;
  
  // Required fields for POST
  if (req.method === 'POST') {
    if (!useCase.title) {
      errors.push({ field: 'title', message: 'Title is required' });
    }
  }
  
  // Validate title length
  if (useCase.title && useCase.title.length > 200) {
    errors.push({ field: 'title', message: 'Title must be 200 characters or less' });
  }
  
  // Validate description length
  if (useCase.description && useCase.description.length > 2000) {
    errors.push({ field: 'description', message: 'Description must be 2000 characters or less' });
  }
  
  // Validate business area
  if (useCase.businessArea && !VALID_BUSINESS_AREAS.includes(useCase.businessArea)) {
    errors.push({ 
      field: 'businessArea', 
      message: `Must be one of: ${VALID_BUSINESS_AREAS.join(', ')}` 
    });
  }
  
  // Validate AI categories
  if (useCase.aiCategories) {
    if (!Array.isArray(useCase.aiCategories)) {
      errors.push({ field: 'aiCategories', message: 'AI categories must be an array' });
    } else {
      useCase.aiCategories.forEach((category, index) => {
        if (!VALID_AI_CATEGORIES.includes(category)) {
          errors.push({ 
            field: `aiCategories[${index}]`, 
            message: `Invalid AI category: ${category}` 
          });
        }
      });
    }
  }
  
  // Validate status
  if (useCase.status && !VALID_STATUSES.includes(useCase.status)) {
    errors.push({ 
      field: 'status', 
      message: `Must be one of: ${VALID_STATUSES.join(', ')}` 
    });
  }
  
  // Validate nested objects
  if (useCase.objective) {
    ['currentState', 'futureState', 'solution', 'benefits'].forEach(field => {
      if (useCase.objective[field] && useCase.objective[field].length > 1000) {
        errors.push({ 
          field: `objective.${field}`, 
          message: 'Must be 1000 characters or less' 
        });
      }
    });
  }
  
  if (useCase.impact) {
    if (useCase.impact.impactPoints && !Array.isArray(useCase.impact.impactPoints)) {
      errors.push({ field: 'impact.impactPoints', message: 'Impact points must be an array' });
    }
    if (useCase.impact.costSaving !== undefined) {
      const costSaving = Number(useCase.impact.costSaving);
      if (isNaN(costSaving) || costSaving < 0) {
        errors.push({ field: 'impact.costSaving', message: 'Cost saving must be a non-negative number' });
      }
    }
    if (useCase.impact.effortMonths !== undefined) {
      const effortMonths = Number(useCase.impact.effortMonths);
      if (isNaN(effortMonths) || effortMonths < 0 || effortMonths > 120) {
        errors.push({ field: 'impact.effortMonths', message: 'Effort months must be between 0 and 120' });
      }
    }
  }
  
  if (useCase.execution) {
    if (useCase.execution.functionsImpacted && !Array.isArray(useCase.execution.functionsImpacted)) {
      errors.push({ field: 'execution.functionsImpacted', message: 'Functions impacted must be an array' });
    }
    if (useCase.execution.aiComplexity && !VALID_COMPLEXITIES.includes(useCase.execution.aiComplexity)) {
      errors.push({ field: 'execution.aiComplexity', message: 'AI complexity must be Low, Medium, or High' });
    }
    ['feasibility', 'value', 'risk'].forEach(field => {
      if (useCase.execution[field] && !VALID_LEVELS.includes(useCase.execution[field])) {
        errors.push({ field: `execution.${field}`, message: `${field} must be Low, Medium, or High` });
      }
    });
  }
  
  // Validate arrays
  if (useCase.stakeholders && !Array.isArray(useCase.stakeholders)) {
    errors.push({ field: 'stakeholders', message: 'Stakeholders must be an array' });
  }
  
  // Sanitize text fields
  if (useCase.title) useCase.title = sanitizeText(useCase.title);
  if (useCase.description) useCase.description = sanitizeText(useCase.description);
  if (useCase.notes) useCase.notes = sanitizeText(useCase.notes);
  if (useCase.owner) useCase.owner = sanitizeText(useCase.owner);
  
  // If there are errors, throw validation error
  if (errors.length > 0) {
    throw new ApiError(400, ErrorCodes.INVALID_USE_CASE_DATA, {
      details: `${errors.length} validation error(s)`,
      errors
    });
  }
  
  next();
};

/**
 * Validate use case ID parameter
 */
const validateUseCaseId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || !isValidUseCaseId(id)) {
    throw new ApiError(400, ErrorCodes.INVALID_USE_CASE_PATTERN, { id: id || 'undefined' });
  }
  
  next();
};

/**
 * Validate risk associations
 */
const validateRiskAssociations = (req, res, next) => {
  const errors = [];
  const { riskIds } = req.body;
  
  if (!riskIds) {
    errors.push({ field: 'riskIds', message: 'Risk IDs are required' });
  } else if (!Array.isArray(riskIds)) {
    errors.push({ field: 'riskIds', message: 'Risk IDs must be an array' });
  } else {
    riskIds.forEach((id, index) => {
      if (!id || !/^RISK-/.test(id)) {
        errors.push({ 
          field: `riskIds[${index}]`, 
          message: `Invalid risk ID format: ${id}` 
        });
      }
    });
  }
  
  if (errors.length > 0) {
    throw new ApiError(400, ErrorCodes.INVALID_RISK_ASSOCIATIONS || {
      code: 'INVALID_RISK_ASSOCIATIONS',
      message: `Risk association validation failed: ${errors.length} error(s)`,
      suggestion: 'Please check the API documentation'
    }, {
      details: `${errors.length} validation error(s)`,
      errors
    });
  }
  
  next();
};

module.exports = {
  validateUseCase,
  validateUseCaseId,
  validateRiskAssociations,
  VALID_BUSINESS_AREAS,
  VALID_AI_CATEGORIES,
  VALID_STATUSES,
  VALID_COMPLEXITIES,
  VALID_LEVELS
};