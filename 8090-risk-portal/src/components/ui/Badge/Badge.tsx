import React from 'react';
import classNames from 'classnames';

type BadgeVariant = 
  | 'default' 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'danger'
  | 'risk-critical'
  | 'risk-high'
  | 'risk-medium'
  | 'risk-low'
  | 'status-implemented'
  | 'status-in-progress'
  | 'status-not-implemented'
  | 'status-overdue'
  | 'status-due-soon';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-md';
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };
  
  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-600/20',
    primary: 'bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-600/20',
    secondary: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-600/20',
    success: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
    danger: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
    'risk-critical': 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
    'risk-high': 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20',
    'risk-medium': 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
    'risk-low': 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
    'status-implemented': 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
    'status-in-progress': 'bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-600/20',
    'status-not-implemented': 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-600/20',
    'status-overdue': 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
    'status-due-soon': 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'
  };
  
  return (
    <span
      className={classNames(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
};