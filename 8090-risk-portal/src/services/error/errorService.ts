import { AppError } from '../../types';

class ErrorService {
  private errors: AppError[] = [];
  private listeners: ((error: AppError) => void)[] = [];

  logError(error: AppError): void {
    this.errors.push(error);
    console.error('[ErrorService]', error);

    // Notify all listeners
    this.listeners.forEach(listener => listener(error));

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to Sentry, LogRocket, etc.
      this.sendToErrorTrackingService(error);
    }
  }

  getErrors(): AppError[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }

  subscribe(listener: (error: AppError) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private sendToErrorTrackingService(error: AppError): void {
    // Placeholder for error tracking service integration
    // Example: Sentry, LogRocket, etc.
    console.log('Would send to error tracking service:', error);
  }
}

// Create singleton instance
const errorService = new ErrorService();

// Make it available globally for ErrorBoundary
declare global {
  interface Window {
    errorService: ErrorService;
  }
}

window.errorService = errorService;

export { errorService };