// Error handling types for the risk portal

export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type ErrorCategory = 
  | 'data-validation'
  | 'api-error'
  | 'network-error'
  | 'authentication'
  | 'authorization'
  | 'business-logic'
  | 'system-error'
  | 'user-input'
  | 'file-processing'
  | 'unknown';

export interface AppError {
  id: string;
  timestamp: Date;
  category: ErrorCategory;
  severity: ErrorSeverity;
  code: string; // e.g., 'RISK_001', 'CTRL_002'
  message: string;
  details?: any;
  source?: string; // Component or service that threw the error
  stack?: string;
  context?: Record<string, any>; // Additional context data
  userId?: string;
  sessionId?: string;
  resolved?: boolean;
  resolution?: string;
}

export interface DataValidationError extends AppError {
  field: string;
  value: any;
  expectedType: string;
  rule?: string;
}

// Specific error classes
export class ValidationError extends Error implements DataValidationError {
  id: string;
  timestamp: Date;
  category: ErrorCategory = 'data-validation';
  severity: ErrorSeverity;
  code: string;
  field: string;
  value: any;
  expectedType: string;
  rule?: string;

  constructor(field: string, value: any, expectedType: string, message?: string, rule?: string) {
    super(message || `Validation error for field ${field}`);
    this.name = 'ValidationError';
    this.id = `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.code = 'VALIDATION_ERROR';
    this.field = field;
    this.value = value;
    this.expectedType = expectedType;
    this.rule = rule;
    this.severity = 'medium';
  }
}

export class RiskValidationError extends ValidationError {
  constructor(field: string, value: any, rule: string, message: string) {
    super(field, value, 'Risk', message, rule);
    this.name = 'RiskValidationError';
    this.code = 'RISK_VALIDATION_ERROR';
  }
}

export class ControlValidationError extends ValidationError {
  constructor(field: string, value: any, rule: string, message: string) {
    super(field, value, 'Control', message, rule);
    this.name = 'ControlValidationError';
    this.code = 'CONTROL_VALIDATION_ERROR';
  }
}

export class DataIntegrityError extends Error {
  constructor(
    public entity: 'risk' | 'control' | 'relationship',
    public entityId: string,
    message: string
  ) {
    super(message);
    this.name = 'DataIntegrityError';
  }
}

export class RelationshipError extends Error {
  constructor(
    public sourceId: string,
    public targetId: string,
    public relationshipType: string,
    message: string
  ) {
    super(message);
    this.name = 'RelationshipError';
  }
}

export class FileProcessingError extends Error {
  constructor(
    public fileName: string,
    public fileType: string,
    public stage: 'upload' | 'validation' | 'parsing' | 'processing',
    message: string
  ) {
    super(message);
    this.name = 'FileProcessingError';
  }
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public endpoint: string,
    public method: string,
    message: string,
    public responseBody?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Error recovery strategies
export interface ErrorRecovery {
  errorType: string;
  strategy: 'retry' | 'fallback' | 'ignore' | 'escalate';
  maxRetries?: number;
  retryDelay?: number;
  fallbackValue?: any;
  escalationPath?: string[];
}

// Error reporting
export interface ErrorReport {
  period: {
    start: Date;
    end: Date;
  };
  totalErrors: number;
  byCategory: Record<ErrorCategory, number>;
  bySeverity: Record<ErrorSeverity, number>;
  topErrors: {
    code: string;
    count: number;
    lastOccurrence: Date;
  }[];
  resolvedCount: number;
  unresolvedCount: number;
  averageResolutionTime?: number;
}

// Validation result type
export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// Error notification for UI
export interface ErrorNotification {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number; // milliseconds, 0 for persistent
  actions?: {
    label: string;
    handler: () => void;
  }[];
  dismissible: boolean;
}

// Type guards
export const isAppError = (error: any): error is AppError => {
  return error && typeof error === 'object' && 'category' in error && 'severity' in error;
};

export const isValidationError = (error: any): error is ValidationError => {
  return error && error instanceof Error && 'field' in error && 'expectedType' in error;
};

export const isApiError = (error: any): error is ApiError => {
  return error && error instanceof Error && error.name === 'ApiError';
};