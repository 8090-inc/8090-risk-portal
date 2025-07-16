import React from 'react';
import { cn } from '../../utils/cn';

interface MitigationDisplayProps {
  content: string;
  className?: string;
}

export const MitigationDisplay: React.FC<MitigationDisplayProps> = ({ content, className }) => {
  // Enhanced text formatting for regulations and references
  const renderEnhancedText = (text: string): React.ReactNode => {
    // Pattern to match various regulation formats
    const patterns = [
      /\b(21 CFR \d+(?:\.\d+)*(?:\([a-z0-9]+\))*)/g,
      /\b(NIST [A-Z]{2}-\d+)/g,
      /\b(GDPR Article \d+)/g,
      /\b(HIPAA[^,;.]*§[^,;.]+)/g,
      /§\s*[\d.]+(?:\([a-z0-9]+\))+/g,
      /\[§[^\]]+\]/g,
      /\b(ISO \d+(?::\d+)?)/g,
      /\b(AES-\d+)/g
    ];
    
    let processedText = text;
    const replacements: Array<{ start: number; end: number; text: string }> = [];
    
    // Find all matches
    patterns.forEach(pattern => {
      const matches = Array.from(text.matchAll(pattern));
      matches.forEach(match => {
        if (match.index !== undefined) {
          replacements.push({
            start: match.index,
            end: match.index + match[0].length,
            text: match[0]
          });
        }
      });
    });
    
    // Sort replacements by start position (descending) to avoid index issues
    replacements.sort((a, b) => b.start - a.start);
    
    // Build the result with React elements
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Remove duplicates and overlaps
    const uniqueReplacements = replacements.filter((r, i) => {
      return !replacements.some((other, j) => 
        j < i && other.start <= r.start && other.end >= r.end
      );
    });
    
    // Sort again by start position (ascending) for processing
    uniqueReplacements.sort((a, b) => a.start - b.start);
    
    uniqueReplacements.forEach((replacement, idx) => {
      // Add text before the match
      if (replacement.start > lastIndex) {
        elements.push(text.substring(lastIndex, replacement.start));
      }
      
      // Add the formatted match
      elements.push(
        <code key={`code-${idx}`} className="px-1 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-mono">
          {replacement.text}
        </code>
      );
      
      lastIndex = replacement.end;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }
    
    return elements.length > 0 ? elements : text;
  };

  // Parse the mitigation text and format it
  const formatMitigation = (text: string): React.ReactNode => {
    const sections: React.ReactNode[] = [];
    
    // First, split by numbered items
    const numberedPattern = /(\d+)\.\s+([^:]+):\s*([^]*?)(?=\d+\.\s+[^:]+:|$)/g;
    const matches = Array.from(text.matchAll(numberedPattern));
    
    if (matches.length > 0) {
      matches.forEach((match, index) => {
        const [, number, title, content] = match;
        
        sections.push(
          <div key={`section-${index}`} className="mb-6 last:mb-0">
            <h4 className="font-semibold text-gray-900 mb-2">
              {number}. {title.trim()}
            </h4>
            <div className="text-sm text-gray-700 leading-relaxed pl-4">
              {renderEnhancedText(content.trim())}
            </div>
          </div>
        );
      });
    } else {
      // Try to find bullet points
      const bulletLines = text.split(/(?=•)/g).filter(line => line.trim());
      
      if (bulletLines.length > 1 && bulletLines.some(line => line.startsWith('•'))) {
        sections.push(
          <ul key="bullet-list" className="space-y-3">
            {bulletLines
              .filter(line => line.trim().startsWith('•'))
              .map((line, idx) => {
                const content = line.substring(1).trim();
                return (
                  <li key={`bullet-${idx}`} className="flex items-start">
                    <span className="text-gray-400 mr-2 mt-0.5">•</span>
                    <span className="text-sm text-gray-700 leading-relaxed flex-1">
                      {renderEnhancedText(content)}
                    </span>
                  </li>
                );
              })}
          </ul>
        );
      } else {
        // Check for line breaks and format as paragraphs
        const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
        
        if (paragraphs.length > 1) {
          paragraphs.forEach((para, idx) => {
            sections.push(
              <p key={`para-${idx}`} className="text-sm text-gray-700 leading-relaxed mb-3 last:mb-0">
                {renderEnhancedText(para.trim())}
              </p>
            );
          });
        } else {
          // Single paragraph or unformatted text
          sections.push(
            <div key="default" className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {renderEnhancedText(text.trim())}
            </div>
          );
        }
      }
    }
    
    return sections;
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      {formatMitigation(content)}
    </div>
  );
};