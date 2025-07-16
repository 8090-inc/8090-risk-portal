export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  content: string;
  generatedAt: Date;
}

export interface ReportGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

export type ReportFormat = 'markdown' | 'pdf' | 'docx' | 'html';

export interface ReportExportOptions {
  format: ReportFormat;
  includeMetadata?: boolean;
  filename?: string;
}