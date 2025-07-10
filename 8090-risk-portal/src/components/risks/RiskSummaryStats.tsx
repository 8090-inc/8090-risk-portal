import React from 'react';
import { Card } from '../ui/Card';
import { TrendingDown, AlertTriangle, Shield, Activity } from 'lucide-react';
import type { RiskStatistics } from '../../types';

interface RiskSummaryStatsProps {
  statistics: RiskStatistics | null;
}

export const RiskSummaryStats: React.FC<RiskSummaryStatsProps> = ({ statistics }) => {
  if (!statistics) return null;

  const stats = [
    {
      name: 'Total Risks',
      value: statistics.totalRisks,
      icon: Activity,
      color: 'text-8090-primary',
      bgColor: 'bg-8090-primary/10'
    },
    {
      name: 'Critical & High Risks',
      value: statistics.criticalRisksCount + statistics.highRisksCount,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      subtext: `${statistics.criticalRisksCount} Critical, ${statistics.highRisksCount} High`
    },
    {
      name: 'Mitigated Risks',
      value: statistics.mitigatedRisksCount,
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      percentage: Math.round((statistics.mitigatedRisksCount / statistics.totalRisks) * 100)
    },
    {
      name: 'Avg Risk Reduction',
      value: `${statistics.averageRiskReduction}`,
      icon: TrendingDown,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      suffix: 'points'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.name} padding="sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <div className="mt-2 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                  {stat.suffix && (
                    <span className="ml-1 text-sm font-normal text-gray-500">
                      {stat.suffix}
                    </span>
                  )}
                </p>
                {stat.percentage !== undefined && (
                  <p className="ml-2 text-sm font-medium text-green-600">
                    ({stat.percentage}%)
                  </p>
                )}
              </div>
              {stat.subtext && (
                <p className="mt-1 text-xs text-gray-500">{stat.subtext}</p>
              )}
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};