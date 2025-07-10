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
  ChevronRight
} from 'lucide-react';
import { useUIStore } from '../../store';
import { cn } from '../../utils/cn';
import { GlobalSearch } from '../common/GlobalSearch';

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
            ? "bg-8090-primary text-white"
            : "text-gray-700 hover:bg-gray-100",
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

  const iconSize = sidebarCollapsed ? "h-6 w-6" : "h-5 w-5";
  
  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard className={iconSize} />, label: 'Dashboard' },
    { to: '/controls', icon: <Shield className={iconSize} />, label: 'Controls' },
    { to: '/risks', icon: <FileWarning className={iconSize} />, label: 'Risk Register' },
    { to: '/matrix', icon: <Grid3X3 className={iconSize} />, label: 'Risk Matrix' },
    { to: '/reports', icon: <FileText className={iconSize} />, label: 'Reports' },
  ];

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-10",
      sidebarCollapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!sidebarCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-8090-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">8</span>
            </div>
            <h1 className="text-xl font-bold text-8090-primary">Risk Portal</h1>
          </div>
        ) : (
          <div className="h-8 w-8 bg-8090-primary rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold">8</span>
          </div>
        )}
      </div>

      {/* Search - Only show when expanded */}
      {!sidebarCollapsed && (
        <div className="px-4 py-3">
          <GlobalSearch />
        </div>
      )}

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

      {/* Settings - Bottom */}
      <div className="absolute bottom-8 left-0 right-0 px-4 space-y-2">
        <NavItem
          to="/settings"
          icon={<Settings className={iconSize} />}
          label="Settings"
          collapsed={sidebarCollapsed}
        />
        
        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "w-full flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all",
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