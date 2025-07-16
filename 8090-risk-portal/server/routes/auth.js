import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from '../db/firestore.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Get user
    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is disabled' });
    }
    
    // Generate tokens
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30m' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    // Create session
    await db.createSession(user.id, token, refreshToken);
    
    // Log activity
    await db.createAuditLog({
      userId: user.id,
      action: 'login',
      details: { ip: req.ip }
    });
    
    // Remove sensitive data
    delete user.passwordHash;
    
    res.json({
      user,
      token,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
});

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, department } = req.body;
    
    // Validate required fields
    if (!email || !password || !name || !department) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    
    // Create user
    const user = await db.createUser({
      email,
      password,
      name,
      role: 'viewer', // Default role
      department
    });
    
    // Log activity
    await db.createAuditLog({
      userId: user.id,
      action: 'register',
      details: { email }
    });
    
    res.status(201).json({
      message: 'Registration successful',
      user
    });
  } catch (error) {
    if (error.message === 'User already exists') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    next(error);
  }
});

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }
    
    // Verify refresh token
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET || 'your-secret-key');
    
    if (payload.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    // Generate new access token
    const token = jwt.sign(
      { userId: payload.userId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30m' }
    );
    
    res.json({ token });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
    next(error);
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res, next) => {
  try {
    // Invalidate session
    await db.invalidateSession(req.sessionId);
    
    // Log activity
    await db.createAuditLog({
      userId: req.user.id,
      action: 'logout',
      details: { sessionId: req.sessionId }
    });
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

// Forgot password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    // Get user
    const user = await db.getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }
    
    // Create reset token
    const resetToken = await db.createPasswordResetToken(user.id, email);
    
    // In production, send email with reset link
    // For now, just return the token
    console.log(`Password reset token for ${email}: ${resetToken}`);
    
    // Log activity
    await db.createAuditLog({
      userId: user.id,
      action: 'password_reset_request',
      details: { email }
    });
    
    res.json({ 
      message: 'If the email exists, a reset link has been sent',
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (error) {
    next(error);
  }
});

// Reset password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password required' });
    }
    
    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    
    // Get reset token
    const resetToken = await db.getPasswordResetToken(token);
    if (!resetToken) {
      return res.status(401).json({ error: 'Invalid or expired reset token' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user password
    await db.updateUser(resetToken.userId, { passwordHash: hashedPassword });
    
    // Mark token as used
    await db.markPasswordResetTokenAsUsed(resetToken.id);
    
    // Invalidate all sessions
    await db.invalidateAllUserSessions(resetToken.userId);
    
    // Log activity
    await db.createAuditLog({
      userId: resetToken.userId,
      action: 'password_reset',
      details: { tokenId: resetToken.id }
    });
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  const user = { ...req.user };
  delete user.passwordHash;
  res.json(user);
});

export default router;