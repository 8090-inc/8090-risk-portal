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
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-orange-100 text-orange-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    'risk-critical': 'bg-red-100 text-red-800',
    'risk-high': 'bg-orange-100 text-orange-800',
    'risk-medium': 'bg-yellow-100 text-yellow-800',
    'risk-low': 'bg-green-100 text-green-800',
    'status-implemented': 'bg-green-100 text-green-800',
    'status-in-progress': 'bg-blue-100 text-blue-800',
    'status-not-implemented': 'bg-gray-100 text-gray-800',
    'status-overdue': 'bg-red-100 text-red-800',
    'status-due-soon': 'bg-yellow-100 text-yellow-800'
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