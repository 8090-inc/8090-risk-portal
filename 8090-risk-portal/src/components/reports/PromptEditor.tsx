import React, { useEffect, useRef } from 'react';
import { getTemplateVariables } from '../../utils/reportDataProcessor';

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  onReset: () => void;
  isModified: boolean;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  value,
  onChange,
  onReset,
  isModified
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const variables = getTemplateVariables();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);


  const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = value.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-900">Customize Prompt Template:</h3>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-500">
            {wordCount} words • {charCount} characters
          </span>
          {isModified && (
            <button
              onClick={onReset}
              className="text-sm text-accent hover:text-accent/80 transition-colors"
            >
              Reset to Default
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[300px] p-4 text-sm font-mono bg-white border border-slate-200 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent
                     resize-none transition-all"
          placeholder="Enter your prompt template here..."
          spellCheck={false}
        />
      </div>

      <div className="bg-slate-50 rounded-lg p-4">
        <h4 className="text-xs font-medium text-slate-700 uppercase tracking-wider mb-2">
          Available Variables:
        </h4>
        <div className="flex flex-wrap gap-2">
          {variables.map((variable) => (
            <code
              key={variable}
              className="text-xs bg-white px-2 py-1 rounded border border-slate-200 text-accent"
            >
              {variable}
            </code>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-600">
          These variables will be automatically replaced with actual data when generating the report.
        </p>
      </div>

      {/* Save as custom template option - for future enhancement */}
      <div className="flex justify-end">
        <button
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          onClick={() => {
            // Future: Save custom template
            alert('Custom template saving will be available in a future update.');
          }}
        >
          Save as Custom Template
        </button>
      </div>
    </div>
  );
};