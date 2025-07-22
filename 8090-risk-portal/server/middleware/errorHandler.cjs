const ApiError = require('../errors/ApiError.cjs');
const ErrorCodes = require('../errors/errorCodes.cjs');

/**
 * Global error handling middleware
 * Converts all errors to consistent API error responses
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });
  
  let apiError;
  
  // If it's already an ApiError, use it directly
  if (err instanceof ApiError) {
    apiError = err;
  } 
  // Convert validation errors
  else if (err.name === 'ValidationError') {
    apiError = new ApiError(400, ErrorCodes.INVALID_RISK_DATA, {
      details: err.message
    });
  }
  // Convert Mongoose/Database errors
  else if (err.code === 11000) {
    apiError = new ApiError(422, ErrorCodes.DUPLICATE_RISK_NAME, {
      name: err.keyValue?.risk || 'Unknown'
    });
  }
  // Default to internal server error
  else {
    apiError = new ApiError(500, ErrorCodes.INTERNAL_SERVER_ERROR, {
      details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
  
  // Add request ID if available
  const response = apiError.toJSON();
  if (req.id) {
    response.meta.requestId = req.id;
  }
  
  res.status(apiError.statusCode).json(response);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler
};