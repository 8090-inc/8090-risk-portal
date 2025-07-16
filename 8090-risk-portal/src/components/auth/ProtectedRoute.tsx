// Protected route component for authentication

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useIsAuthenticated, useCurrentUser } from '../../store/authStore';
import { UserRole, getUserPermissions } from '../../types/auth.types';
import { Spinner } from '../ui/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole[];
  requiredPermission?: keyof ReturnType<typeof getUserPermissions>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requiredPermission 
}) => {
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();
  const location = useLocation();

  // Show loading while checking auth
  if (isAuthenticated === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && !requiredRole.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
        <p className="text-slate-600">You don't have permission to access this page.</p>
        <button
          onClick={() => window.history.back()}
          className="mt-4 px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Check specific permission
  if (requiredPermission) {
    const permissions = getUserPermissions(user.role);
    if (!permissions[requiredPermission]) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-slate-600">You don't have the required permission: {requiredPermission}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      );
    }
  }

  return <>{children}</>;
};