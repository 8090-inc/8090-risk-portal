import { AppError } from '../../types/error.types';
import errorService from '../../services/error/errorService';

export const handleApiError = (error: any): AppError => {
  const appError: AppError = {
    code: error.response?.status?.toString() || 'API_ERROR',
    message: error.response?.data?.message || error.message || 'An API error occurred',
    details: {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    },
    timestamp: new Date(),
    severity: error.response?.status >= 500 ? 'high' : 'medium',
  };

  errorService.logError(appError);
  return appError;
};

export const handleValidationError = (field: string, value: any, expectedType: string): AppError => {
  const error: AppError = {
    code: 'VALIDATION_ERROR',
    message: `Invalid value for field "${field}". Expected ${expectedType}.`,
    details: { field, value, expectedType },
    timestamp: new Date(),
    severity: 'low',
  };

  errorService.logError(error);
  return error;
};

export const handleUnexpectedError = (error: Error): AppError => {
  const appError: AppError = {
    code: 'UNEXPECTED_ERROR',
    message: error.message || 'An unexpected error occurred',
    details: {
      stack: error.stack,
      name: error.name,
    },
    timestamp: new Date(),
    severity: 'high',
  };

  errorService.logError(appError);
  return appError;
};

export const isRetryableError = (error: AppError): boolean => {
  const retryableCodes = ['NETWORK_ERROR', '408', '429', '503', '504'];
  return retryableCodes.includes(error.code);
};

export const createRetryHandler = (
  fn: () => Promise<any>,
  maxRetries = 3,
  delay = 1000
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const attempt = (retryCount: number) => {
      fn()
        .then(resolve)
        .catch((error) => {
          const appError = handleApiError(error);
          
          if (retryCount < maxRetries && isRetryableError(appError)) {
            setTimeout(() => {
              attempt(retryCount + 1);
            }, delay * Math.pow(2, retryCount)); // Exponential backoff
          } else {
            reject(appError);
          }
        });
    };

    attempt(0);
  });
};