const ApiError = require('../errors/ApiError.cjs');
const { ErrorCodes } = require('../errors/errorCodes.cjs');

/**
 * Authentication middleware
 * Checks for authenticated user from IAP headers or session
 */
const authenticate = (req, res, next) => {
  try {
    // Skip auth in development mode
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      req.user = {
        email: 'dev@localhost',
        id: 'dev-user',
        name: 'Developer',
        role: 'admin',
        source: 'development'
      };
      return next();
    }
    
    // Check for IAP headers
    const iapEmail = req.headers['x-goog-authenticated-user-email'];
    const iapId = req.headers['x-goog-authenticated-user-id'];
    
    if (iapEmail && iapId) {
      // Extract email from IAP header format: "securetoken.google.com/project/user:email@example.com" or "accounts.google.com:email@example.com"
      const email = iapEmail.split(':').pop();
      const id = iapId.split(':').pop();
      
      // Extract name from email (part before @)
      const extractNameFromEmail = (email) => {
        if (!email) return 'User';
        const localPart = email.split('@')[0];
        // Convert firstname.lastname to "Firstname Lastname"
        return localPart
          .split('.')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
      };
      
      req.user = {
        email,
        id,
        name: extractNameFromEmail(email),
        role: email.endsWith('@dompe.com') ? 'admin' : 'viewer',
        source: 'iap'
      };
      
      return next();
    }
    
    // Check for development/test mode
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      // In development, create a test user
      req.user = {
        email: 'test.user@dompe.com',
        id: 'test.user',
        name: 'Test User',
        role: 'admin',
        source: 'test'
      };
      
      return next();
    }
    
    // No authentication found
    throw new ApiError(401, ErrorCodes.AUTH_REQUIRED);
    
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    
    return next(new ApiError(401, ErrorCodes.AUTH_INVALID));
  }
};

/**
 * Authorization middleware
 * Checks if user has required role
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, ErrorCodes.AUTH_REQUIRED));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, {
        code: 'FORBIDDEN',
        message: 'You do not have permission to access this resource',
        suggestion: 'Contact your administrator for access'
      }));
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};