// Authentication service - Mock implementation with Google Cloud readiness

import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  TokenPayload,
  AuthActivity
} from '../types/auth.types';
import { secureStorage, checkPasswordStrength } from './secureStorage';

// Mock JWT implementation
const createMockJWT = (payload: TokenPayload): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = btoa(payload.userId + payload.email + Date.now());
  return `${header}.${body}.${signature}`;
};

const decodeMockJWT = (token: string): TokenPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
};

// Activity logging
const logActivity = async (activity: Omit<AuthActivity, 'id' | 'timestamp'>): Promise<void> => {
  const log: AuthActivity = {
    id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    ...activity
  };
  
  // In production, this would be sent to a logging service
  console.log('[Auth Activity]', log);
  
  // Store in localStorage for demo
  const activities = JSON.parse(localStorage.getItem('authActivities') || '[]');
  activities.push(log);
  if (activities.length > 100) activities.shift(); // Keep last 100
  localStorage.setItem('authActivities', JSON.stringify(activities));
};

// Email service mock
const sendEmail = async (to: string, subject: string, body: string): Promise<void> => {
  console.log('[Mock Email Service]', { to, subject, body });
  
  // Store email in localStorage for demo
  const emails = JSON.parse(localStorage.getItem('mockEmails') || '[]');
  emails.push({
    id: `email-${Date.now()}`,
    to,
    subject,
    body,
    sentAt: new Date().toISOString()
  });
  localStorage.setItem('mockEmails', JSON.stringify(emails));
};

class AuthService {
  // Login
  async login({ email, password, rememberMe = false }: LoginRequest): Promise<LoginResponse> {
    try {
      // Verify credentials
      const user = await secureStorage.verifyCredentials(email, password);
      
      if (!user) {
        await logActivity({
          userId: 'unknown',
          action: 'failed_login',
          details: { email, reason: 'invalid_credentials' }
        });
        throw new Error('Invalid email or password');
      }

      if (!user.isActive) {
        await logActivity({
          userId: user.id,
          action: 'failed_login',
          details: { reason: 'account_inactive' }
        });
        throw new Error('Account is inactive. Please contact administrator.');
      }

      // Create session
      const session = await secureStorage.createSession(user.id, rememberMe);
      
      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        department: user.department,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(session.expiresAt.getTime() / 1000)
      };
      
      const token = createMockJWT(tokenPayload);
      const refreshToken = secureStorage.generateToken();
      
      // Update last login
      await secureStorage.updateUser(email, { lastLogin: new Date() });
      
      // Log activity
      await logActivity({
        userId: user.id,
        action: 'login',
        details: { rememberMe }
      });
      
      return {
        user,
        token,
        refreshToken,
        expiresIn: session.expiresAt.getTime() - Date.now()
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Register
  async register(request: RegisterRequest): Promise<RegisterResponse> {
    try {
      // Validate email not already in use
      const existingUser = await secureStorage.getUserByEmail(request.email);
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Validate password strength
      const passwordCheck = checkPasswordStrength(request.password);
      if (!passwordCheck.isValid) {
        throw new Error('Password does not meet requirements: ' + passwordCheck.feedback.join(', '));
      }

      // Create user
      const user = await secureStorage.createUser({
        email: request.email,
        name: request.name,
        password: request.password,
        role: request.role,
        department: request.department,
        emailVerified: false
      });

      // Create session
      const session = await secureStorage.createSession(user.id);
      
      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        department: user.department,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(session.expiresAt.getTime() / 1000)
      };
      
      const token = createMockJWT(tokenPayload);
      const refreshToken = secureStorage.generateToken();
      
      // Send verification email
      const verificationCode = secureStorage.generateVerificationCode();
      await sendEmail(
        user.email,
        'Verify your 8090 Risk Portal account',
        `Welcome to 8090 Risk Portal!\n\nYour verification code is: ${verificationCode}\n\nThis code expires in 24 hours.`
      );
      
      // Log activity
      await logActivity({
        userId: user.id,
        action: 'register',
        details: { department: user.department, role: user.role }
      });
      
      return {
        user,
        token,
        refreshToken,
        verificationRequired: true
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Logout
  async logout(token: string): Promise<void> {
    try {
      const payload = decodeMockJWT(token);
      if (payload) {
        await logActivity({
          userId: payload.userId,
          action: 'logout',
          details: {}
        });
      }
      
      // In production, invalidate token on server
      // For now, client will remove token from storage
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Forgot password
  async forgotPassword({ email }: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    try {
      const user = await secureStorage.getUserByEmail(email);
      
      if (user) {
        // Generate reset token
        const resetToken = await secureStorage.createResetToken(email);
        const resetCode = secureStorage.generateVerificationCode();
        
        // Send reset email
        await sendEmail(
          email,
          'Reset your 8090 Risk Portal password',
          `A password reset was requested for your account.\n\nYour reset code is: ${resetCode}\n\nThis code expires in 1 hour.\n\nIf you did not request this, please ignore this email.`
        );
        
        // Log activity
        await logActivity({
          userId: user.id,
          action: 'password_reset',
          details: { step: 'requested' }
        });
        
        // In development, include token for testing
        if (import.meta.env.DEV) {
          return {
            message: 'Password reset instructions sent to your email',
            resetToken
          };
        }
      }
      
      // Always return success to prevent email enumeration
      return {
        message: 'If an account exists with this email, you will receive password reset instructions'
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword({ token, newPassword }: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    try {
      // Validate token
      const email = await secureStorage.validateResetToken(token);
      if (!email) {
        throw new Error('Invalid or expired reset token');
      }

      // Validate password strength
      const passwordCheck = checkPasswordStrength(newPassword);
      if (!passwordCheck.isValid) {
        throw new Error('Password does not meet requirements: ' + passwordCheck.feedback.join(', '));
      }

      // Reset password
      await secureStorage.resetPassword(email, newPassword);
      
      // Invalidate reset token
      await secureStorage.invalidateResetToken(token);
      
      // Get user for logging
      const user = await secureStorage.getUserByEmail(email);
      if (user) {
        await logActivity({
          userId: user.id,
          action: 'password_reset',
          details: { step: 'completed' }
        });
        
        // Send confirmation email
        await sendEmail(
          email,
          'Password reset successful',
          'Your password has been successfully reset. If you did not make this change, please contact support immediately.'
        );
      }
      
      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Change password (for logged-in users)
  async changePassword(userId: string, { currentPassword, newPassword }: ChangePasswordRequest): Promise<void> {
    try {
      // Validate password strength
      const passwordCheck = checkPasswordStrength(newPassword);
      if (!passwordCheck.isValid) {
        throw new Error('Password does not meet requirements: ' + passwordCheck.feedback.join(', '));
      }

      // Update password
      await secureStorage.updatePassword(userId, currentPassword, newPassword);
      
      // Log activity
      await logActivity({
        userId,
        action: 'password_change',
        details: {}
      });
      
      // Send notification email
      const users = await secureStorage.getAllUsers();
      const user = users.find(u => u.id === userId);
      if (user) {
        await sendEmail(
          user.email,
          'Password changed',
          'Your password has been successfully changed. If you did not make this change, please contact support immediately.'
        );
      }
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  // Verify token
  async verifyToken(token: string): Promise<User | null> {
    try {
      const payload = decodeMockJWT(token);
      if (!payload) return null;
      
      const user = await secureStorage.getUserByEmail(payload.email);
      return user;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      // In production, validate refresh token against database
      // For now, create a new token
      
      // Mock implementation - get user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (!currentUser) {
        throw new Error('No active session');
      }
      
      const user = await secureStorage.getUserByEmail(currentUser.email);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Create new session
      const session = await secureStorage.createSession(user.id);
      
      // Generate new tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        department: user.department,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(session.expiresAt.getTime() / 1000)
      };
      
      const token = createMockJWT(tokenPayload);
      const newRefreshToken = secureStorage.generateToken();
      
      return {
        user,
        token,
        refreshToken: newRefreshToken,
        expiresIn: session.expiresAt.getTime() - Date.now()
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  // Get login history
  async getLoginHistory(userId: string): Promise<AuthActivity[]> {
    const activities = JSON.parse(localStorage.getItem('authActivities') || '[]');
    return activities
      .filter((a: AuthActivity) => a.userId === userId && (a.action === 'login' || a.action === 'failed_login'))
      .sort((a: AuthActivity, b: AuthActivity) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20); // Last 20 login attempts
  }

  // Admin: Get all users
  async getAllUsers(): Promise<User[]> {
    return secureStorage.getAllUsers();
  }

  // Admin: Create user
  async createUser(adminId: string, userData: any): Promise<User> {
    const user = await secureStorage.createUser(userData);
    
    await logActivity({
      userId: adminId,
      action: 'register', // Using register action for user creation
      details: { createdUserId: user.id, createdUserEmail: user.email }
    });
    
    // Send welcome email
    await sendEmail(
      user.email,
      'Welcome to 8090 Risk Portal',
      `An account has been created for you on 8090 Risk Portal.\n\nEmail: ${user.email}\nTemporary Password: ${userData.password}\n\nPlease log in and change your password immediately.`
    );
    
    return user;
  }

  // Admin: Update user
  async updateUser(adminId: string, email: string, updates: any): Promise<User> {
    const user = await secureStorage.updateUser(email, updates);
    
    await logActivity({
      userId: adminId,
      action: 'password_change', // Using password_change for user updates
      details: { updatedUserId: user.id, updates }
    });
    
    return user;
  }
}

// Export singleton instance
export const authService = new AuthService();