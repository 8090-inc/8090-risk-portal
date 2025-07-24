import React from 'react';
import { Badge } from '../ui/Badge';
import type { RiskLevelCategory } from '../../types';

interface RiskLevelBadgeProps {
  level: RiskLevelCategory;
  score?: number;
  showScore?: boolean;
}

export const RiskLevelBadge: React.FC<RiskLevelBadgeProps> = ({
  level,
  score,
  showScore = true
}) => {
  const getVariant = (): 'risk-critical' | 'risk-high' | 'risk-medium' | 'risk-low' => {
    switch (level) {
      case 'Critical':
        return 'risk-critical';
      case 'High':
        return 'risk-high';
      case 'Medium':
        return 'risk-medium';
      case 'Low':
        return 'risk-low';
      default:
        return 'risk-low';
    }
  };

  return (
    <Badge variant={getVariant()} size="sm" className="font-semibold">
      {level}{showScore && score ? ` (${score})` : ''}
    </Badge>
  );
};