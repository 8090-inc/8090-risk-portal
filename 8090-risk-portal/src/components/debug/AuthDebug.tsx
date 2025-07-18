// Debug component to check auth state

import React from 'react';
import { useAuthStore } from '../../store/authStore';

export const AuthDebug: React.FC = () => {
  const { isAuthenticated, user, loading, error } = useAuthStore();

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-bold text-yellow-800 mb-2">Auth Debug Info:</h3>
      <div className="space-y-1 text-sm">
        <p>Loading: {loading ? 'true' : 'false'}</p>
        <p>Is Authenticated: {isAuthenticated ? 'true' : 'false'}</p>
        <p>User: {user ? `${user.name} (${user.email})` : 'null'}</p>
        <p>Error: {error || 'none'}</p>
        <p>IAP Headers: {user ? 'Detected' : 'Not detected'}</p>
      </div>
    </div>
  );
};