// Debug component to check auth state

import React from 'react';
import { useAuthStore } from '../../store/authStore';

export const AuthDebug: React.FC = () => {
  const { isAuthenticated, user, loading, error, token, refreshToken } = useAuthStore();

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-bold text-yellow-800 mb-2">Auth Debug Info:</h3>
      <div className="space-y-1 text-sm">
        <p>Loading: {loading ? 'true' : 'false'}</p>
        <p>Is Authenticated: {isAuthenticated ? 'true' : 'false'}</p>
        <p>User: {user ? `${user.name} (${user.email})` : 'null'}</p>
        <p>Error: {error || 'none'}</p>
        <p>Token: {token ? `exists (${token.split('.')[1] ? 'valid format' : 'invalid format'})` : 'null'}</p>
        <p>Refresh Token: {refreshToken ? 'exists' : 'null'}</p>
        <p>Current User in localStorage: {localStorage.getItem('currentUser') ? 'exists' : 'null'}</p>
      </div>
    </div>
  );
};