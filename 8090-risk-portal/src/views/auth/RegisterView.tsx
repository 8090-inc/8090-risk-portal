// Registration page component

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Building2, Shield, AlertCircle, Check, X } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { RISK_OWNERS } from '../../constants/riskOwners';
import { UserRole } from '../../types/auth.types';
import { checkPasswordStrength } from '../../services/secureStorage';

export const RegisterView: React.FC = () => {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    department: '' as any,
    role: 'viewer' as UserRole,
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] as string[], isValid: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    // Validate password strength
    if (!passwordStrength.isValid) {
      return;
    }

    try {
      await register({
        email: formData.email,
        name: formData.name,
        password: formData.password,
        department: formData.department,
        role: formData.role,
        acceptTerms: formData.acceptTerms
      });
      navigate('/dashboard');
    } catch (error) {
      // Error is already handled in the store
      console.error('Registration failed:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Check password strength
      if (name === 'password') {
        setPasswordStrength(checkPasswordStrength(value));
      }
    }
  };

  const getPasswordStrengthColor = (score: number) => {
    switch (score) {
      case 0: return 'bg-red-500';
      case 1: return 'bg-orange-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-green-500';
      default: return 'bg-slate-300';
    }
  };

  const getPasswordStrengthText = (score: number) => {
    switch (score) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  };

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Register to access AI Risk Portal"
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

        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Full Name
          </label>
          <div className="relative">
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0055D4] focus:border-transparent"
              placeholder="John Doe"
              autoComplete="name"
            />
            <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          </div>
        </div>

        {/* Department Field */}
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-1">
            Department
          </label>
          <div className="relative">
            <select
              id="department"
              name="department"
              required
              value={formData.department}
              onChange={handleChange}
              className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0055D4] focus:border-transparent appearance-none"
            >
              <option value="">Select your department</option>
              {RISK_OWNERS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          </div>
        </div>

        {/* Role Field */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">
            Role
          </label>
          <div className="relative">
            <select
              id="role"
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0055D4] focus:border-transparent appearance-none"
            >
              <option value="viewer">Viewer (Read-only)</option>
              <option value="manager">Manager (Edit access)</option>
              <option value="admin">Admin (Full access)</option>
            </select>
            <Shield className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
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
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-600">Password strength:</span>
                <span className="text-xs font-medium text-slate-700">
                  {getPasswordStrengthText(passwordStrength.score)}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getPasswordStrengthColor(passwordStrength.score)}`}
                  style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                />
              </div>
              {passwordStrength.feedback.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {passwordStrength.feedback.map((feedback, index) => (
                    <li key={index} className="flex items-start space-x-1">
                      <X className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-red-600">{feedback}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={handleChange}
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
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start">
          <input
            id="acceptTerms"
            name="acceptTerms"
            type="checkbox"
            required
            checked={formData.acceptTerms}
            onChange={handleChange}
            className="h-4 w-4 text-[#0055D4] border-slate-300 rounded focus:ring-[#0055D4] mt-0.5"
          />
          <label htmlFor="acceptTerms" className="ml-2 text-sm text-slate-600">
            I agree to the{' '}
            <a href="#" className="text-[#0055D4] hover:text-[#0044a3]">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-[#0055D4] hover:text-[#0044a3]">Privacy Policy</a>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={
            loading || 
            !formData.acceptTerms || 
            !passwordStrength.isValid ||
            formData.password !== formData.confirmPassword
          }
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>

        {/* Login Link */}
        <div className="text-center pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[#0055D4] hover:text-[#0044a3] font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};