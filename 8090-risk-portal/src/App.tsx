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
import { UseCasesView } from './views/UseCasesView';
import { UseCaseDetailView } from './views/UseCaseDetailView';
import { UseCaseCreateView } from './views/UseCaseCreateView';
import { UseCaseEditView } from './views/UseCaseEditView';
import { UseCaseRiskManagementView } from './views/UseCaseRiskManagementView';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useUIStore, useAuthStore } from './store';
import { initializeStores } from './store';
import { Spinner } from './components/ui';

// Admin components
import { UserManagementView } from './views/admin/UserManagementView';

function App() {
  const { globalLoading, loadingMessage } = useUIStore();
  const { checkAuth, isAuthenticated, loading } = useAuthStore();

  useEffect(() => {
    // Check IAP authentication status
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

  if (globalLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">{loadingMessage || 'Loading...'}</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* All routes require IAP authentication */}
          {isAuthenticated ? (
            <Route path="/" element={<AppLayout />}>
              {/* Default route - Dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardView />} />
              
              {/* Risk routes */}
              <Route path="risks" element={<RisksView />} />
              <Route path="risks/:id" element={<RiskDetailView />} />
              
              {/* Control routes */}
              <Route path="controls" element={<ControlsView />} />
              <Route path="controls/:id" element={<ControlDetailView />} />
              
              {/* Use Case routes */}
              <Route path="usecases" element={<UseCasesView />} />
              <Route path="usecases/new" element={<UseCaseCreateView />} />
              <Route path="usecases/:id" element={<UseCaseDetailView />} />
              <Route path="usecases/:id/edit" element={<UseCaseEditView />} />
              <Route path="usecases/:id/risks" element={<UseCaseRiskManagementView />} />
              
              {/* Other views */}
              <Route path="matrix" element={<SimpleRiskMatrixView />} />
              <Route path="reports" element={<ReportsView />} />
              
              {/* Settings */}
              <Route path="settings" element={<SettingsView />} />
              
              {/* Account Settings */}
              <Route path="account" element={<AccountSettingsView />} />
              
              {/* Admin routes */}
              <Route path="admin/users" element={<UserManagementView />} />
            </Route>
          ) : (
            // Show loading spinner while checking IAP authentication
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <Spinner size="lg" />
                <p className="mt-4 text-gray-600">Checking authentication...</p>
              </div>
            } />
          )}
          
          {/* 404 */}
          <Route path="*" element={<div className="p-6">404 - Page Not Found</div>} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;