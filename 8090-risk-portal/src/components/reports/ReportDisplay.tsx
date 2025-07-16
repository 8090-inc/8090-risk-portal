import React from 'react';
import { Copy, Download, FileText } from 'lucide-react';
import { Button } from '../ui/Button';

interface ReportDisplayProps {
  content: string;
  onCopy: () => void;
  onExportPDF: () => void;
  onExportDOCX: () => void;
}

export const ReportDisplay: React.FC<ReportDisplayProps> = ({
  content,
  onCopy,
  onExportPDF,
  onExportDOCX
}) => {
  // Convert markdown-style formatting to HTML
  const formatContent = (text: string) => {
    return text
      .split('\n\n')
      .map((paragraph, idx) => {
        // Handle numbered sections
        if (paragraph.match(/^\d+\.\s/)) {
          return `<h3 key="${idx}" class="text-lg font-semibold text-slate-900 mt-6 mb-3">${paragraph}</h3>`;
        }
        // Handle bullet points
        if (paragraph.startsWith('•') || paragraph.startsWith('-')) {
          const items = paragraph.split('\n').map(item => 
            `<li>${item.replace(/^[•-]\s*/, '')}</li>`
          ).join('');
          return `<ul key="${idx}" class="list-disc list-inside space-y-1 text-slate-700 ml-4">${items}</ul>`;
        }
        // Handle bold text
        let formatted = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Regular paragraph
        return `<p key="${idx}" class="text-slate-700 leading-relaxed">${formatted}</p>`;
      })
      .join('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-900">Generated Report</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopy}
            icon={<Copy className="h-4 w-4" />}
          >
            Copy to Clipboard
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExportPDF}
            icon={<Download className="h-4 w-4" />}
          >
            Export as PDF
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExportDOCX}
            icon={<FileText className="h-4 w-4" />}
          >
            Export as DOCX
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6 max-h-[600px] overflow-y-auto">
        <div 
          className="prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: formatContent(content) }}
        />
      </div>

    </div>
  );
};