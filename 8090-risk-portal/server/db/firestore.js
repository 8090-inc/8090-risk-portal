import { Firestore } from '@google-cloud/firestore';
import bcrypt from 'bcryptjs';

// Initialize Firestore
const firestore = new Firestore({
  projectId: process.env.GCP_PROJECT_ID || 'dompe-dev-439304',
});

// Collections
const COLLECTIONS = {
  users: 'users',
  sessions: 'sessions',
  auditLogs: 'audit_logs',
  passwordResetTokens: 'password_reset_tokens',
  risks: 'risks',
  controls: 'controls',
};

// User functions
export const createUser = async (userData) => {
  const { email, password, name, role, department } = userData;
  
  // Check if user exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create user document
  const userRef = firestore.collection(COLLECTIONS.users).doc();
  const user = {
    id: userRef.id,
    email,
    passwordHash: hashedPassword,
    name,
    role,
    department,
    isActive: true,
    emailVerified: false,
    createdAt: Firestore.FieldValue.serverTimestamp(),
    updatedAt: Firestore.FieldValue.serverTimestamp(),
  };
  
  await userRef.set(user);
  
  // Remove password hash before returning
  delete user.passwordHash;
  return user;
};

export const getUserByEmail = async (email) => {
  const snapshot = await firestore
    .collection(COLLECTIONS.users)
    .where('email', '==', email)
    .limit(1)
    .get();
  
  if (snapshot.empty) {
    return null;
  }
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

export const getUserById = async (userId) => {
  const doc = await firestore.collection(COLLECTIONS.users).doc(userId).get();
  
  if (!doc.exists) {
    return null;
  }
  
  return { id: doc.id, ...doc.data() };
};

export const updateUser = async (userId, updates) => {
  const userRef = firestore.collection(COLLECTIONS.users).doc(userId);
  
  await userRef.update({
    ...updates,
    updatedAt: Firestore.FieldValue.serverTimestamp(),
  });
  
  const updated = await userRef.get();
  return { id: updated.id, ...updated.data() };
};

export const getAllUsers = async () => {
  const snapshot = await firestore
    .collection(COLLECTIONS.users)
    .orderBy('createdAt', 'desc')
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Session functions
export const createSession = async (userId, token, refreshToken) => {
  const sessionRef = firestore.collection(COLLECTIONS.sessions).doc();
  const session = {
    id: sessionRef.id,
    userId,
    token,
    refreshToken,
    isActive: true,
    createdAt: Firestore.FieldValue.serverTimestamp(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    lastActivity: Firestore.FieldValue.serverTimestamp(),
  };
  
  await sessionRef.set(session);
  return session;
};

export const getSessionByToken = async (token) => {
  const snapshot = await firestore
    .collection(COLLECTIONS.sessions)
    .where('token', '==', token)
    .where('isActive', '==', true)
    .limit(1)
    .get();
  
  if (snapshot.empty) {
    return null;
  }
  
  const doc = snapshot.docs[0];
  const session = { id: doc.id, ...doc.data() };
  
  // Check if expired
  if (session.expiresAt.toDate() < new Date()) {
    await invalidateSession(session.id);
    return null;
  }
  
  return session;
};

export const updateSessionActivity = async (sessionId) => {
  const sessionRef = firestore.collection(COLLECTIONS.sessions).doc(sessionId);
  
  await sessionRef.update({
    lastActivity: Firestore.FieldValue.serverTimestamp(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000), // Extend by 30 minutes
  });
};

export const invalidateSession = async (sessionId) => {
  const sessionRef = firestore.collection(COLLECTIONS.sessions).doc(sessionId);
  
  await sessionRef.update({
    isActive: false,
    invalidatedAt: Firestore.FieldValue.serverTimestamp(),
  });
};

export const getAllUserSessions = async (userId) => {
  const snapshot = await firestore
    .collection(COLLECTIONS.sessions)
    .where('userId', '==', userId)
    .where('isActive', '==', true)
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const invalidateAllUserSessions = async (userId) => {
  const snapshot = await firestore
    .collection(COLLECTIONS.sessions)
    .where('userId', '==', userId)
    .where('isActive', '==', true)
    .get();
  
  const batch = firestore.batch();
  
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, {
      isActive: false,
      invalidatedAt: Firestore.FieldValue.serverTimestamp(),
    });
  });
  
  await batch.commit();
};

// Audit log functions
export const createAuditLog = async (logData) => {
  const logRef = firestore.collection(COLLECTIONS.auditLogs).doc();
  const log = {
    id: logRef.id,
    ...logData,
    timestamp: Firestore.FieldValue.serverTimestamp(),
  };
  
  await logRef.set(log);
  return log;
};

export const getAuditLogs = async (filters = {}) => {
  let query = firestore.collection(COLLECTIONS.auditLogs);
  
  if (filters.userId) {
    query = query.where('userId', '==', filters.userId);
  }
  
  if (filters.action) {
    query = query.where('action', '==', filters.action);
  }
  
  if (filters.startDate) {
    query = query.where('timestamp', '>=', filters.startDate);
  }
  
  if (filters.endDate) {
    query = query.where('timestamp', '<=', filters.endDate);
  }
  
  const snapshot = await query
    .orderBy('timestamp', 'desc')
    .limit(filters.limit || 100)
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Password reset functions
export const createPasswordResetToken = async (userId, email) => {
  // Generate secure token
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const tokenRef = firestore.collection(COLLECTIONS.passwordResetTokens).doc();
  const resetToken = {
    id: tokenRef.id,
    userId,
    email,
    token,
    used: false,
    createdAt: Firestore.FieldValue.serverTimestamp(),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  };
  
  await tokenRef.set(resetToken);
  return token;
};

export const getPasswordResetToken = async (token) => {
  const snapshot = await firestore
    .collection(COLLECTIONS.passwordResetTokens)
    .where('token', '==', token)
    .where('used', '==', false)
    .limit(1)
    .get();
  
  if (snapshot.empty) {
    return null;
  }
  
  const doc = snapshot.docs[0];
  const resetToken = { id: doc.id, ...doc.data() };
  
  // Check if expired
  if (resetToken.expiresAt.toDate() < new Date()) {
    return null;
  }
  
  return resetToken;
};

export const markPasswordResetTokenAsUsed = async (tokenId) => {
  const tokenRef = firestore.collection(COLLECTIONS.passwordResetTokens).doc(tokenId);
  
  await tokenRef.update({
    used: true,
    usedAt: Firestore.FieldValue.serverTimestamp(),
  });
};

// Initialize default admin user
export const initializeDefaultAdmin = async () => {
  try {
    const adminEmail = 'admin@8090.com';
    const existingAdmin = await getUserByEmail(adminEmail);
    
    if (!existingAdmin) {
      console.log('Creating default admin user...');
      await createUser({
        email: adminEmail,
        password: 'Admin@123',
        name: 'System Administrator',
        role: 'admin',
        department: 'IT',
      });
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Error initializing default admin:', error);
  }
};

// Clean up expired sessions and tokens
export const cleanupExpiredData = async () => {
  const now = new Date();
  
  // Clean up expired sessions
  const expiredSessions = await firestore
    .collection(COLLECTIONS.sessions)
    .where('expiresAt', '<', now)
    .where('isActive', '==', true)
    .get();
  
  const sessionBatch = firestore.batch();
  expiredSessions.docs.forEach(doc => {
    sessionBatch.update(doc.ref, {
      isActive: false,
      expiredAt: Firestore.FieldValue.serverTimestamp(),
    });
  });
  await sessionBatch.commit();
  
  // Clean up expired password reset tokens
  const expiredTokens = await firestore
    .collection(COLLECTIONS.passwordResetTokens)
    .where('expiresAt', '<', now)
    .where('used', '==', false)
    .get();
  
  const tokenBatch = firestore.batch();
  expiredTokens.docs.forEach(doc => {
    tokenBatch.delete(doc.ref);
  });
  await tokenBatch.commit();
};

export default {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
  getAllUsers,
  createSession,
  getSessionByToken,
  updateSessionActivity,
  invalidateSession,
  getAllUserSessions,
  invalidateAllUserSessions,
  createAuditLog,
  getAuditLogs,
  createPasswordResetToken,
  getPasswordResetToken,
  markPasswordResetTokenAsUsed,
  initializeDefaultAdmin,
  cleanupExpiredData,
};