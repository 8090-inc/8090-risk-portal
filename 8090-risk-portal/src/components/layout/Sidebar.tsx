import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Shield, 
  FileWarning, 
  Grid3X3, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react';
import { useUIStore } from '../../store';
import { cn } from '../../utils/cn';
import { GlobalSearch } from '../common/GlobalSearch';
import { AdvancedFilterPanel } from '../common/AdvancedFilterPanel';

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
  const location = useLocation();

  const iconSize = sidebarCollapsed ? "h-6 w-6" : "h-5 w-5";
  
  // Determine which filter type to show based on current route
  const getFilterType = (): 'risks' | 'controls' | null => {
    if (location.pathname.startsWith('/risks')) return 'risks';
    if (location.pathname.startsWith('/controls')) return 'controls';
    return null;
  };
  
  const filterType = getFilterType();
  
  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard className={iconSize} />, label: 'Dashboard' },
    { to: '/controls', icon: <Shield className={iconSize} />, label: 'Controls' },
    { to: '/risks', icon: <FileWarning className={iconSize} />, label: 'Risk Register' },
    { to: '/matrix', icon: <Grid3X3 className={iconSize} />, label: 'Risk Matrix' },
    { to: '/reports', icon: <FileText className={iconSize} />, label: 'Reports' },
  ];

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-10 flex flex-col",
      sidebarCollapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
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

        {/* Search & Filters Section - Only show when expanded */}
        {!sidebarCollapsed && (
          <div className="px-4 py-4 border-t border-gray-200 space-y-4">
            {/* Section Header */}
            <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <Search className="h-3 w-3" />
              <span>Search & Filters</span>
            </div>
            
            {/* Global Search */}
            <div>
              <GlobalSearch />
            </div>

            {/* Advanced Filters - Only show on relevant pages */}
            {filterType && (
              <div className="pt-2">
                <AdvancedFilterPanel type={filterType} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Settings - Bottom */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 space-y-2">
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