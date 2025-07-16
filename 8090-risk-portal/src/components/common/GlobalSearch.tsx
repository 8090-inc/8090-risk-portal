import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, FileWarning, Shield, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRiskStore, useControlStore } from '../../store';
import { cn } from '../../utils/cn';
import type { Risk, Control } from '../../types';

interface SearchResult {
  type: 'risk' | 'control';
  item: Risk | Control;
  matches: string[];
}

export const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { risks } = useRiskStore();
  const { controls } = useControlStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search logic
  const searchResults = useMemo<SearchResult[]>(() => {
    if (!searchTerm || searchTerm.length < 2) return [];

    const term = searchTerm.toLowerCase();
    const results: SearchResult[] = [];

    // Search risks
    risks.forEach(risk => {
      const matches: string[] = [];
      
      if (risk.id.toLowerCase().includes(term)) {
        matches.push(`ID: ${risk.id}`);
      }
      if (risk.risk.toLowerCase().includes(term)) {
        matches.push(`Name: ${risk.risk}`);
      }
      if (risk.riskDescription.toLowerCase().includes(term)) {
        matches.push(`Description: ${risk.riskDescription}`);
      }
      if (risk.riskCategory.toLowerCase().includes(term)) {
        matches.push(`Category: ${risk.riskCategory}`);
      }
      if (risk.agreedMitigation.toLowerCase().includes(term)) {
        matches.push(`Mitigation: ${risk.agreedMitigation}`);
      }
      
      if (matches.length > 0) {
        results.push({ type: 'risk', item: risk, matches });
      }
    });

    // Search controls
    controls.forEach(control => {
      const matches: string[] = [];
      
      if (control.mitigationID.toLowerCase().includes(term)) {
        matches.push(`ID: ${control.mitigationID}`);
      }
      if (control.mitigationDescription.toLowerCase().includes(term)) {
        matches.push(`Description: ${control.mitigationDescription}`);
      }
      if (control.category.toLowerCase().includes(term)) {
        matches.push(`Category: ${control.category}`);
      }
      
      if (matches.length > 0) {
        results.push({ type: 'control', item: control, matches });
      }
    });

    // Sort by relevance (number of matches)
    return results.sort((a, b) => b.matches.length - a.matches.length).slice(0, 10);
  }, [searchTerm, risks, controls]);

  // Handle navigation
  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'risk') {
      navigate(`/risks/${(result.item as Risk).id}`);
    } else {
      navigate(`/controls/${(result.item as Control).mitigationID}`);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
      } else if (e.key === 'Enter' && searchResults.length > 0) {
        e.preventDefault();
        handleResultClick(searchResults[selectedIndex]);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex]);

  // Highlight matching text
  const highlightText = (text: string, term: string) => {
    if (!term) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-accent-100 font-medium text-accent-700">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" data-testid="search-icon" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(e.target.value.length > 0);
            setSelectedIndex(0);
          }}
          onFocus={() => searchTerm && setIsOpen(true)}
          placeholder="Search risks and controls..."
          className="w-full pl-9 pr-9 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent outline-none bg-slate-50 focus:bg-white transition-colors"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-md shadow-lg border border-slate-200 max-h-96 overflow-y-auto">
          {searchResults.length === 0 && searchTerm.length >= 2 ? (
            <div className="p-4 text-center text-slate-500">
              No results found for "{searchTerm}"
            </div>
          ) : searchTerm.length < 2 ? (
            <div className="p-4 text-center text-slate-500">
              Type at least 2 characters to search
            </div>
          ) : (
            <ul className="py-2">
              {searchResults.map((result, index) => {
                const isRisk = result.type === 'risk';
                const item = result.item as Risk & Control;
                const id = isRisk ? item.id : item.mitigationID;
                const name = isRisk ? (item as Risk).risk : item.mitigationDescription;
                
                return (
                  <li key={`${result.type}-${id}`}>
                    <button
                      onClick={() => handleResultClick(result)}
                      className={cn(
                        "w-full px-4 py-3 flex items-start hover:bg-slate-50 transition-colors text-left",
                        selectedIndex === index && "bg-slate-50"
                      )}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {isRisk ? (
                          <FileWarning className="h-5 w-5 text-accent" />
                        ) : (
                          <Shield className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900">
                            {highlightText(name, searchTerm)}
                          </p>
                          <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0 ml-2" />
                        </div>
                        
                        <div className="mt-1 space-y-1">
                          <p className="text-xs text-slate-600">
                            {isRisk ? 'Risk' : 'Control'} • {highlightText(id.toUpperCase(), searchTerm)}
                          </p>
                          
                          {/* Show first matching field */}
                          {result.matches.length > 0 && (
                            <p className="text-xs text-slate-500 truncate">
                              {highlightText(result.matches[0], searchTerm)}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};