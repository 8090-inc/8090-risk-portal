// Authentication and user management types

import { RiskOwner } from '../constants/riskOwners';

// User roles - simplified to three tiers
export type UserRole = 'admin' | 'manager' | 'viewer';

// User interface
export interface User {
  id: string;
  email: string; // Email is the username
  name: string;
  role: UserRole;
  department: RiskOwner; // Department from risk owners list
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  emailVerified: boolean;
}

// Authentication state
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

// Login request/response
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// Registration request/response
export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  department: RiskOwner;
  role: UserRole;
  acceptTerms: boolean;
}

export interface RegisterResponse {
  user: User;
  token: string;
  refreshToken: string;
  verificationRequired: boolean;
}

// Password reset types
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string; // Only in development mode
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// Change password (for logged-in users)
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Password validation
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

// Session management
export interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
}

// Activity log
export interface AuthActivity {
  id: string;
  userId: string;
  action: 'login' | 'logout' | 'register' | 'password_change' | 'password_reset' | 'failed_login';
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

// Role permissions
export interface RolePermissions {
  // Risk permissions
  canViewRisks: boolean;
  canCreateRisks: boolean;
  canEditRisks: boolean;
  canDeleteRisks: boolean;
  
  // Control permissions
  canViewControls: boolean;
  canCreateControls: boolean;
  canEditControls: boolean;
  canDeleteControls: boolean;
  
  // Report permissions
  canViewReports: boolean;
  canGenerateReports: boolean;
  
  // User management permissions
  canViewUsers: boolean;
  canManageUsers: boolean;
  
  // System permissions
  canAccessSettings: boolean;
  canImportData: boolean;
  canExportData: boolean;
}

// Role permission definitions
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canViewRisks: true,
    canCreateRisks: true,
    canEditRisks: true,
    canDeleteRisks: true,
    canViewControls: true,
    canCreateControls: true,
    canEditControls: true,
    canDeleteControls: true,
    canViewReports: true,
    canGenerateReports: true,
    canViewUsers: true,
    canManageUsers: true,
    canAccessSettings: true,
    canImportData: true,
    canExportData: true,
  },
  manager: {
    canViewRisks: true,
    canCreateRisks: true,
    canEditRisks: true,
    canDeleteRisks: false,
    canViewControls: true,
    canCreateControls: true,
    canEditControls: true,
    canDeleteControls: false,
    canViewReports: true,
    canGenerateReports: true,
    canViewUsers: false,
    canManageUsers: false,
    canAccessSettings: false,
    canImportData: false,
    canExportData: true,
  },
  viewer: {
    canViewRisks: true,
    canCreateRisks: false,
    canEditRisks: false,
    canDeleteRisks: false,
    canViewControls: true,
    canCreateControls: false,
    canEditControls: false,
    canDeleteControls: false,
    canViewReports: true,
    canGenerateReports: false,
    canViewUsers: false,
    canManageUsers: false,
    canAccessSettings: false,
    canImportData: false,
    canExportData: true,
  },
};

// Helper to get user permissions
export const getUserPermissions = (role: UserRole): RolePermissions => {
  return ROLE_PERMISSIONS[role];
};

// Token payload interface
export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  department: RiskOwner;
  iat: number;
  exp: number;
}

// User profile update
export interface UpdateProfileRequest {
  name?: string;
  department?: RiskOwner;
}

// User management (admin only)
export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  department: RiskOwner;
}

export interface UpdateUserRequest {
  id: string;
  name?: string;
  role?: UserRole;
  department?: RiskOwner;
  isActive?: boolean;
}

// Password requirements
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialCharsRegex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
};

// Session configuration
export const SESSION_CONFIG = {
  tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
  refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
  rememberMeExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
  inactivityTimeout: 30 * 60 * 1000, // 30 minutes
  maxFailedAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
};