import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DateRangePickerProps {
  value?: { start: Date | null; end: Date | null };
  onChange: (range: { start: Date | null; end: Date | null }) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select date range',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localStart, setLocalStart] = useState<string>(
    value?.start ? value.start.toISOString().split('T')[0] : ''
  );
  const [localEnd, setLocalEnd] = useState<string>(
    value?.end ? value.end.toISOString().split('T')[0] : ''
  );

  const handleApply = () => {
    onChange({
      start: localStart ? new Date(localStart) : null,
      end: localEnd ? new Date(localEnd) : null
    });
    setIsOpen(false);
  };

  const handleClear = () => {
    setLocalStart('');
    setLocalEnd('');
    onChange({ start: null, end: null });
    setIsOpen(false);
  };

  const formatDateRange = () => {
    if (!value?.start && !value?.end) return placeholder;
    if (value.start && !value.end) return `From ${value.start.toLocaleDateString()}`;
    if (!value.start && value.end) return `Until ${value.end.toLocaleDateString()}`;
    return `${value.start?.toLocaleDateString()} - ${value.end?.toLocaleDateString()}`;
  };

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-8090-primary focus:border-transparent"
      >
        <span className={cn(
          'text-sm',
          (!value?.start && !value?.end) && 'text-gray-500'
        )}>
          {formatDateRange()}
        </span>
        <Calendar className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={localStart}
                onChange={(e) => setLocalStart(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-8090-primary focus:border-transparent text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={localEnd}
                onChange={(e) => setLocalEnd(e.target.value)}
                min={localStart}
                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-8090-primary focus:border-transparent text-sm"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-3 py-1.5 text-sm bg-8090-primary text-white rounded hover:bg-8090-primary/90"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};