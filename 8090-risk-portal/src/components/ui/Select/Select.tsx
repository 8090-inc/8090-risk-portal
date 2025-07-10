import React from 'react';
import classNames from 'classnames';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  helpText?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
  multiple?: boolean;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helpText,
  options,
  placeholder = 'Select an option',
  fullWidth = false,
  className,
  id,
  multiple,
  value,
  onChange,
  name,
  disabled,
  required
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={classNames('', fullWidth && 'w-full')}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={classNames(
          'block rounded-md border-gray-300 shadow-sm',
          'focus:border-8090-primary focus:ring-8090-primary sm:text-sm',
          error && 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500',
          fullWidth && 'w-full',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          error ? `${selectId}-error` : helpText ? `${selectId}-help` : undefined
        }
        multiple={multiple}
        value={value}
        onChange={(e) => {
          if (onChange) {
            if (multiple) {
              const selectedOptions = Array.from(e.target.selectedOptions).map(opt => opt.value);
              onChange(selectedOptions);
            } else {
              onChange(e.target.value);
            }
          }
        }}
        name={name}
        disabled={disabled}
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-2 text-sm text-red-600" id={`${selectId}-error`}>
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="mt-2 text-sm text-gray-500" id={`${selectId}-help`}>
          {helpText}
        </p>
      )}
    </div>
  );
};