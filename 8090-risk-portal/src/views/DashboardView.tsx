import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  FileWarning
} from 'lucide-react';
import { useRiskStore, useControlStore } from '../store';
import { Card } from '../components/ui/Card';
import { RiskLevelBadge } from '../components/risks/RiskLevelBadge';
import { DataStatus } from '../components/data/DataStatus';
import type { Risk, Control } from '../types';
import { cn } from '../utils/cn';

// Risk Heat Map Component
const RiskHeatMap: React.FC<{ risks: Risk[] }> = ({ risks }) => {
  const matrix = useMemo(() => {
    const heatMap: Record<string, Risk[]> = {};
    
    // Initialize matrix cells
    for (let impact = 5; impact >= 1; impact--) {
      for (let likelihood = 1; likelihood <= 5; likelihood++) {
        heatMap[`${likelihood}-${impact}`] = [];
      }
    }
    
    // Populate with risks
    risks.forEach(risk => {
      const key = `${risk.residualScoring.likelihood}-${risk.residualScoring.impact}`;
      if (heatMap[key]) {
        heatMap[key].push(risk);
      }
    });
    
    return heatMap;
  }, [risks]);

  const getCellColor = (likelihood: number, impact: number): string => {
    const score = likelihood * impact;
    if (score >= 20) return 'bg-red-500 hover:bg-red-600';
    if (score >= 12) return 'bg-orange-500 hover:bg-orange-600';
    if (score >= 6) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-green-500 hover:bg-green-600';
  };

  const getCellTextColor = (likelihood: number, impact: number): string => {
    const score = likelihood * impact;
    if (score >= 6) return 'text-white';
    return 'text-gray-900';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-1 text-sm">
        {/* Y-axis label */}
        <div className="flex items-center justify-center rotate-180" style={{ writingMode: 'vertical-rl' }}>
          <span className="text-gray-600 font-medium">Impact</span>
        </div>
        
        {/* Matrix */}
        <div className="col-span-5">
          {/* Column headers */}
          <div className="grid grid-cols-5 gap-1 mb-1">
            {[1, 2, 3, 4, 5].map(l => (
              <div key={l} className="text-center text-gray-600 font-medium">{l}</div>
            ))}
          </div>
          
          {/* Matrix cells */}
          {[5, 4, 3, 2, 1].map(impact => (
            <div key={impact} className="grid grid-cols-5 gap-1">
              {[1, 2, 3, 4, 5].map(likelihood => {
                const cellRisks = matrix[`${likelihood}-${impact}`] || [];
                const cellColor = getCellColor(likelihood, impact);
                const textColor = getCellTextColor(likelihood, impact);
                
                return (
                  <Link
                    key={`${likelihood}-${impact}`}
                    to={cellRisks.length > 0 ? `/risks?likelihood=${likelihood}&impact=${impact}` : '#'}
                    className={cn(
                      "aspect-square flex items-center justify-center rounded transition-all",
                      cellColor,
                      cellRisks.length === 0 && "cursor-default opacity-60"
                    )}
                  >
                    <span className={cn("text-lg font-bold", textColor)}>
                      {cellRisks.length || ''}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
          
          {/* X-axis label */}
          <div className="text-center mt-2">
            <span className="text-gray-600 font-medium">Likelihood</span>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center space-x-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Low (1-5)</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Medium (6-11)</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span>High (12-19)</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Critical (20-25)</span>
        </div>
      </div>
    </div>
  );
};

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: 'primary' | 'success' | 'warning' | 'danger';
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue,
  color 
}) => {
  const colorClasses = {
    primary: 'bg-8090-primary/10 text-8090-primary',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    danger: 'bg-red-100 text-red-600'
  };

  return (
    <Card padding="sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && trendValue && (
              <span className={cn(
                "text-sm font-medium",
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 
                'text-gray-600'
              )}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", colorClasses[color])}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

// Priority Risks List Component
const PriorityRisksList: React.FC<{ risks: Risk[] }> = ({ risks }) => {
  const priorityRisks = useMemo(() => {
    return risks
      .filter(r => r.residualScoring.riskLevelCategory === 'Critical' || 
                   r.residualScoring.riskLevelCategory === 'High')
      .sort((a, b) => b.residualScoring.riskLevel - a.residualScoring.riskLevel)
      .slice(0, 5);
  }, [risks]);

  return (
    <div className="space-y-3">
      {priorityRisks.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">
          No critical or high priority risks
        </p>
      ) : (
        priorityRisks.map(risk => (
          <Link
            key={risk.id}
            to={`/risks/${risk.id}`}
            className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-mono text-gray-600">
                    {risk.id.toUpperCase()}
                  </span>
                  <RiskLevelBadge 
                    level={risk.residualScoring.riskLevelCategory} 
                    showScore={false}
                  />
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {risk.risk}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {risk.relatedControlIds.length} control(s) • 
                  {risk.mitigationEffectiveness} effectiveness
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
            </div>
          </Link>
        ))
      )}
    </div>
  );
};

// Control Status Chart Component
const ControlStatusChart: React.FC<{ controls: Control[] }> = ({ controls }) => {
  const statusCounts = useMemo(() => {
    const counts = {
      'Implemented': 0,
      'In Progress': 0,
      'Planned': 0,
      'Not Started': 0
    };
    
    controls.forEach(control => {
      const status = control.implementationStatus || 'Not Started';
      if (status in counts) {
        counts[status as keyof typeof counts]++;
      }
    });
    
    return counts;
  }, [controls]);

  const total = controls.length;

  return (
    <div className="space-y-4">
      {Object.entries(statusCounts).map(([status, count]) => {
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        const colorClass = 
          status === 'Implemented' ? 'bg-green-500' :
          status === 'In Progress' ? 'bg-blue-500' :
          status === 'Planned' ? 'bg-yellow-500' : 'bg-gray-400';
        
        return (
          <div key={status}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{status}</span>
              <span className="text-sm text-gray-600">
                {count} ({percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={cn("h-2 rounded-full transition-all", colorClass)}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const DashboardView: React.FC = () => {
  const { risks, loadRisks, getStatistics: getRiskStats } = useRiskStore();
  const { controls, loadControls } = useControlStore();

  useEffect(() => {
    if (risks.length === 0) loadRisks();
    if (controls.length === 0) loadControls();
  }, [risks.length, controls.length, loadRisks, loadControls]);

  const riskStats = getRiskStats();

  // Calculate additional metrics
  const metrics = useMemo(() => {
    const implementedControls = controls.filter(c => 
      c.implementationStatus === 'Implemented'
    ).length;
    
    const criticalUnmitigated = risks.filter(r => 
      r.residualScoring.riskLevelCategory === 'Critical' &&
      r.relatedControlIds.length === 0
    ).length;

    const avgControlsPerRisk = risks.length > 0
      ? (risks.reduce((sum, r) => sum + r.relatedControlIds.length, 0) / risks.length).toFixed(1)
      : '0';

    const complianceScore = controls.length > 0
      ? Math.round((implementedControls / controls.length) * 100)
      : 0;

    return {
      implementedControls,
      criticalUnmitigated,
      avgControlsPerRisk,
      complianceScore
    };
  }, [risks, controls]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Risk Governance Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Real-time overview of AI risk management and control implementation
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total AI Risks"
          value={riskStats?.totalRisks || 0}
          subtitle={`${riskStats?.criticalRisksCount || 0} critical risks`}
          icon={<FileWarning className="h-6 w-6" />}
          color="primary"
        />
        
        <KPICard
          title="Control Implementation"
          value={`${metrics.complianceScore}%`}
          subtitle={`${metrics.implementedControls} of ${controls.length} controls`}
          icon={<Shield className="h-6 w-6" />}
          color="success"
          trend={metrics.complianceScore >= 80 ? 'up' : 'down'}
          trendValue={metrics.complianceScore >= 80 ? 'On track' : 'Needs attention'}
        />
        
        <KPICard
          title="Risk Mitigation"
          value={`${riskStats?.mitigatedRisksCount || 0}`}
          subtitle="Risks with controls"
          icon={<CheckCircle className="h-6 w-6" />}
          color="success"
        />
        
        <KPICard
          title="Critical Unmitigated"
          value={metrics.criticalUnmitigated}
          subtitle="Require immediate action"
          icon={<AlertTriangle className="h-6 w-6" />}
          color={metrics.criticalUnmitigated > 0 ? 'danger' : 'success'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Heat Map */}
        <Card className="lg:col-span-2">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-8090-primary" />
              Risk Heat Map (Residual)
            </h2>
            <RiskHeatMap risks={risks} />
          </div>
        </Card>

        {/* Control Status */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-8090-primary" />
              Control Implementation Status
            </h2>
            <ControlStatusChart controls={controls} />
            
            <div className="mt-6 pt-6 border-t">
              <div className="text-center">
                <p className="text-sm text-gray-600">Avg Controls per Risk</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {metrics.avgControlsPerRisk}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Priority Risks, Quick Actions, and Data Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Risks */}
        <Card className="lg:col-span-1">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-8090-primary" />
                Top Priority Risks
              </h2>
              <Link 
                to="/risks?level=Critical,High" 
                className="text-sm text-8090-primary hover:text-8090-primary/80"
              >
                View all →
              </Link>
            </div>
            <PriorityRisksList risks={risks} />
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-8090-primary" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                to="/risks?unmitigated=true"
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Review Unmitigated Risks
                    </p>
                    <p className="text-xs text-gray-600">
                      {risks.filter(r => r.relatedControlIds.length === 0).length} risks without controls
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-400" />
              </Link>

              <Link
                to="/controls?status=Not+Started"
                className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Implement Pending Controls
                    </p>
                    <p className="text-xs text-gray-600">
                      {controls.filter(c => !c.implementationStatus || 
                        c.implementationStatus === 'Not Started').length} controls pending
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-400" />
              </Link>

              <Link
                to="/reports"
                className="flex items-center justify-between p-3 bg-8090-primary/10 rounded-lg hover:bg-8090-primary/20 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FileWarning className="h-5 w-5 text-8090-primary" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Generate Compliance Report
                    </p>
                    <p className="text-xs text-gray-600">
                      Last generated: Never
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </Card>

        {/* Data Status */}
        <div className="lg:col-span-1">
          <DataStatus
            lastUpdated={localStorage.getItem('dataLastUpdated') || undefined}
            recordCount={{
              risks: risks.length,
              controls: controls.length
            }}
            validationStatus="valid"
            onRefresh={() => {
              loadRisks();
              loadControls();
            }}
          />
        </div>
      </div>
    </div>
  );
};