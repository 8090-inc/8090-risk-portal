import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className,
  autoFocus = false
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <div className={cn(
      "relative group",
      className
    )}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className={cn(
          "h-5 w-5 transition-colors",
          isFocused ? "text-accent" : "text-slate-400"
        )} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          "block w-full pl-10 pr-10 py-2.5 text-sm border rounded-md transition-all",
          "placeholder:text-slate-400",
          isFocused 
            ? "border-accent ring-2 ring-accent/20 bg-white" 
            : "border-slate-300 hover:border-slate-400 bg-white",
          "focus:outline-none"
        )}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <X className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors" />
        </button>
      )}
    </div>
  );
};