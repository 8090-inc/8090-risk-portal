import React from 'react';
import { AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';

interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ type, title, description, className = '' }) => {
  const styles = {
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-800',
      description: 'text-blue-700'
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-600',
      title: 'text-green-800',
      description: 'text-green-700'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-800',
      description: 'text-yellow-700'
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-600',
      title: 'text-red-800',
      description: 'text-red-700'
    }
  };

  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertCircle,
    error: XCircle
  };

  const Icon = icons[type];
  const style = styles[type];

  return (
    <div className={`p-4 border rounded-lg ${style.container} ${className}`}>
      <div className="flex">
        <Icon className={`w-5 h-5 ${style.icon} flex-shrink-0`} />
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${style.title}`}>{title}</h3>
          {description && (
            <p className={`mt-1 text-sm ${style.description}`}>{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};