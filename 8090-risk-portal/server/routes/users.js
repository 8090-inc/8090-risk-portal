import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/firestore.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', requireRole(['admin']), async (req, res, next) => {
  try {
    const users = await db.getAllUsers();
    
    // Remove password hashes
    const sanitizedUsers = users.map(user => {
      const { passwordHash, ...userData } = user;
      return userData;
    });
    
    res.json(sanitizedUsers);
  } catch (error) {
    next(error);
  }
});

// Get user by ID (admin or self)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check permissions
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const user = await db.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove password hash
    delete user.passwordHash;
    
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update user (admin or self)
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Check permissions
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Only admins can change roles
    if (updates.role && req.user.role !== 'admin') {
      delete updates.role;
    }
    
    // Only admins can change active status
    if (updates.isActive !== undefined && req.user.role !== 'admin') {
      delete updates.isActive;
    }
    
    // Don't allow direct password updates through this endpoint
    delete updates.passwordHash;
    delete updates.password;
    
    const updatedUser = await db.updateUser(id, updates);
    
    // Log activity
    await db.createAuditLog({
      userId: req.user.id,
      action: 'update_user',
      details: { targetUserId: id, updates }
    });
    
    // Remove password hash
    delete updatedUser.passwordHash;
    
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// Change password (self only)
router.post('/:id/change-password', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    // Can only change own password
    if (req.user.id !== id) {
      return res.status(403).json({ error: 'Can only change your own password' });
    }
    
    // Validate inputs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    
    // Get user with password hash
    const user = await db.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await db.updateUser(id, { passwordHash: hashedPassword });
    
    // Invalidate all sessions except current
    const sessions = await db.getAllUserSessions(id);
    for (const session of sessions) {
      if (session.id !== req.sessionId) {
        await db.invalidateSession(session.id);
      }
    }
    
    // Log activity
    await db.createAuditLog({
      userId: req.user.id,
      action: 'change_password',
      details: { userId: id }
    });
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

// Toggle user active status (admin only)
router.post('/:id/toggle-status', requireRole(['admin']), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Can't deactivate self
    if (req.user.id === id) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }
    
    const user = await db.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const newStatus = !user.isActive;
    await db.updateUser(id, { isActive: newStatus });
    
    // If deactivating, invalidate all sessions
    if (!newStatus) {
      await db.invalidateAllUserSessions(id);
    }
    
    // Log activity
    await db.createAuditLog({
      userId: req.user.id,
      action: newStatus ? 'activate_user' : 'deactivate_user',
      details: { targetUserId: id }
    });
    
    res.json({ 
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
      isActive: newStatus
    });
  } catch (error) {
    next(error);
  }
});

export default router;