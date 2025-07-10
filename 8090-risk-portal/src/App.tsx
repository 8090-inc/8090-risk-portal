import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ControlsView } from './views/ControlsView';
import { RisksView } from './views/RisksView';
import { RiskDetailView } from './views/RiskDetailView';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useUIStore } from './store';
import { initializeStores } from './store';
import { Spinner } from './components/ui';

function App() {
  const { globalLoading, loadingMessage } = useUIStore();

  useEffect(() => {
    // Initialize stores on app mount
    initializeStores().catch(error => {
      console.error('Failed to initialize stores:', error);
    });
  }, []);

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
        <AppLayout>
          <Routes>
            {/* Default route - Controls View */}
            <Route path="/" element={<Navigate to="/controls" replace />} />
            <Route path="/controls" element={<ControlsView />} />
            
            {/* Risk routes */}
            <Route path="/risks" element={<RisksView />} />
            <Route path="/risks/:id" element={<RiskDetailView />} />
            <Route path="/controls/:id" element={<div className="p-6">Control Detail View (Coming Soon)</div>} />
            <Route path="/dashboard" element={<div className="p-6">Dashboard View (Coming Soon)</div>} />
            <Route path="/matrix" element={<div className="p-6">Risk Matrix View (Coming Soon)</div>} />
            <Route path="/reports" element={<div className="p-6">Reports View (Coming Soon)</div>} />
            <Route path="/settings" element={<div className="p-6">Settings View (Coming Soon)</div>} />
            
            {/* 404 */}
            <Route path="*" element={<div className="p-6">404 - Page Not Found</div>} />
          </Routes>
        </AppLayout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;