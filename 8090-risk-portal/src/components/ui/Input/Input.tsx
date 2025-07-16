import React from 'react';
import classNames from 'classnames';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helpText,
  fullWidth = false,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={classNames('', fullWidth && 'w-full')}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={classNames(
          'block rounded-md border-slate-300 shadow-sm',
          'focus:border-accent focus:ring-accent sm:text-sm',
          'text-slate-900 placeholder-slate-400',
          error && 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500',
          fullWidth && 'w-full',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined
        }
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600" id={`${inputId}-error`}>
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="mt-2 text-sm text-slate-600" id={`${inputId}-help`}>
          {helpText}
        </p>
      )}
    </div>
  );
};