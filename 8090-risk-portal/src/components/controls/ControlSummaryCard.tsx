import React from 'react';
import { Check, AlertTriangle, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface ControlSummaryCardProps {
  title: string;
  count: number;
  variant: 'ok' | 'attention' | 'pending';
  description: string;
}

export const ControlSummaryCard: React.FC<ControlSummaryCardProps> = ({
  title,
  count,
  variant,
  description
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'ok':
        return <Check className="h-5 w-5 text-green-600" />;
      case 'attention':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getBadgeVariant = () => {
    switch (variant) {
      case 'ok':
        return 'success' as const;
      case 'attention':
        return 'danger' as const;
      case 'pending':
        return 'warning' as const;
    }
  };

  return (
    <Card hover className="cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {getIcon()}
            <h3 className="text-sm font-medium text-slate-900">{title}</h3>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-semibold text-slate-900">{count}</span>
            <Badge variant={getBadgeVariant()}>
              {variant === 'ok' ? 'Compliant' : variant === 'attention' ? 'Non-Compliant' : 'In Progress'}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        </div>
      </div>
    </Card>
  );
};