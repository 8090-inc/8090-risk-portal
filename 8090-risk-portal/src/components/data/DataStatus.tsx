import React from 'react';
import { Calendar, Database, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface DataStatusProps {
  lastUpdated?: string;
  dataSource?: string;
  recordCount?: {
    risks: number;
    controls: number;
  };
  validationStatus?: 'valid' | 'warning' | 'error';
  onRefresh?: () => void;
  className?: string;
}

export const DataStatus: React.FC<DataStatusProps> = ({
  lastUpdated,
  dataSource = 'Excel Import',
  recordCount,
  validationStatus = 'valid',
  onRefresh,
  className
}) => {
  const getStatusIcon = () => {
    switch (validationStatus) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (validationStatus) {
      case 'valid':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const formatLastUpdated = (dateString?: string) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 168) { // Less than a week
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={cn(
      "bg-white border border-gray-200 rounded-lg p-4",
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          <Database className="h-4 w-4 mr-2 text-gray-400" />
          Data Status
        </h3>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-7 px-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {/* Last Updated */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            Last Updated
          </span>
          <span className="text-xs font-medium text-gray-700">
            {formatLastUpdated(lastUpdated)}
          </span>
        </div>

        {/* Data Source */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Source</span>
          <Badge variant="secondary" className="text-xs">
            {dataSource}
          </Badge>
        </div>

        {/* Record Count */}
        {recordCount && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Records</span>
            <div className="text-xs text-gray-700">
              <span className="font-medium">{recordCount.risks}</span> risks, {' '}
              <span className="font-medium">{recordCount.controls}</span> controls
            </div>
          </div>
        )}

        {/* Validation Status */}
        <div className={cn(
          "flex items-center justify-center space-x-2 px-3 py-2 rounded-md border",
          getStatusColor()
        )}>
          {getStatusIcon()}
          <span className="text-xs font-medium">
            {validationStatus === 'valid' && 'Data Valid'}
            {validationStatus === 'warning' && 'Validation Warnings'}
            {validationStatus === 'error' && 'Validation Errors'}
          </span>
        </div>
      </div>
    </div>
  );
};