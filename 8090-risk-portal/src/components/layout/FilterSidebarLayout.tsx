import React from 'react';
import { AdvancedFilterPanel } from '../common/AdvancedFilterPanel';

interface FilterSidebarLayoutProps {
  children: React.ReactNode;
  filterType: 'risks' | 'controls';
  sidebarContent?: React.ReactNode;
}

export const FilterSidebarLayout: React.FC<FilterSidebarLayoutProps> = ({ 
  children, 
  filterType,
  sidebarContent 
}) => {
  return (
    <div className="flex h-full bg-gray-50 min-w-0 overflow-x-hidden">
      {/* Left Sidebar with Filters */}
      <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto overflow-x-hidden">
        <div className="p-4 space-y-4">
          <AdvancedFilterPanel type={filterType} />
          {sidebarContent}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};