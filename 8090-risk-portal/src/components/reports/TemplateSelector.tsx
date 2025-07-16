import React from 'react';
import { reportTemplates } from '../../data/reportTemplates';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-slate-900">Select Report Template:</h3>
      <div className="space-y-3">
        {Object.values(reportTemplates).map((template) => (
          <label
            key={template.id}
            className={`
              flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all
              ${selectedTemplate === template.id 
                ? 'border-accent bg-accent/5' 
                : 'border-slate-200 hover:border-slate-300 bg-white'
              }
            `}
          >
            <input
              type="radio"
              name="template"
              value={template.id}
              checked={selectedTemplate === template.id}
              onChange={(e) => onTemplateChange(e.target.value)}
              className="mt-1 h-4 w-4 text-accent border-slate-300 focus:ring-accent"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center">
                <span className="text-sm font-medium text-slate-900">
                  {template.name}
                </span>
                {template.id === 'assessment' && (
                  <span className="ml-2 text-xs bg-accent/10 text-accent px-2 py-0.5 rounded">
                    Compliance Ready
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {template.description}
              </p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};