// Authentication store for IAP
import { create } from 'zustand';
import { User } from '../types/auth.types';

interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  // Initial state
  isAuthenticated: false,
  user: null,
  loading: true, // Start with loading true to check auth on mount
  error: null,

  // Check authentication from IAP backend
  checkAuth: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (data.authenticated && data.user) {
        set({
          isAuthenticated: true,
          user: data.user,
          loading: false
        });
      } else {
        set({
          isAuthenticated: false,
          user: null,
          loading: false
        });
      }
    } catch {
      set({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'Failed to check authentication'
      });
    }
  },

  // Logout - redirect to GCIP signout
  logout: async () => {
    // Clear local state
    set({ 
      isAuthenticated: false,
      user: null,
      loading: false 
    });
    
    // Redirect to IAP logout URL
    window.location.href = '/?gcp-iap-mode=GCIP_SIGNOUT';
  },

  // Clear error
  clearError: () => set({ error: null })
}));

// Helper hooks
export const useCurrentUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore(state => state.loading);
export const useAuthError = () => useAuthStore(state => state.error);