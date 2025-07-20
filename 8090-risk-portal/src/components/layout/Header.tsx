import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrentUser, useAuthStore } from '../../store/authStore';
import { Badge } from '../ui/Badge';

export const Header: React.FC = () => {
  const user = useCurrentUser();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    // The page will redirect, so no further code will execute.
  };

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'manager': return 'warning';
      default: return 'default';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6">
      <div className="flex items-center flex-1">
        <h1 className="text-lg font-medium text-slate-700">AI Risk Portal</h1>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
          >
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500">{user?.email || 'Loading...'}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-[#0055D4] flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-slate-200">
                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={getRoleBadgeVariant(user?.role)} size="sm">
                    {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
                  </Badge>
                  <span className="text-xs text-slate-500">{user?.department}</span>
                </div>
              </div>

              {/* Menu Items */}
              <Link
                to="/account"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center space-x-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Account Settings</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};