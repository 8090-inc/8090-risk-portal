import React, { useState, useCallback, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { Button, Spinner } from '../components/ui';
import { PageHeader } from '../components/layout/PageHeader';
import { TemplateSelector } from '../components/reports/TemplateSelector';
import { PromptEditor } from '../components/reports/PromptEditor';
import { ReportDisplay } from '../components/reports/ReportDisplay';
import { ReportsGuide } from '../components/reports/ReportsGuide';
import { reportTemplates } from '../data/reportTemplates';
import { geminiService } from '../services/geminiService';
import { extractTemplateData } from '../utils/reportDataProcessor';
import { useRiskStore, useControlStore } from '../store';

export const ReportsView: React.FC = () => {
  // Get live data from stores
  const { risks, loadRisks } = useRiskStore();
  const { loadControls } = useControlStore();
  const [selectedTemplate, setSelectedTemplate] = useState('executive');
  const [currentPrompt, setCurrentPrompt] = useState(reportTemplates.executive.template);
  const [isModified, setIsModified] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load risks and controls on mount
  useEffect(() => {
    loadRisks();
    loadControls();
  }, [loadRisks, loadControls]);

  // Handle template change
  const handleTemplateChange = useCallback((templateId: string) => {
    setSelectedTemplate(templateId);
    setCurrentPrompt(reportTemplates[templateId].template);
    setIsModified(false);
    setError(null);
  }, []);

  // Handle prompt edit
  const handlePromptEdit = useCallback((value: string) => {
    setCurrentPrompt(value);
    setIsModified(value !== reportTemplates[selectedTemplate].template);
    setError(null);
  }, [selectedTemplate]);

  // Reset prompt to default
  const handleResetPrompt = useCallback(() => {
    setCurrentPrompt(reportTemplates[selectedTemplate].template);
    setIsModified(false);
  }, [selectedTemplate]);

  // Generate report
  const handleGenerateReport = async () => {
    console.log('Generate Report clicked');
    console.log('Gemini service configured:', geminiService.isConfigured());
    
    if (!geminiService.isConfigured()) {
      setError('Gemini API key not configured. Please add your API key in Settings or add VITE_GEMINI_API_KEY to your .env file.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress('Preparing data...');

    try {
      // Extract template data from live risks
      const templateData = extractTemplateData(risks);
      
      // Process the template with actual data
      const processedPrompt = geminiService.processTemplate(currentPrompt, templateData);
      
      // Generate the report
      const report = await geminiService.generateReport(
        processedPrompt,
        (progress) => setGenerationProgress(progress)
      );
      
      setGeneratedReport(report);
      setGenerationProgress('');
    } catch (error: any) {
      setError(error.message || 'Failed to generate report. Please try again.');
      setGeneratedReport(null);
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  // Copy report to clipboard
  const handleCopyReport = useCallback(() => {
    if (generatedReport) {
      navigator.clipboard.writeText(generatedReport);
      // Could add a toast notification here
      alert('Report copied to clipboard!');
    }
  }, [generatedReport]);

  // Export as PDF
  const handleExportPDF = useCallback(() => {
    if (generatedReport) {
      // Simple print dialog for now
      window.print();
      // In a real implementation, you'd use a library like jsPDF
    }
  }, [generatedReport]);

  // Export as DOCX
  const handleExportDOCX = useCallback(() => {
    if (generatedReport) {
      // For now, export as text file
      const blob = new Blob([generatedReport], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AI_Risk_Report_${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      // In a real implementation, you'd use a library like docx
    }
  }, [generatedReport]);

  return (
    <div className="h-full">
      <div className="space-y-6 p-6 overflow-y-auto">
        <PageHeader
          title={
            <span className="flex items-center">
              <FileText className="h-6 w-6 mr-2" />
              Reports
            </span>
          }
          description="Generate AI-powered reports and executive summaries for your risk assessment"
        />

      {/* Guide */}
      {!generatedReport && <ReportsGuide />}

      {/* Template Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <TemplateSelector
          selectedTemplate={selectedTemplate}
          onTemplateChange={handleTemplateChange}
        />
      </div>

      {/* Prompt Editor */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <PromptEditor
          value={currentPrompt}
          onChange={handlePromptEdit}
          onReset={handleResetPrompt}
          isModified={isModified}
        />
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button
          variant="primary"
          size="lg"
          onClick={handleGenerateReport}
          disabled={isGenerating || !currentPrompt.trim()}
          icon={<FileText className="h-5 w-5" />}
          className="px-8"
        >
          {isGenerating ? 'Generating Report...' : '📄 Generate Report'}
        </Button>
      </div>

      {/* Progress Message with Spinner */}
      {isGenerating && (
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center">
            <Spinner size="lg" />
          </div>
          {generationProgress && (
            <>
              <p className="text-sm text-slate-600 animate-pulse">{generationProgress}</p>
              <div className="mt-2 w-64 mx-auto bg-slate-200 rounded-full h-2">
                <div className="bg-accent h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
          {error.includes('API key') && (
            <div className="mt-2">
              <p className="text-sm text-red-600">
                Go to{' '}
                <a href="/settings" className="underline font-medium">
                  Settings → API Configuration
                </a>{' '}
                for instructions on adding your Gemini API key.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Generated Report */}
      {generatedReport && !isGenerating && (
        <div className="bg-slate-50 rounded-lg p-6">
          <ReportDisplay
            content={generatedReport}
            onCopy={handleCopyReport}
            onExportPDF={handleExportPDF}
            onExportDOCX={handleExportDOCX}
          />
        </div>
      )}
      </div>
    </div>
  );
};