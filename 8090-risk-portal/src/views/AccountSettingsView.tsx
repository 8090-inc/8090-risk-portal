// Account settings page component

import React, { useState, useEffect } from 'react';
import { User, Lock, Shield, Clock, Save, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuthStore, useCurrentUser } from '../store/authStore';
import { authService } from '../services/authService';
import { AuthActivity } from '../types/auth.types';
import { checkPasswordStrength } from '../services/secureStorage';
import { format } from 'date-fns';

export const AccountSettingsView: React.FC = () => {
  const user = useCurrentUser();
  const { updateProfile, changePassword, loading, error, clearError } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'activity'>('profile');
  const [loginHistory, setLoginHistory] = useState<AuthActivity[]>([]);
  
  // Profile form
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || ''
  });
  
  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] as string[], isValid: false });
  
  // Success messages
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadLoginHistory();
    }
  }, [user]);

  const loadLoginHistory = async () => {
    if (!user) return;
    try {
      const history = await authService.getLoginHistory(user.id);
      setLoginHistory(history);
    } catch (error) {
      console.error('Failed to load login history:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage('');

    try {
      await updateProfile({
        name: profileData.name
      });
      setSuccessMessage('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return;
    }

    if (!passwordStrength.isValid) {
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setSuccessMessage('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordStrength({ score: 0, feedback: [], isValid: false });
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const handlePasswordInput = (value: string) => {
    setPasswordData(prev => ({ ...prev, newPassword: value }));
    setPasswordStrength(checkPasswordStrength(value));
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'manager': return 'warning';
      default: return 'default';
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <PageHeader
        title="Account Settings"
        description="Manage your profile, security settings, and view activity"
      />

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'profile'
                ? 'border-[#0055D4] text-[#0055D4]'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'security'
                ? 'border-[#0055D4] text-[#0055D4]'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Lock className="h-4 w-4 inline mr-2" />
            Security
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'activity'
                ? 'border-[#0055D4] text-[#0055D4]'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Clock className="h-4 w-4 inline mr-2" />
            Activity
          </button>
        </nav>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
          <Save className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Profile Information</h3>
            
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0055D4] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
                />
                <p className="mt-1 text-xs text-slate-500">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Department
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={profileData.department}
                    disabled
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
                  />
                  <Badge variant="default">{user.department}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">Contact admin to change department</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role
                </label>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-slate-400" />
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || profileData.name === user.name}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Change Password</h3>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0055D4] focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordInput(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0055D4] focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {passwordData.newPassword && passwordStrength.feedback.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {passwordStrength.feedback.map((feedback, index) => (
                      <p key={index} className="text-xs text-red-600">• {feedback}</p>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0055D4] focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={
                    loading || 
                    !passwordStrength.isValid ||
                    passwordData.newPassword !== passwordData.confirmPassword ||
                    !passwordData.currentPassword
                  }
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <h4 className="text-sm font-medium text-slate-900 mb-2">Password Requirements:</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Minimum 8 characters</li>
                <li>• At least one uppercase letter</li>
                <li>• At least one lowercase letter</li>
                <li>• At least one number</li>
                <li>• At least one special character</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Login History</h3>
            
            <div className="space-y-2">
              {loginHistory.length === 0 ? (
                <p className="text-sm text-slate-500">No login history available</p>
              ) : (
                loginHistory.map((activity) => (
                  <div
                    key={activity.id}
                    className={`p-3 rounded-lg border ${
                      activity.action === 'failed_login'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {activity.action === 'login' ? 'Successful login' : 'Failed login attempt'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(activity.timestamp), 'PPpp')}
                        </p>
                      </div>
                      {activity.details?.rememberMe && (
                        <Badge variant="default" size="sm">Remember Me</Badge>
                      )}
                    </div>
                    {activity.ipAddress && (
                      <p className="text-xs text-slate-500 mt-1">
                        IP: {activity.ipAddress}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-600">
                  <p>Your account will be automatically logged out after 30 minutes of inactivity.</p>
                  <p className="mt-1">Last activity: {format(new Date(), 'p')}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};