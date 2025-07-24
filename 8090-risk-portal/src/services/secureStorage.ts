// Secure storage service for passwords and sensitive data
// Prepared for Google Cloud Secret Manager integration

import { User, Session } from '../types/auth.types';

// Storage mode based on environment
// const STORAGE_MODE = import.meta.env.VITE_AUTH_MODE || 'mock';

// Mock password hashing (for development)
const mockHashPassword = async (password: string): Promise<string> => {
  // Simulate bcrypt-like hash
  const salt = Math.random().toString(36).substring(2, 15);
  const hash = btoa(password + salt);
  return `$2b$10$${salt}$${hash}`;
};

const mockVerifyPassword = async (password: string, hash: string): Promise<boolean> => {
  // Extract salt from mock hash
  const parts = hash.split('$');
  if (parts.length < 5) return false;
  
  const salt = parts[3];
  const storedHash = parts[4];
  const testHash = btoa(password + salt);
  
  return testHash === storedHash;
};

// Generate secure random token
const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Mock database for development
class MockVaultDatabase {
  private users: Map<string, User> = new Map();
  private sessions: Map<string, Session> = new Map();
  private resetTokens: Map<string, { email: string; expires: Date }> = new Map();
  private passwordHistory: Map<string, string[]> = new Map();

  constructor() {
    // Initialize with a default admin user
    this.initializeDefaultUsers();
  }

  private async initializeDefaultUsers() {
    const adminUser = {
      id: 'admin-001',
      email: 'admin@8090.com',
      name: 'System Administrator',
      password: await mockHashPassword('Admin@123'),
      role: 'admin',
      department: 'IT Security',
      createdAt: new Date(),
      lastLogin: null,
      isActive: true,
      emailVerified: true,
    };

    this.users.set(adminUser.email, adminUser);
    this.passwordHistory.set(adminUser.id, [adminUser.password]);
  }

  async createUser(userData: Partial<User> & { password: string }): Promise<User> {
    const hashedPassword = await mockHashPassword(userData.password);
    const user = {
      ...userData,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      password: hashedPassword,
      createdAt: new Date(),
      isActive: true,
      emailVerified: false,
    };

    this.users.set(user.email, user);
    this.passwordHistory.set(user.id, [hashedPassword]);
    
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.get(email) || null;
  }

  async updateUser(email: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(email);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, ...updates };
    this.users.set(email, updatedUser);
    return updatedUser;
  }

  async verifyPassword(email: string, password: string): Promise<boolean> {
    const user = this.users.get(email);
    if (!user) return false;
    
    return mockVerifyPassword(password, user.password);
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await mockHashPassword(newPassword);
    
    // Find user by ID
    let userEmail: string | null = null;
    for (const [email, user] of this.users.entries()) {
      if (user.id === userId) {
        userEmail = email;
        break;
      }
    }
    
    if (!userEmail) throw new Error('User not found');
    
    // Update password history
    const history = this.passwordHistory.get(userId) || [];
    history.push(hashedPassword);
    if (history.length > 5) history.shift(); // Keep last 5 passwords
    this.passwordHistory.set(userId, history);
    
    // Update user password
    const user = this.users.get(userEmail);
    user.password = hashedPassword;
    this.users.set(userEmail, user);
  }

  async checkPasswordHistory(userId: string, password: string): Promise<boolean> {
    const history = this.passwordHistory.get(userId) || [];
    
    for (const oldHash of history) {
      if (await mockVerifyPassword(password, oldHash)) {
        return true; // Password was used before
      }
    }
    
    return false;
  }

  async createSession(userId: string, rememberMe: boolean = false): Promise<Session> {
    const session: Session = {
      id: generateSecureToken(),
      userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)),
      isActive: true,
    };
    
    this.sessions.set(session.id, session);
    return session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    // Check if expired
    if (new Date() > session.expiresAt) {
      session.isActive = false;
      this.sessions.set(sessionId, session);
      return null;
    }
    
    return session;
  }

  async invalidateSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      this.sessions.set(sessionId, session);
    }
  }

  async createResetToken(email: string): Promise<string> {
    const token = generateSecureToken(32);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    this.resetTokens.set(token, { email, expires });
    return token;
  }

  async validateResetToken(token: string): Promise<string | null> {
    const data = this.resetTokens.get(token);
    if (!data) return null;
    
    if (new Date() > data.expires) {
      this.resetTokens.delete(token);
      return null;
    }
    
    return data.email;
  }

  async invalidateResetToken(token: string): Promise<void> {
    this.resetTokens.delete(token);
  }

  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    return Array.from(this.users.values()).map(user => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...safeUser } = user;
      return safeUser;
    });
  }
}

// Google Cloud Secret Manager interface (for future implementation)
// interface CloudSecretManager {
//   storeSecret(name: string, value: string): Promise<void>;
//   getSecret(name: string): Promise<string | null>;
//   deleteSecret(name: string): Promise<void>;
//   listSecrets(): Promise<string[]>;
// }

// Main secure storage service
class SecureStorageService {
  private mockDb: MockVaultDatabase;
  
  constructor() {
    this.mockDb = new MockVaultDatabase();
  }

  // User management
  async createUser(userData: Partial<User> & { password: string }): Promise<Omit<User, 'password'>> {
    const user = await this.mockDb.createUser(userData);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    return safeUser as Omit<User, 'password'>;
  }

  async getUserByEmail(email: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.mockDb.getUserByEmail(email);
    if (!user) return null;
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    return safeUser as Omit<User, 'password'>;
  }

  async updateUser(email: string, updates: Partial<User>): Promise<Omit<User, 'password'>> {
    const user = await this.mockDb.updateUser(email, updates);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    return safeUser as Omit<User, 'password'>;
  }

  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    return this.mockDb.getAllUsers();
  }

  // Authentication
  async verifyCredentials(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const isValid = await this.mockDb.verifyPassword(email, password);
    if (!isValid) return null;
    
    const user = await this.mockDb.getUserByEmail(email);
    if (!user) return null;
     
    const { password, ...safeUser } = user;
    return safeUser as Omit<User, 'password'>;
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Verify current password first
    let userEmail: string | null = null;
    const users = await this.mockDb.getAllUsers();
    for (const user of users) {
      if (user.id === userId) {
        userEmail = user.email;
        break;
      }
    }
    
    if (!userEmail) throw new Error('User not found');
    
    const isValid = await this.mockDb.verifyPassword(userEmail, currentPassword);
    if (!isValid) throw new Error('Current password is incorrect');
    
    // Check password history
    const wasUsed = await this.mockDb.checkPasswordHistory(userId, newPassword);
    if (wasUsed) throw new Error('Password was recently used. Please choose a different password.');
    
    await this.mockDb.updatePassword(userId, newPassword);
  }

  async resetPassword(email: string, newPassword: string): Promise<void> {
    const user = await this.mockDb.getUserByEmail(email);
    if (!user) throw new Error('User not found');
    
    // Check password history
    const wasUsed = await this.mockDb.checkPasswordHistory(user.id, newPassword);
    if (wasUsed) throw new Error('Password was recently used. Please choose a different password.');
    
    await this.mockDb.updatePassword(user.id, newPassword);
  }

  // Session management
  async createSession(userId: string, rememberMe: boolean = false): Promise<Session> {
    return this.mockDb.createSession(userId, rememberMe);
  }

  async getSession(sessionId: string): Promise<Session | null> {
    return this.mockDb.getSession(sessionId);
  }

  async invalidateSession(sessionId: string): Promise<void> {
    return this.mockDb.invalidateSession(sessionId);
  }

  // Password reset tokens
  async createResetToken(email: string): Promise<string> {
    return this.mockDb.createResetToken(email);
  }

  async validateResetToken(token: string): Promise<string | null> {
    return this.mockDb.validateResetToken(token);
  }

  async invalidateResetToken(token: string): Promise<void> {
    return this.mockDb.invalidateResetToken(token);
  }

  // Helper methods
  generateToken(): string {
    return generateSecureToken(32);
  }

  generateSessionId(): string {
    return generateSecureToken(32);
  }

  generateVerificationCode(): string {
    // Generate 6-digit code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

// Export singleton instance
export const secureStorage = new SecureStorageService();

// Password strength checker
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
  isValid: boolean;
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) score++;
  else feedback.push('Password must be at least 8 characters long');

  if (password.length >= 12) score++;

  // Character type checks
  if (/[a-z]/.test(password)) score++;
  else feedback.push('Password must contain lowercase letters');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Password must contain uppercase letters');

  if (/[0-9]/.test(password)) score++;
  else feedback.push('Password must contain numbers');

  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;
  else feedback.push('Password must contain special characters');

  // Bonus for length
  if (password.length >= 16) score++;

  // Normalize score to 0-4
  score = Math.min(Math.floor(score * 4 / 7), 4);

  const isValid = password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  return { score, feedback, isValid };
};