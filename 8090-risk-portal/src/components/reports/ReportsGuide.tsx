import React from 'react';
import { Info } from 'lucide-react';

export const ReportsGuide: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="ml-3">
          <h4 className="text-sm font-medium text-blue-900">How to Generate Reports</h4>
          <ol className="mt-2 text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Select a report template (Executive Summary or Risk Assessment)</li>
            <li>Review and customize the prompt template if needed</li>
            <li>Click "Generate Report" to create your AI-powered report</li>
            <li>Export the generated report in your preferred format</li>
          </ol>
          <p className="mt-2 text-xs text-blue-700">
            Note: You'll need to add your Gemini API key. Go to{' '}
            <a href="/settings" className="underline font-medium">
              Settings → API Configuration
            </a>{' '}
            for instructions.
          </p>
        </div>
      </div>
    </div>
  );
};