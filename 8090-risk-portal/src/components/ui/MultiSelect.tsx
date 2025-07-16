import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface MultiSelectOption {
  value: string;
  label: string;
  count?: number;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select options...',
  className,
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleSelectAll = () => {
    if (value.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map(o => o.value));
    }
  };

  const selectedLabels = value
    .map(v => options.find(o => o.value === v)?.label)
    .filter(Boolean);

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg',
          'hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-8090-primary/20',
          'flex items-center justify-between'
        )}
      >
        <span className="truncate">
          {selectedLabels.length > 0
            ? `${selectedLabels.length} selected`
            : placeholder}
        </span>
        <ChevronDown className={cn(
          'h-4 w-4 transition-transform',
          isOpen && 'transform rotate-180'
        )} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.length > 3 && (
            <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-50 rounded"
              >
                {value.length === options.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          )}
          
          <div className="p-1">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center px-2 py-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={value.includes(option.value)}
                  onChange={() => handleToggle(option.value)}
                  className="h-4 w-4 text-8090-primary rounded border-gray-300 focus:ring-8090-primary/20"
                />
                <span className="ml-2 flex-1 text-sm text-gray-700">
                  {option.label}
                </span>
                {option.count !== undefined && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({option.count})
                  </span>
                )}
                {value.includes(option.value) && (
                  <Check className="h-4 w-4 text-8090-primary ml-1" />
                )}
              </label>
            ))}
          </div>
        </div>
      )}
      
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedLabels.slice(0, 3).map((label, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
            >
              {label}
            </span>
          ))}
          {selectedLabels.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
              +{selectedLabels.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};