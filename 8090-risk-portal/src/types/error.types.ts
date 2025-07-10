export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface DataValidationError extends AppError {
  field: string;
  value: any;
  expectedType: string;
}

export class ValidationError extends Error implements DataValidationError {
  code: string;
  field: string;
  value: any;
  expectedType: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';

  constructor(field: string, value: any, expectedType: string, message?: string) {
    super(message || `Validation error for field ${field}`);
    this.name = 'ValidationError';
    this.code = 'VALIDATION_ERROR';
    this.field = field;
    this.value = value;
    this.expectedType = expectedType;
    this.timestamp = new Date();
    this.severity = 'medium';
  }
}