import { GoogleGenerativeAI } from '@google/generative-ai';

export interface TemplateData {
  companyName: string;
  currentDate: string;
  totalRisks: number;
  categoryCount: number;
  categories: string;
  riskDistribution: string;
  criticalCount: number;
  highCount: number;
  criticalRisks: string;
  highRisks: string;
  impactByCategory: string;
  mitigationSummary: string;
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private lastCallTime: number = 0;
  private readonly RATE_LIMIT_MS = 6000; // 10 calls per minute = 1 call per 6 seconds

  constructor() {
    // First try environment variable, then localStorage
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
    
    // Debug logging
    console.log('Gemini Service initialization:');
    console.log('- Environment API key:', import.meta.env.VITE_GEMINI_API_KEY ? 'Present' : 'Not found');
    console.log('- LocalStorage API key:', localStorage.getItem('gemini_api_key') ? 'Present' : 'Not found');
    console.log('- Final API key:', apiKey ? 'Set' : 'Not set');
    
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  isConfigured(): boolean {
    return this.genAI !== null;
  }

  private checkRateLimit(): boolean {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    return timeSinceLastCall >= this.RATE_LIMIT_MS;
  }

  private getRateLimitWaitTime(): number {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    const waitTime = Math.max(0, this.RATE_LIMIT_MS - timeSinceLastCall);
    return Math.ceil(waitTime / 1000); // Return seconds
  }

  async generateReport(prompt: string, onProgress?: (message: string) => void): Promise<string> {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured. Please add your API key in Settings.');
    }

    if (!this.checkRateLimit()) {
      const waitTime = this.getRateLimitWaitTime();
      throw new Error(`Rate limit exceeded. Please wait ${waitTime} seconds before generating another report.`);
    }

    try {
      onProgress?.('Initializing AI model...');
      
      // Use Gemini 1.5 Flash for faster responses (or gemini-pro for more capability)
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      onProgress?.('Processing risk data...');
      
      // Record the call time
      this.lastCallTime = Date.now();
      
      onProgress?.('Generating report content...');
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        },
      });

      onProgress?.('Finalizing report...');
      
      const response = await result.response;
      const text = response.text();
      
      if (!text) {
        throw new Error('No response generated. Please try again.');
      }
      
      return text;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message?.includes('API key')) {
          throw new Error('Invalid API key. Please check your Gemini API key in Settings.');
        } else if (error.message?.includes('quota')) {
          throw new Error('API quota exceeded. Please check your Gemini API usage limits.');
        } else if (error.message?.includes('network')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        }
      }
      throw error;
    }
  }

  processTemplate(template: string, data: TemplateData): string {
    let processed = template;
    
    // Replace all template variables with actual data
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, String(value));
    });
    
    return processed;
  }
}

export const geminiService = new GeminiService();