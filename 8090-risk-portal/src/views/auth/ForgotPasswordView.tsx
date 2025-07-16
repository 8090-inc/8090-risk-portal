// Forgot password page component

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { checkPasswordStrength } from '../../services/secureStorage';

export const ForgotPasswordView: React.FC = () => {
  const navigate = useNavigate();
  const { forgotPassword, resetPassword, loading, error, clearError } = useAuthStore();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] as string[], isValid: false });
  const [success, setSuccess] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      const token = await forgotPassword({ email });
      if (token) {
        setResetToken(token); // In dev mode, we get the token directly
      }
      setStep('reset');
      setSuccess(false);
    } catch (error) {
      console.error('Failed to request reset:', error);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (newPassword !== confirmPassword) {
      return;
    }

    if (!passwordStrength.isValid) {
      return;
    }

    try {
      // In production, the token would come from the reset code validation
      // For now, we use the token directly or the code as token
      const tokenToUse = resetToken || resetCode;
      
      await resetPassword({ token: tokenToUse, newPassword });
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Failed to reset password:', error);
    }
  };

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    setPasswordStrength(checkPasswordStrength(value));
  };

  if (success) {
    return (
      <AuthLayout title="Password Reset Successful">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-slate-600">
            Your password has been successfully reset.
          </p>
          <p className="text-sm text-slate-500">
            Redirecting to login page...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title={step === 'request' ? 'Forgot Password' : 'Reset Password'}
      subtitle={
        step === 'request' 
          ? 'Enter your email to receive reset instructions'
          : 'Enter the code from your email and set a new password'
      }
    >
      {step === 'request' ? (
        <form onSubmit={handleRequestReset} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0055D4] focus:border-transparent"
                placeholder="you@company.com"
                autoComplete="email"
              />
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Instructions'}
          </Button>

          {/* Back to Login */}
          <Link
            to="/login"
            className="flex items-center justify-center space-x-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to login</span>
          </Link>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          {/* Success Message */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              We've sent a reset code to <strong>{email}</strong>. 
              Please check your email and enter the code below.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Reset Code Field */}
          <div>
            <label htmlFor="resetCode" className="block text-sm font-medium text-slate-700 mb-1">
              Reset Code
            </label>
            <input
              id="resetCode"
              type="text"
              required
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0055D4] focus:border-transparent"
              placeholder="Enter 6-digit code"
              maxLength={6}
            />
          </div>

          {/* New Password Field */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0055D4] focus:border-transparent"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {/* Password Requirements */}
            {newPassword && (
              <div className="mt-2 space-y-1">
                {passwordStrength.feedback.map((feedback, index) => (
                  <p key={index} className="text-xs text-red-600">• {feedback}</p>
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0055D4] focus:border-transparent"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={
              loading || 
              !passwordStrength.isValid ||
              newPassword !== confirmPassword
            }
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>

          {/* Back to Request */}
          <button
            type="button"
            onClick={() => {
              setStep('request');
              setResetCode('');
              setNewPassword('');
              setConfirmPassword('');
              clearError();
            }}
            className="flex items-center justify-center space-x-2 text-sm text-slate-600 hover:text-slate-900 w-full"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Request new code</span>
          </button>
        </form>
      )}

      {/* Demo Mode Info */}
      {import.meta.env.DEV && step === 'reset' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm font-medium text-yellow-900 mb-1">Demo Mode:</p>
          <p className="text-xs text-yellow-700">
            In development, any 6-digit code will work.
            {resetToken && <><br />Token: {resetToken.substring(0, 8)}...</>}
          </p>
        </div>
      )}
    </AuthLayout>
  );
};