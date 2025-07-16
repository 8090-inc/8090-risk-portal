import React from 'react';

interface PageHeaderProps {
  title: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  actions 
}) => {
  return (
    <div className="bg-white shadow-sm border-b border-slate-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
          </div>
          {actions && (
            <div className="ml-4 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};