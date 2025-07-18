// Account settings page component - simplified for IAP
import React from 'react';
import { User, Shield, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useCurrentUser } from '../store/authStore';

export const AccountSettingsView: React.FC = () => {
  const user = useCurrentUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Account Settings"
        description="View your account information"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <div className="flex items-center mb-6">
                <User className="w-5 h-5 mr-2 text-slate-600" />
                <h2 className="text-lg font-semibold">Profile Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Name
                  </label>
                  <p className="text-slate-900">{user.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Email
                  </label>
                  <p className="text-slate-900">{user.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Role
                  </label>
                  <Badge variant={user.role === 'admin' ? 'primary' : 'secondary'}>
                    {user.role}
                  </Badge>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    User ID
                  </label>
                  <p className="text-slate-900 font-mono text-sm">{user.id}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Security Information */}
        <div>
          <Card>
            <div className="p-6">
              <div className="flex items-center mb-6">
                <Shield className="w-5 h-5 mr-2 text-slate-600" />
                <h2 className="text-lg font-semibold">Security</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-2">
                    Authentication Method
                  </p>
                  <Badge variant="success">
                    Identity-Aware Proxy (IAP)
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-2">
                    Security Status
                  </p>
                  <div className="flex items-center text-green-600">
                    <Shield className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">Secured by Google IAP</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-slate-500">
                    Your account is protected by Google Cloud Identity-Aware Proxy. 
                    Authentication is managed by your organization's identity provider.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};