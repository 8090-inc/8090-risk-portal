import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

// Middleware to verify IAP JWT and extract user info
export const verifyIAPJWT = async (req, res, next) => {
  // Skip verification in development
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  const iapJWT = req.header('X-Goog-IAP-JWT-Assertion');
  const expectedAudience = process.env.IAP_AUDIENCE; // Format: /projects/PROJECT_NUMBER/global/backendServices/SERVICE_ID

  if (!iapJWT) {
    return res.status(401).json({ error: 'No IAP JWT found' });
  }

  try {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken: iapJWT,
      audience: expectedAudience
    });
    
    const payload = ticket.getPayload();
    req.iapUser = {
      email: payload.email,
      userId: payload.sub,
      // Additional claims if needed
    };
    
    next();
  } catch (error) {
    console.error('IAP JWT verification failed:', error);
    return res.status(403).json({ error: 'Invalid IAP JWT' });
  }
};

// Simplified version that just trusts the IAP headers (less secure but simpler)
export const trustIAPHeaders = (req, res, next) => {
  // Skip in development
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  const iapEmail = req.header('X-Goog-Authenticated-User-Email');
  
  if (!iapEmail) {
    return res.status(401).json({ error: 'No IAP authentication found' });
  }

  // Extract email from the header format: accounts.google.com:user@example.com
  const email = iapEmail.split(':')[1];
  
  req.iapUser = {
    email: email,
    // The header also includes X-Goog-Authenticated-User-Id if needed
  };
  
  next();
};