import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../../utils/cn';

interface MitigationDisplayProps {
  content: string;
  className?: string;
}

export const MitigationDisplay: React.FC<MitigationDisplayProps> = ({ content, className }) => {
  // Check if content looks like markdown (has markdown formatting)
  const hasMarkdownFormatting = (text: string): boolean => {
    const markdownPatterns = [
      /\*\*[^*]+\*\*/,           // Bold text **text**
      /^\s*•\s+\*\*[^*]+\*\*/m,  // Bullet points with bold • **text**
      /^\s*\*\s+/m,             // Markdown bullets * item
      /^\s*-\s+/m,              // Markdown bullets - item
      /^\s*\d+\.\s+/m,          // Numbered lists 1. item
      /#{1,6}\s+/,              // Headers # text
      /`[^`]+`/,                // Inline code `code`
      /\[[^\]]+\]\([^)]+\)/     // Links [text](url)
    ];
    
    return markdownPatterns.some(pattern => pattern.test(text));
  };

  // Enhanced regex patterns for regulation references that should be styled as code
  const enhanceRegulationReferences = (text: string): string => {
    const patterns = [
      // Match regulation patterns and wrap them in backticks for markdown code formatting
      { pattern: /\b(21 CFR \d+(?:\.\d+)*(?:\([a-z0-9]+\))*)/g, replacement: '`$1`' },
      { pattern: /\b(NIST [A-Z]{0,2}-?\d+)/g, replacement: '`$1`' },
      { pattern: /\b(GDPR Article \d+)/g, replacement: '`$1`' },
      { pattern: /\b(HIPAA[^,;.]*§[^,;.]+)/g, replacement: '`$1`' },
      { pattern: /§\s*[\d.]+(?:\([a-z0-9]+\))+/g, replacement: '`$&`' },
      { pattern: /\[§[^\]]+\]/g, replacement: '`$&`' },
      { pattern: /\b(ISO \d+(?::\d+)?)/g, replacement: '`$1`' },
      { pattern: /\b(AES-\d+)/g, replacement: '`$1`' },
      // Control references like (SEC-06), (LOG-03), etc.
      { pattern: /\(([A-Z]{2,3}-\d{2})\)/g, replacement: '(`$1`)' },
      // TLS version references
      { pattern: /\b(TLS ≥ \d+\.\d+)/g, replacement: '`$1`' }
    ];
    
    let enhancedText = text;
    patterns.forEach(({ pattern, replacement }) => {
      enhancedText = enhancedText.replace(pattern, replacement);
    });
    
    return enhancedText;
  };

  // Prepare content for markdown rendering
  const prepareMarkdownContent = (text: string): string => {
    let preparedText = text;
    
    // If it already has markdown formatting, enhance regulation references
    if (hasMarkdownFormatting(text)) {
      preparedText = enhanceRegulationReferences(text);
    } else {
      // For legacy content, try to convert to markdown format
      
      // Convert numbered items to markdown
      preparedText = preparedText.replace(
        /(\d+)\.\s+([^:]+):\s*/g, 
        '\n## $1. $2\n\n'
      );
      
      // Convert bullet points that start with numbers/text to proper markdown
      preparedText = preparedText.replace(
        /(?:^|\n)\s*•\s*/g, 
        '\n- '
      );
      
      // Enhance regulation references
      preparedText = enhanceRegulationReferences(preparedText);
    }
    
    return preparedText.trim();
  };

  const markdownContent = prepareMarkdownContent(content);
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="prose prose-sm max-w-none prose-gray">
        <ReactMarkdown
          components={{
          // Custom styling for different markdown elements
          h1: ({ children }) => (
            <h1 className="text-lg font-semibold text-gray-900 mb-3 mt-6 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold text-gray-900 mb-2 mt-4 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-gray-900 mb-2 mt-3 first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-sm text-gray-700 leading-relaxed mb-3 last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="space-y-2 mb-4 last:mb-0">
              {children}
            </ul>
          ),
          li: ({ children }) => (
            <li className="text-sm text-gray-700 leading-relaxed flex items-start">
              <span className="text-gray-400 mr-2 mt-0.5 flex-shrink-0">•</span>
              <span className="flex-1">{children}</span>
            </li>
          ),
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-mono border">
              {children}
            </code>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">
              {children}
            </strong>
          ),
          // Handle pre blocks (though we're mainly using inline code)
          pre: ({ children }) => (
            <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto border">
              {children}
            </pre>
          ),
          // Custom blockquote styling
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-200 pl-4 py-2 bg-blue-50 text-sm text-gray-700 italic">
              {children}
            </blockquote>
          )
          }}
        >
          {markdownContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};