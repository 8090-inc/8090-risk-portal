// Authentication pages layout with branding

import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      {/* Company Logos */}
      <div className="mb-8 flex items-center justify-center space-x-8">
        <img 
          src="/8090-logo.png" 
          alt="8090" 
          className="h-16 w-auto"
        />
        <div className="h-12 w-px bg-slate-300"></div>
        <img 
          src="/dompe-logo.png" 
          alt="Dompé" 
          className="h-12 w-auto"
        />
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
            )}
          </div>

          {/* Content */}
          {children}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} 8090 Risk Portal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};