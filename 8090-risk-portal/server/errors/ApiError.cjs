/**
 * Custom API Error class for consistent error handling
 */
class ApiError extends Error {
  constructor(statusCode, errorCode, details = {}) {
    const message = ApiError.formatMessage(errorCode, details);
    super(message);
    
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = errorCode.code;
    this.errorCode = errorCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
  
  static formatMessage(errorCode, details) {
    let message = errorCode.message;
    
    // Replace placeholders with actual values
    Object.keys(details).forEach(key => {
      const placeholder = `{${key}}`;
      if (message.includes(placeholder)) {
        message = message.replace(placeholder, details[key]);
      }
    });
    
    return message;
  }
  
  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        suggestion: this.errorCode.suggestion
      },
      meta: {
        timestamp: this.timestamp,
        version: '1.0.0'
      }
    };
  }
}

module.exports = ApiError;