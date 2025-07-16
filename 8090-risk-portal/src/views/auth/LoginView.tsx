// Login page component

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);

  // Get redirect path from location state
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (error) {
      // Error is already handled in the store
      console.error('Login failed:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to access your AI Risk Portal"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0055D4] focus:border-transparent"
              placeholder="you@company.com"
              autoComplete="email"
            />
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 pl-10 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0055D4] focus:border-transparent"
              placeholder="••••••••"
              autoComplete="current-password"
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
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-[#0055D4] border-slate-300 rounded focus:ring-[#0055D4]"
            />
            <span className="ml-2 text-sm text-slate-600">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm text-[#0055D4] hover:text-[#0044a3] font-medium"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>

        {/* Register Link */}
        <div className="text-center pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-[#0055D4] hover:text-[#0044a3] font-medium"
            >
              Register here
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">Demo Credentials:</p>
            <p className="text-xs text-blue-700">Email: admin@8090.com</p>
            <p className="text-xs text-blue-700">Password: Admin@123</p>
          </div>
        )}
      </form>
    </AuthLayout>
  );
};