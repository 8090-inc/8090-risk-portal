import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Shield, 
  FileWarning, 
  Grid3X3, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  Lightbulb
} from 'lucide-react';
import { useUIStore, useCurrentUser } from '../../store';
import { cn } from '../../utils/cn';
import { getUserPermissions } from '../../types/auth.types';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, collapsed }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center rounded-lg transition-all",
          isActive
            ? "bg-[#0055D4] text-white"
            : "text-slate-700 hover:bg-slate-100",
          collapsed ? "justify-center px-4 py-3" : "px-3 py-2 space-x-3"
        )
      }
    >
      {icon}
      {!collapsed && <span className="text-sm font-medium">{label}</span>}
    </NavLink>
  );
};

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const user = useCurrentUser();
  const permissions = user ? getUserPermissions(user.role) : null;

  const iconSize = sidebarCollapsed ? "h-6 w-6" : "h-5 w-5";
  
  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard className={iconSize} />, label: 'Dashboard' },
    { to: '/controls', icon: <Shield className={iconSize} />, label: 'Controls' },
    { to: '/risks', icon: <FileWarning className={iconSize} />, label: 'Risk Register' },
    { to: '/usecases', icon: <Lightbulb className={iconSize} />, label: 'Use Cases' },
    { to: '/matrix', icon: <Grid3X3 className={iconSize} />, label: 'Risk Matrix' },
    { to: '/reports', icon: <FileText className={iconSize} />, label: 'Reports' },
  ];

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full bg-white border-r border-slate-200 transition-all duration-300 z-10 flex flex-col",
      sidebarCollapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 flex-shrink-0">
        {!sidebarCollapsed ? (
          <div className="flex items-center space-x-3">
            <img 
              src="/8090-logo.png" 
              alt="8090" 
              className="h-8 w-auto object-contain"
            />
            <span className="text-slate-400 text-lg">×</span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">Dompé</span>
              <span className="text-xs text-slate-500">Risk Portal</span>
            </div>
          </div>
        ) : (
          <img 
            src="/8090-logo.png" 
            alt="8090" 
            className="h-8 w-8 object-contain mx-auto"
          />
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>

      </div>


      {/* Settings - Bottom */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-slate-200 space-y-2">
        <NavItem
          to="/account"
          icon={<User className={iconSize} />}
          label="Account"
          collapsed={sidebarCollapsed}
        />
        
        {permissions?.canAccessSettings && (
          <NavItem
            to="/settings"
            icon={<Settings className={iconSize} />}
            label="Settings"
            collapsed={sidebarCollapsed}
          />
        )}
        
        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "w-full flex items-center px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-all",
            sidebarCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {!sidebarCollapsed && <span className="text-sm font-medium">Collapse</span>}
          {sidebarCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </aside>
  );
};