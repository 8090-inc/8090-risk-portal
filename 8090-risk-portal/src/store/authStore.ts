// Authentication store using Zustand

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  AuthState, 
  User, 
  LoginRequest, 
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest
} from '../types/auth.types';
import { authService } from '../services/authService';
import { useUIStore } from './uiStore';

interface AuthStore extends AuthState {
  // Actions
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (request: ForgotPasswordRequest) => Promise<string>;
  resetPassword: (request: ResetPasswordRequest) => Promise<void>;
  changePassword: (request: ChangePasswordRequest) => Promise<void>;
  refreshAuthToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
  
  // Session management
  lastActivity: number;
  updateActivity: () => void;
  checkInactivity: () => void;
}

// Inactivity timeout (30 minutes)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      loading: false,
      error: null,
      lastActivity: Date.now(),

      // Login
      login: async (request) => {
        set({ loading: true, error: null });
        
        try {
          const response = await authService.login(request);
          
          set({
            isAuthenticated: true,
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            loading: false,
            lastActivity: Date.now()
          });
          
          // Show success notification
          useUIStore.getState().showSuccess('Login successful', `Welcome back, ${response.user.name}!`);
          
          // Store current user for token refresh
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        } catch (error) {
          set({ 
            loading: false, 
            error: error instanceof Error ? error.message : 'Login failed' 
          });
          throw error;
        }
      },

      // Register
      register: async (request) => {
        set({ loading: true, error: null });
        
        try {
          const response = await authService.register(request);
          
          set({
            isAuthenticated: true,
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            loading: false,
            lastActivity: Date.now()
          });
          
          // Show success notification
          useUIStore.getState().showSuccess(
            'Registration successful', 
            response.verificationRequired 
              ? 'Please check your email to verify your account'
              : 'Welcome to 8090 Risk Portal!'
          );
          
          // Store current user for token refresh
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        } catch (error) {
          set({ 
            loading: false, 
            error: error instanceof Error ? error.message : 'Registration failed' 
          });
          throw error;
        }
      },

      // Logout
      logout: async () => {
        const { token } = get();
        
        set({ loading: true });
        
        try {
          if (token) {
            await authService.logout(token);
          }
          
          // Clear auth state
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            refreshToken: null,
            loading: false,
            error: null
          });
          
          // Clear stored user
          localStorage.removeItem('currentUser');
          
          // Show notification
          useUIStore.getState().showInfo('Logged out', 'You have been successfully logged out');
        } catch (error) {
          set({ loading: false });
          console.error('Logout error:', error);
        }
      },

      // Forgot password
      forgotPassword: async (request) => {
        set({ loading: true, error: null });
        
        try {
          const response = await authService.forgotPassword(request);
          
          set({ loading: false });
          
          // Show success notification
          useUIStore.getState().showSuccess('Email sent', response.message);
          
          return response.resetToken || '';
        } catch (error) {
          set({ 
            loading: false, 
            error: error instanceof Error ? error.message : 'Failed to send reset email' 
          });
          throw error;
        }
      },

      // Reset password
      resetPassword: async (request) => {
        set({ loading: true, error: null });
        
        try {
          const response = await authService.resetPassword(request);
          
          set({ loading: false });
          
          // Show success notification
          useUIStore.getState().showSuccess('Password reset', response.message);
        } catch (error) {
          set({ 
            loading: false, 
            error: error instanceof Error ? error.message : 'Failed to reset password' 
          });
          throw error;
        }
      },

      // Change password
      changePassword: async (request) => {
        const { user } = get();
        if (!user) throw new Error('Not authenticated');
        
        set({ loading: true, error: null });
        
        try {
          await authService.changePassword(user.id, request);
          
          set({ loading: false });
          
          // Show success notification
          useUIStore.getState().showSuccess('Password changed', 'Your password has been successfully updated');
        } catch (error) {
          set({ 
            loading: false, 
            error: error instanceof Error ? error.message : 'Failed to change password' 
          });
          throw error;
        }
      },

      // Refresh token
      refreshAuthToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          console.log('No refresh token available');
          return;
        }
        
        try {
          console.log('Attempting to refresh token...');
          const response = await authService.refreshToken(refreshToken);
          
          set({
            isAuthenticated: true,
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            lastActivity: Date.now(),
            loading: false
          });
          
          // Update stored user
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          console.log('Token refreshed successfully');
        } catch (error) {
          console.error('Token refresh failed:', error);
          // If refresh fails, logout
          get().logout();
        }
      },

      // Check authentication status
      checkAuth: async () => {
        const { token, refreshToken } = get();
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }
        
        set({ loading: true });
        
        try {
          const user = await authService.verifyToken(token);
          
          if (user) {
            set({ 
              isAuthenticated: true, 
              user,
              loading: false,
              lastActivity: Date.now()
            });
          } else {
            // Token invalid, try refresh if we have a refresh token
            if (refreshToken) {
              console.log('Token expired, attempting refresh...');
              await get().refreshAuthToken();
            } else {
              console.log('No refresh token available, clearing auth state');
              set({ 
                isAuthenticated: false, 
                user: null,
                token: null,
                refreshToken: null,
                loading: false
              });
            }
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          // Try refresh as fallback
          if (refreshToken) {
            console.log('Auth check failed, attempting refresh...');
            try {
              await get().refreshAuthToken();
            } catch (refreshError) {
              console.error('Refresh also failed:', refreshError);
              set({ 
                isAuthenticated: false, 
                user: null,
                token: null,
                refreshToken: null,
                loading: false
              });
            }
          } else {
            set({ 
              isAuthenticated: false, 
              user: null,
              token: null,
              refreshToken: null,
              loading: false
            });
          }
        }
      },

      // Update profile
      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) throw new Error('Not authenticated');
        
        set({ loading: true, error: null });
        
        try {
          // In production, this would call an API
          const updatedUser = { ...user, ...updates };
          
          set({ 
            user: updatedUser,
            loading: false 
          });
          
          // Update stored user
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          
          // Show success notification
          useUIStore.getState().showSuccess('Profile updated', 'Your profile has been successfully updated');
        } catch (error) {
          set({ 
            loading: false, 
            error: error instanceof Error ? error.message : 'Failed to update profile' 
          });
          throw error;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Update last activity
      updateActivity: () => set({ lastActivity: Date.now() }),

      // Check for inactivity
      checkInactivity: () => {
        const { lastActivity, isAuthenticated } = get();
        
        if (isAuthenticated && Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
          useUIStore.getState().showWarning(
            'Session expired',
            'You have been logged out due to inactivity'
          );
          get().logout();
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        lastActivity: state.lastActivity
      })
    }
  )
);

// Activity tracker
if (typeof window !== 'undefined') {
  // Update activity on user interaction
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  events.forEach(event => {
    window.addEventListener(event, () => {
      useAuthStore.getState().updateActivity();
    });
  });

  // Check inactivity every minute
  setInterval(() => {
    useAuthStore.getState().checkInactivity();
  }, 60 * 1000);
}

// Helper hooks
export const useCurrentUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore(state => state.loading);
export const useAuthError = () => useAuthStore(state => state.error);