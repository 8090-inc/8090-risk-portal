import jwt from 'jsonwebtoken';
import db from '../db/firestore.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    // Verify JWT token
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if session is still active
    const session = await db.getSessionByToken(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
    
    // Get user data
    const user = await db.getUserById(session.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    
    // Update session activity
    await db.updateSessionActivity(session.id);
    
    // Attach user to request
    req.user = user;
    req.sessionId = session.id;
    
    // Log activity
    await db.createAuditLog({
      userId: user.id,
      action: 'api_request',
      details: {
        method: req.method,
        path: req.path,
        ip: req.ip
      }
    });
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};