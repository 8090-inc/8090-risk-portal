import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ErrorNotification } from '../types';

interface UIState {
  // Navigation
  activeView: 'dashboard' | 'risks' | 'controls' | 'matrix' | 'reports' | 'settings';
  sidebarCollapsed: boolean;
  
  // Modals
  modals: {
    createRisk: boolean;
    editRisk: boolean;
    createControl: boolean;
    editControl: boolean;
    import: boolean;
    export: boolean;
    help: boolean;
  };
  
  // Notifications
  notifications: ErrorNotification[];
  
  // Loading states
  globalLoading: boolean;
  loadingMessage: string;
  
  // Theme
  theme: 'light' | 'dark';
  
  // Actions
  setActiveView: (view: UIState['activeView']) => void;
  toggleSidebar: () => void;
  openModal: (modal: keyof UIState['modals']) => void;
  closeModal: (modal: keyof UIState['modals']) => void;
  closeAllModals: () => void;
  addNotification: (notification: Omit<ErrorNotification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Helper actions
  showError: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  showSuccess: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
}

const createNotification = (
  type: ErrorNotification['type'],
  title: string,
  message: string,
  duration: number = 5000
): ErrorNotification => ({
  id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type,
  title,
  message,
  duration,
  dismissible: true
});

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // Initial state
      activeView: 'dashboard',
      sidebarCollapsed: false,
      modals: {
        createRisk: false,
        editRisk: false,
        createControl: false,
        editControl: false,
        import: false,
        export: false,
        help: false
      },
      notifications: [],
      globalLoading: false,
      loadingMessage: '',
      theme: 'light',
      
      // Navigation
      setActiveView: (view) => {
        set({ activeView: view });
      },
      
      toggleSidebar: () => {
        set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },
      
      // Modals
      openModal: (modal) => {
        set(state => ({
          modals: { ...state.modals, [modal]: true }
        }));
      },
      
      closeModal: (modal) => {
        set(state => ({
          modals: { ...state.modals, [modal]: false }
        }));
      },
      
      closeAllModals: () => {
        set(state => ({
          modals: Object.keys(state.modals).reduce((acc, key) => ({
            ...acc,
            [key]: false
          }), {} as UIState['modals'])
        }));
      },
      
      // Notifications
      addNotification: (notification) => {
        const newNotification: ErrorNotification = {
          ...notification,
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        
        set(state => ({
          notifications: [...state.notifications, newNotification]
        }));
        
        // Auto-remove notification after duration
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(newNotification.id);
          }, newNotification.duration);
        }
      },
      
      removeNotification: (id) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      },
      
      clearNotifications: () => {
        set({ notifications: [] });
      },
      
      // Loading
      setGlobalLoading: (loading, message = 'Loading...') => {
        set({ globalLoading: loading, loadingMessage: message });
      },
      
      // Theme
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },
      
      // Helper notification methods
      showError: (title, message) => {
        get().addNotification(createNotification('error', title, message));
      },
      
      showWarning: (title, message) => {
        get().addNotification(createNotification('warning', title, message));
      },
      
      showSuccess: (title, message) => {
        get().addNotification(createNotification('info', title, message, 3000));
      },
      
      showInfo: (title, message) => {
        get().addNotification(createNotification('info', title, message));
      }
    }),
    {
      name: 'ui-store'
    }
  )
);