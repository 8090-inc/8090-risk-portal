/**
 * Comprehensive error codes for the API
 * Each error has a code, message template, and suggestion for resolution
 */

const ErrorCodes = {
  // Authentication Errors (401)
  AUTH_REQUIRED: {
    code: 'AUTH_REQUIRED',
    message: 'Authentication is required to access this resource',
    suggestion: 'Please ensure you are logged in and your session is valid'
  },
  AUTH_INVALID: {
    code: 'AUTH_INVALID',
    message: 'Invalid authentication credentials',
    suggestion: 'Please check your credentials and try again'
  },
  
  // Resource Not Found Errors (404)
  RISK_NOT_FOUND: {
    code: 'RISK_NOT_FOUND',
    message: 'Risk with ID "{id}" not found in the system',
    suggestion: 'Verify the risk ID exists. List all risks: GET /api/v1/risks'
  },
  CONTROL_NOT_FOUND: {
    code: 'CONTROL_NOT_FOUND',
    message: 'Control with ID "{id}" not found in the system',
    suggestion: 'Verify the control ID exists. List all controls: GET /api/v1/controls'
  },
  
  // Validation Errors (400)
  INVALID_RISK_DATA: {
    code: 'INVALID_RISK_DATA',
    message: 'Risk data validation failed: {details}',
    suggestion: 'Review the required fields and data types in the API documentation'
  },
  INVALID_CONTROL_DATA: {
    code: 'INVALID_CONTROL_DATA',
    message: 'Control data validation failed: {details}',
    suggestion: 'Review the required fields and data types in the API documentation'
  },
  INVALID_LIKELIHOOD_SCORE: {
    code: 'INVALID_LIKELIHOOD_SCORE',
    message: 'Likelihood score must be between 1 and 5, received: {value}',
    suggestion: 'Use integer values 1-5 where 1=Very Low, 5=Very High'
  },
  INVALID_IMPACT_SCORE: {
    code: 'INVALID_IMPACT_SCORE',
    message: 'Impact score must be between 1 and 5, received: {value}',
    suggestion: 'Use integer values 1-5 where 1=Very Low, 5=Very High'
  },
  MISSING_REQUIRED_FIELD: {
    code: 'MISSING_REQUIRED_FIELD',
    message: 'Required field "{field}" is missing from the request',
    suggestion: 'Include all required fields: {requiredFields}'
  },
  INVALID_FIELD_TYPE: {
    code: 'INVALID_FIELD_TYPE',
    message: 'Field "{field}" must be of type {expectedType}, received {actualType}',
    suggestion: 'Ensure all fields have the correct data type'
  },
  
  // Business Logic Errors (422)
  DUPLICATE_RISK_NAME: {
    code: 'DUPLICATE_RISK_NAME',
    message: 'A risk with name "{name}" already exists',
    suggestion: 'Use a unique risk name or update the existing risk'
  },
  DUPLICATE_CONTROL_ID: {
    code: 'DUPLICATE_CONTROL_ID',
    message: 'A control with ID "{id}" already exists',
    suggestion: 'Use a unique control ID'
  },
  DUPLICATE_RELATIONSHIP: {
    code: 'DUPLICATE_RELATIONSHIP',
    message: 'This relationship already exists',
    suggestion: 'The risk and control are already linked'
  },
  INVALID_CONTROL_PATTERN: {
    code: 'INVALID_CONTROL_PATTERN',
    message: 'Control ID "{id}" does not match required pattern (XXX-00)',
    suggestion: 'Use format: ACC-01, SEC-02, LOG-03, GOV-04, TEST-99'
  },
  CIRCULAR_RELATIONSHIP: {
    code: 'CIRCULAR_RELATIONSHIP',
    message: 'Cannot create circular relationship between risk and control',
    suggestion: 'Review the relationship hierarchy to avoid circular dependencies'
  },
  INVALID_RISK_CATEGORY: {
    code: 'INVALID_RISK_CATEGORY',
    message: 'Risk category "{category}" is not valid',
    suggestion: 'Use one of: Behavioral Risks, Accuracy, Transparency Risks, Security and Data Risks, Business/Cost Related Risks, AI Human Impact Risks, Other Risks'
  },
  RELATIONSHIP_NOT_FOUND: {
    code: 'RELATIONSHIP_NOT_FOUND',
    message: 'Relationship between risk "{riskId}" and control "{controlId}" not found',
    suggestion: 'Verify both the risk and control exist and are related'
  },
  
  // Server Errors (500)
  PERSISTENCE_ERROR: {
    code: 'PERSISTENCE_ERROR',
    message: 'Failed to save changes to Google Drive: {details}',
    suggestion: 'This is temporary. Please retry in a few moments'
  },
  EXCEL_PARSE_ERROR: {
    code: 'EXCEL_PARSE_ERROR',
    message: 'Failed to parse Excel file: {details}',
    suggestion: 'Contact support if this persists. File may be corrupted'
  },
  GOOGLE_DRIVE_ERROR: {
    code: 'GOOGLE_DRIVE_ERROR',
    message: 'Failed to access Google Drive: {details}',
    suggestion: 'Check Google Drive permissions and service account configuration'
  },
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred: {details}',
    suggestion: 'Please try again later or contact support if the issue persists'
  }
};

module.exports = { ErrorCodes };