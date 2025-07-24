import React from 'react';
import classNames from 'classnames';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  className,
  padding = 'md',
  shadow = 'sm',
  hover = false,
  ...rest
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };
  
  return (
    <div
      {...rest}
      className={classNames(
        'bg-white rounded-lg border border-slate-200',
        paddingClasses[padding],
        shadowClasses[shadow],
        hover && 'hover:shadow-md transition-shadow cursor-pointer',
        className
      )}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};