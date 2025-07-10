import React from 'react';
import { Bell, User } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
      <div className="flex items-center flex-1">
        {/* Page title or breadcrumbs can go here */}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">admin@dompe.com</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-8090-primary flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        </button>
      </div>
    </header>
  );
};