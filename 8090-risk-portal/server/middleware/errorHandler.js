export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Default error
  let status = err.status || 500;
  let message = err.message || 'Internal server error';
  
  // Firestore specific errors
  if (err.code === 'permission-denied') {
    status = 403;
    message = 'Permission denied';
  } else if (err.code === 'not-found') {
    status = 404;
    message = 'Resource not found';
  } else if (err.code === 'already-exists') {
    status = 409;
    message = 'Resource already exists';
  } else if (err.code === 'invalid-argument') {
    status = 400;
    message = 'Invalid request data';
  }
  
  // Send error response
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};