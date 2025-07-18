// User management view - simplified for IAP
import React from 'react';
import { Users, Shield, Info } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';

export const UserManagementView: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="User Management"
        description="User authentication is managed by Identity-Aware Proxy"
      />

      <div className="space-y-6">
        {/* IAP Information */}
        <Alert
          type="info"
          title="Authentication Managed by IAP"
          description="User accounts and authentication are managed through Google Cloud Identity Platform. To add or remove users, please use the Google Cloud Console."
        />

        {/* IAP Configuration Card */}
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              <h2 className="text-lg font-semibold">Identity-Aware Proxy Configuration</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Allowed Domains</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary">@dompe.com</Badge>
                  <Badge variant="primary">@ext.dompe.com</Badge>
                  <Badge variant="primary">@8090.inc</Badge>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Authentication Method</h3>
                <p className="text-sm text-slate-600">
                  Google Cloud Identity Platform with Email/Password provider
                </p>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-start">
                  <Info className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-600">
                    <p className="mb-2">
                      To manage user accounts:
                    </p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Go to the Google Cloud Console</li>
                      <li>Navigate to Identity Platform → Users</li>
                      <li>Select your tenant: "Dompe Risk Portal Team"</li>
                      <li>Add, edit, or remove user accounts as needed</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Current Session Info */}
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 mr-2 text-green-600" />
              <h2 className="text-lg font-semibold">Active Sessions</h2>
            </div>
            <p className="text-sm text-slate-600">
              Session management is handled by IAP. Users are automatically logged out after 
              the session expires or when they clear their browser cookies.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};