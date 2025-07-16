import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ControlsView } from './views/ControlsView';
import { RisksView } from './views/RisksView';
import { RiskDetailView } from './views/RiskDetailView';
import { ControlDetailView } from './views/ControlDetailView';
import { DashboardView } from './views/DashboardView';
// import { RiskMatrixView } from './views/RiskMatrixView';
import { SimpleRiskMatrixView } from './views/SimpleRiskMatrixView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { AccountSettingsView } from './views/AccountSettingsView';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useUIStore, useAuthStore } from './store';
import { initializeStores } from './store';
import { Spinner } from './components/ui';

// Auth components
import { LoginView } from './views/auth/LoginView';
import { RegisterView } from './views/auth/RegisterView';
import { ForgotPasswordView } from './views/auth/ForgotPasswordView';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Admin components
import { UserManagementView } from './views/admin/UserManagementView';

function App() {
  const { globalLoading, loadingMessage } = useUIStore();
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Check authentication status
    checkAuth();
  }, []);

  useEffect(() => {
    // Initialize stores on app mount only if authenticated
    if (isAuthenticated) {
      initializeStores().catch(error => {
        console.error('Failed to initialize stores:', error);
      });
    }
  }, [isAuthenticated]);

  if (globalLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">{loadingMessage}</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterView />} />
          <Route path="/forgot-password" element={<ForgotPasswordView />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            {/* Default route - Dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardView />} />
            
            {/* Risk routes */}
            <Route path="risks" element={<RisksView />} />
            <Route path="risks/:id" element={<RiskDetailView />} />
            
            {/* Control routes */}
            <Route path="controls" element={<ControlsView />} />
            <Route path="controls/:id" element={<ControlDetailView />} />
            
            {/* Other views */}
            <Route path="matrix" element={<SimpleRiskMatrixView />} />
            <Route path="reports" element={<ReportsView />} />
            
            {/* Settings - Admin only */}
            <Route path="settings" element={
              <ProtectedRoute requiredRole={['admin']}>
                <SettingsView />
              </ProtectedRoute>
            } />
            
            {/* Account Settings - All authenticated users */}
            <Route path="account" element={<AccountSettingsView />} />
            
            {/* Admin routes */}
            <Route path="admin/users" element={
              <ProtectedRoute requiredRole={['admin']}>
                <UserManagementView />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<div className="p-6">404 - Page Not Found</div>} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;