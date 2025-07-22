import { useEffect, useCallback, useState } from 'react';
import { useUIStore } from '../store';
import { errorService } from '../services/error/errorService';
import type { 
  AppError, 
  ApiError,
  ValidationError
} from '../types';
import { isApiError, isValidationError } from '../types';

export const useErrorHandler = () => {
  const { showError, showWarning, showInfo } = useUIStore();
  
  useEffect(() => {
    // Subscribe to error service
    const unsubscribe = errorService.subscribe((error: AppError) => {
      // Display notification based on severity
      switch (error.severity) {
        case 'critical':
        case 'high':
          showError(error.code, error.message);
          break;
        case 'medium':
          showWarning(error.code, error.message);
          break;
        case 'low':
        case 'info':
          showInfo(error.code, error.message);
          break;
      }
    });
    
    return unsubscribe;
  }, [showError, showWarning, showInfo]);
  
  const handleError = useCallback((error: Error | AppError) => {
    // Convert different error types to AppError
    let appError: AppError;
    
    if (isApiError(error)) {
      const apiError = error as ApiError;
      appError = {
        id: `err_${Date.now()}`,
        timestamp: new Date(),
        category: 'api-error',
        severity: apiError.statusCode >= 500 ? 'high' : 'medium',
        code: `API_${apiError.statusCode}`,
        message: apiError.message,
        details: {
          endpoint: apiError.endpoint,
          method: apiError.method,
          responseBody: apiError.responseBody
        }
      };
    } else if (isValidationError(error)) {
      const valError = error as ValidationError;
      appError = {
        id: `err_${Date.now()}`,
        timestamp: new Date(),
        category: 'data-validation',
        severity: 'medium',
        code: valError.code,
        message: valError.message,
        details: {
          field: valError.field,
          value: valError.value,
          expectedType: valError.expectedType
        }
      };
    } else if ('category' in error && 'severity' in error) {
      appError = error as AppError;
    } else {
      // Generic error
      appError = {
        id: `err_${Date.now()}`,
        timestamp: new Date(),
        category: 'unknown',
        severity: 'medium',
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred',
        stack: error.stack
      };
    }
    
    // Log to error service
    errorService.logError(appError);
  }, []);
  
  const clearErrors = useCallback(() => {
    errorService.clearErrors();
  }, []);
  
  return {
    handleError,
    clearErrors,
    errors: errorService.getErrors()
  };
};

// Hook for async operations with error handling
export const useAsyncOperation = <T extends (...args: never[]) => Promise<unknown>>(
  operation: T,
  options?: {
    onSuccess?: (result: Awaited<ReturnType<T>>) => void;
    onError?: (error: Error) => void;
    showSuccessNotification?: boolean;
    successMessage?: string;
  }
) => {
  const { handleError } = useErrorHandler();
  const { showSuccess, setGlobalLoading } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const execute = useCallback(async (...args: Parameters<T>) => {
    setIsLoading(true);
    if (options?.showSuccessNotification) {
      setGlobalLoading(true);
    }
    
    try {
      const result = await operation(...args);
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      if (options?.showSuccessNotification && options?.successMessage) {
        showSuccess('Success', options.successMessage);
      }
      
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Operation failed');
      handleError(err);
      
      if (options?.onError) {
        options.onError(err);
      }
      
      throw err;
    } finally {
      setIsLoading(false);
      if (options?.showSuccessNotification) {
        setGlobalLoading(false);
      }
    }
  }, [operation, handleError, showSuccess, setGlobalLoading, options]);
  
  return {
    execute,
    isLoading
  };
};