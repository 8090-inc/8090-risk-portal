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
    
    // Clean up the text first - normalize whitespace and line breaks
    preparedText = preparedText
      .replace(/\r?\n/g, ' ')  // Replace line breaks with spaces
      .replace(/\s+/g, ' ')    // Normalize multiple spaces to single space
      .trim();
    
    // If it already has markdown formatting, enhance regulation references
    if (hasMarkdownFormatting(text)) {
      preparedText = enhanceRegulationReferences(preparedText);
    } else {
      // For legacy content, try to convert to markdown format with better structure
      
      // Break content into logical sections by looking for patterns
      
      // Pattern 1: Look for section breaks with bullet points (•)
      preparedText = preparedText.replace(
        /\s*•\s*([^•]+)/g, 
        '\n\n- **$1**'
      );
      
      // Pattern 2: Look for numbered sections like "1. Something:" or "[A] Something:"
      preparedText = preparedText.replace(
        /\s*(\d+)\.\s*([^:]+):\s*/g, 
        '\n\n## $1. $2\n\n'
      );
      
      preparedText = preparedText.replace(
        /\s*\[([A-Z])\]\s*([^:]+):\s*/g, 
        '\n\n## $1. $2\n\n'
      );
      
      // Pattern 3: Break long sentences at natural breaks (periods followed by capital letters)
      preparedText = preparedText.replace(
        /\.\s+([A-Z][^.]*[^A-Z]\s)/g, 
        '.\n\n$1'
      );
      
      // Pattern 4: Create section breaks before "Technical:", "Procedural:", "Compliance:", etc.
      preparedText = preparedText.replace(
        /\s*(Technical|Procedural|Compliance|System|Contractual):\s*/g, 
        '\n\n### $1:\n\n'
      );
      
      // Pattern 5: Look for responsibility sections
      preparedText = preparedText.replace(
        /\s*([^'s]+['']s\s+Responsibilities?):\s*/g, 
        '\n\n### $1:\n\n'
      );
      
      // Pattern 6: Break at common phrases that start new sections
      preparedText = preparedText.replace(
        /\s*(The system will|8090 will|Dompe will|Establish|Implement|Ensure)\s+/g, 
        '\n\n- **$1** '
      );
      
      // Enhance regulation references
      preparedText = enhanceRegulationReferences(preparedText);
    }
    
    // Final cleanup - remove excessive line breaks and normalize spacing
    preparedText = preparedText
      .replace(/\n{3,}/g, '\n\n')  // Replace 3+ line breaks with double
      .replace(/^\n+/, '')         // Remove leading line breaks
      .replace(/\n+$/, '')         // Remove trailing line breaks
      .trim();
    
    return preparedText;
  };

  const markdownContent = prepareMarkdownContent(content);
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          components={{
          // Custom styling for different markdown elements
          h1: ({ children }) => (
            <h1 className="text-lg font-semibold text-gray-900 mb-4 mt-6 first:mt-0 border-b border-gray-200 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold text-gray-900 mb-3 mt-5 first:mt-0 text-blue-800">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-gray-800 mb-2 mt-4 first:mt-0 text-green-700">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-sm text-gray-700 leading-6 mb-4 last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="space-y-3 mb-5 last:mb-0 pl-2">
              {children}
            </ul>
          ),
          li: ({ children }) => (
            <li className="text-sm text-gray-700 leading-6 flex items-start">
              <span className="text-blue-500 mr-3 mt-1 flex-shrink-0 font-semibold">•</span>
              <span className="flex-1">{children}</span>
            </li>
          ),
          code: ({ children }) => (
            <code className="px-2 py-1 bg-blue-50 text-blue-800 rounded text-xs font-mono border border-blue-200 whitespace-nowrap">
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
            <pre className="bg-gray-50 p-4 rounded-md text-xs overflow-x-auto border border-gray-200 my-4">
              {children}
            </pre>
          ),
          // Custom blockquote styling for important notes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-300 pl-4 py-3 bg-blue-50 text-sm text-gray-700 italic my-4 rounded-r-md">
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