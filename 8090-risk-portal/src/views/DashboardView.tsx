import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Shield, 
  XCircle,
  AlertCircle,
  ArrowUpRight,
  FileWarning,
  Filter,
  Download,
  BarChart3,
  Users,
  Activity
} from 'lucide-react';
import { useRiskStore, useControlStore } from '../store';
import { Card } from '../components/ui/Card';
import type { Risk } from '../types';
import { cn } from '../utils/cn';

// Interactive Risk Matrix Component
const InteractiveRiskMatrix: React.FC<{ 
  risks: Risk[];
  selectedCell: string | null;
  onCellSelect: (cell: string | null) => void;
  onCellHover: (cell: string | null) => void;
  hoveredCell: string | null;
}> = ({ risks, selectedCell, onCellSelect, onCellHover, hoveredCell }) => {
  const navigate = useNavigate();
  
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
    if (score >= 20) return 'bg-red-500';
    if (score >= 12) return 'bg-orange-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleCellClick = (cellKey: string) => {
    if (selectedCell === cellKey) {
      onCellSelect(null);
    } else {
      onCellSelect(cellKey);
      // Navigate to risks page with filter
      const [likelihood, impact] = cellKey.split('-').map(Number);
      navigate(`/risks?likelihood=${likelihood}&impact=${impact}`);
    }
  };

  return (
    <div className="h-full w-full flex flex-col p-1">
      <div className="flex-1 grid grid-cols-[auto_1fr] gap-0">
        <div className="flex items-center justify-center px-2">
          <span className="text-slate-700 font-bold -rotate-90 whitespace-nowrap text-xl">Impact</span>
        </div>
        <div className="grid grid-rows-[auto_1fr] gap-0">
          <div className="grid grid-cols-5">
            {[1, 2, 3, 4, 5].map(l => (
              <div key={l} className="flex items-center justify-center py-2 text-slate-700 text-xl font-bold">{l}</div>
            ))}
          </div>
          <div className="grid grid-rows-5">
            {[5, 4, 3, 2, 1].map(impact => (
              <div key={impact} className="grid grid-cols-5">
                {[1, 2, 3, 4, 5].map(likelihood => {
                  const cellKey = `${likelihood}-${impact}`;
                  const cellRisks = matrix[cellKey] || [];
                  const cellColor = getCellColor(likelihood, impact);
                  const isSelected = selectedCell === cellKey;
                  const isHovered = hoveredCell === cellKey;
                  
                  return (
                    <div
                      key={cellKey}
                      onClick={() => handleCellClick(cellKey)}
                      onMouseEnter={() => onCellHover(cellKey)}
                      onMouseLeave={() => onCellHover(null)}
                      className={cn(
                        "flex items-center justify-center rounded-sm text-3xl font-bold cursor-pointer transition-all m-0.5",
                        cellColor,
                        cellRisks.length > 0 ? 'text-white' : 'text-white/40',
                        isSelected && 'ring-2 ring-slate-900 ring-offset-2',
                        isHovered && !isSelected && 'ring-1 ring-slate-400 ring-offset-1',
                        'hover:scale-[1.02]'
                      )}
                    >
                      {cellRisks.length || '·'}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="text-center pt-2">
        <span className="text-slate-700 text-xl font-bold">Likelihood</span>
      </div>
    </div>
  );
};

// Enhanced Risk Details Table Component
const EnhancedRiskDetailsTable: React.FC<{ 
  risks: Risk[];
  highlightedRisks?: string[];
}> = ({ risks, highlightedRisks = [] }) => {
  const navigate = useNavigate();
  
  const sortedRisks = useMemo(() => {
    return risks.sort((a, b) => b.residualScoring.riskLevel - a.residualScoring.riskLevel).slice(0, 12);
  }, [risks]);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getMitigationStatus = (risk: Risk) => {
    if (risk.relatedControlIds.length > 0) {
      return { label: 'Mitigated', color: 'bg-green-100 text-green-700' };
    }
    return { label: 'Unmitigated', color: 'bg-red-100 text-red-700' };
  };

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case 'High': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="px-3 h-full">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-white border-b border-slate-200">
          <tr>
            <th className="text-left py-2 px-1 font-medium text-slate-700">ID</th>
            <th className="text-left py-2 px-2 font-medium text-slate-700">Risk</th>
            <th className="text-center py-2 px-1 font-medium text-slate-700">Level</th>
            <th className="text-center py-2 px-1 font-medium text-slate-700">Status</th>
            <th className="text-center py-2 px-1 font-medium text-slate-700">Effect.</th>
            <th className="text-left py-2 px-1 font-medium text-slate-700">Owner</th>
          </tr>
        </thead>
        <tbody>
          {sortedRisks.map((risk, index) => {
            const mitigationStatus = getMitigationStatus(risk);
            const isHighlighted = highlightedRisks.includes(risk.id);
            
            return (
              <tr 
                key={risk.id} 
                onClick={() => navigate(`/risks/${risk.id}`)}
                className={cn(
                  "border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors",
                  index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50',
                  isHighlighted && 'bg-blue-50 hover:bg-blue-100'
                )}
              >
                <td className="py-2 px-1 font-mono text-slate-600 text-xs">{risk.id.slice(0, 8)}</td>
                <td className="py-2 px-2">
                  <div className="truncate max-w-[180px]" title={risk.risk}>
                    {risk.risk}
                  </div>
                </td>
                <td className="py-2 px-1 text-center">
                  <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", getRiskLevelColor(risk.residualScoring.riskLevelCategory))}>
                    {risk.residualScoring.riskLevelCategory}
                  </span>
                </td>
                <td className="py-2 px-1 text-center">
                  <span className={cn("px-2 py-0.5 rounded text-xs font-medium", mitigationStatus.color)}>
                    {mitigationStatus.label}
                  </span>
                </td>
                <td className="py-2 px-1 text-center">
                  <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getEffectivenessColor(risk.mitigationEffectiveness || 'N/A'))}>
                    {risk.mitigationEffectiveness || 'N/A'}
                  </span>
                </td>
                <td className="py-2 px-1">
                  <div className="truncate max-w-[80px]" title={risk.proposedOversightOwnership.join(', ')}>
                    {risk.proposedOversightOwnership[0] || '-'}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Interactive Bar Chart Component
const InteractiveBarChart: React.FC<{ 
  data: Array<{ label: string; value: number; color: string; link?: string }>;
  total: number;
  showPercentage?: boolean;
  onClick?: (item: any) => void;
}> = ({ data, total, showPercentage = true, onClick }) => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-2">
      {data.map((item) => {
        const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
        
        return (
          <div 
            key={item.label}
            onClick={() => {
              if (onClick) onClick(item);
              if (item.link) navigate(item.link);
            }}
            className={cn(
              "cursor-pointer group",
              item.link && "hover:scale-[1.02] transition-transform"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-700 group-hover:text-slate-900">{item.label}</span>
              <span className="text-sm font-medium text-slate-900">
                {item.value} {showPercentage && `(${percentage}%)`}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div 
                className={cn("h-3 rounded-full transition-all group-hover:opacity-90", item.color)}
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
  const { risks, loadRisks } = useRiskStore();
  const { controls, loadControls } = useControlStore();
  const navigate = useNavigate();
  
  const [selectedMatrixCell, setSelectedMatrixCell] = useState<string | null>(null);
  const [hoveredMatrixCell, setHoveredMatrixCell] = useState<string | null>(null);

  useEffect(() => {
    if (risks.length === 0) loadRisks();
    if (controls.length === 0) loadControls();
  }, [risks.length, controls.length, loadRisks, loadControls]);

  // Filter risks based on selected matrix cell
  const filteredRisks = useMemo(() => {
    if (!selectedMatrixCell) return risks;
    const [likelihood, impact] = selectedMatrixCell.split('-').map(Number);
    return risks.filter(r => 
      r.residualScoring.likelihood === likelihood && 
      r.residualScoring.impact === impact
    );
  }, [risks, selectedMatrixCell]);

  // Get highlighted risks based on hovered cell
  const highlightedRiskIds = useMemo(() => {
    if (!hoveredMatrixCell) return [];
    const [likelihood, impact] = hoveredMatrixCell.split('-').map(Number);
    return risks
      .filter(r => 
        r.residualScoring.likelihood === likelihood && 
        r.residualScoring.impact === impact
      )
      .map(r => r.id);
  }, [risks, hoveredMatrixCell]);

  // Calculate comprehensive metrics from real data
  const metrics = useMemo(() => {
    // Risk level distribution
    const riskLevels = {
      Critical: risks.filter(r => r.residualScoring.riskLevelCategory === 'Critical').length,
      High: risks.filter(r => r.residualScoring.riskLevelCategory === 'High').length,
      Medium: risks.filter(r => r.residualScoring.riskLevelCategory === 'Medium').length,
      Low: risks.filter(r => r.residualScoring.riskLevelCategory === 'Low').length
    };

    // Control implementation status with links
    const controlStatus = [
      { 
        label: 'Implemented', 
        value: controls.filter(c => c.implementationStatus === 'Implemented').length, 
        color: 'bg-green-500',
        link: '/controls?status=Implemented'
      },
      { 
        label: 'In Progress', 
        value: controls.filter(c => c.implementationStatus === 'In Progress').length, 
        color: 'bg-blue-500',
        link: '/controls?status=In+Progress'
      },
      { 
        label: 'Planned', 
        value: controls.filter(c => c.implementationStatus === 'Planned').length, 
        color: 'bg-yellow-500',
        link: '/controls?status=Planned'
      },
      { 
        label: 'Not Started', 
        value: controls.filter(c => !c.implementationStatus || c.implementationStatus === 'Not Started').length, 
        color: 'bg-slate-400',
        link: '/controls?status=Not+Started'
      }
    ];

    // Risk mitigation status
    const mitigated = risks.filter(r => r.relatedControlIds.length > 0).length;
    const unmitigated = risks.filter(r => r.relatedControlIds.length === 0).length;

    // Mitigation effectiveness with links
    const effectiveness = [
      { 
        label: 'High', 
        value: risks.filter(r => r.mitigationEffectiveness === 'High').length, 
        color: 'bg-green-500',
        link: '/risks?effectiveness=High'
      },
      { 
        label: 'Medium', 
        value: risks.filter(r => r.mitigationEffectiveness === 'Medium').length, 
        color: 'bg-yellow-500',
        link: '/risks?effectiveness=Medium'
      },
      { 
        label: 'Low', 
        value: risks.filter(r => r.mitigationEffectiveness === 'Low').length, 
        color: 'bg-red-500',
        link: '/risks?effectiveness=Low'
      },
      { 
        label: 'Not Assessed', 
        value: risks.filter(r => !r.mitigationEffectiveness).length, 
        color: 'bg-slate-400',
        link: '/risks?effectiveness=none'
      }
    ];

    // Risk by category with links
    const categories = [
      { 
        label: 'Behavioral', 
        value: risks.filter(r => r.riskCategory === 'Behavioral Risks').length, 
        color: 'bg-purple-500',
        link: '/risks?category=Behavioral+Risks'
      },
      { 
        label: 'Security', 
        value: risks.filter(r => r.riskCategory === 'Security and Data Risks').length, 
        color: 'bg-blue-500',
        link: '/risks?category=Security+and+Data+Risks'
      },
      { 
        label: 'Transparency', 
        value: risks.filter(r => r.riskCategory === 'Transparency Risks').length, 
        color: 'bg-cyan-500',
        link: '/risks?category=Transparency+Risks'
      },
      { 
        label: 'Business/Cost', 
        value: risks.filter(r => r.riskCategory === 'Business/Cost Related Risks').length, 
        color: 'bg-green-500',
        link: '/risks?category=Business/Cost+Related+Risks'
      },
      { 
        label: 'Human Impact', 
        value: risks.filter(r => r.riskCategory === 'AI Human Impact Risks').length, 
        color: 'bg-orange-500',
        link: '/risks?category=AI+Human+Impact+Risks'
      },
      { 
        label: 'Other', 
        value: risks.filter(r => r.riskCategory === 'Other Risks').length, 
        color: 'bg-slate-500',
        link: '/risks?category=Other+Risks'
      }
    ];

    // Ownership analysis
    const ownershipMap = new Map<string, number>();
    risks.forEach(risk => {
      risk.proposedOversightOwnership.forEach(owner => {
        ownershipMap.set(owner, (ownershipMap.get(owner) || 0) + 1);
      });
    });
    const topOwners = Array.from(ownershipMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    return {
      riskLevels,
      controlStatus,
      mitigated,
      unmitigated,
      effectiveness,
      categories,
      topOwners
    };
  }, [risks, controls]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-900">AI Risk Governance Command Center</h1>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-1 text-sm text-slate-600 hover:text-slate-900 transition-colors">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
            <button className="flex items-center space-x-1 text-sm text-slate-600 hover:text-slate-900 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content - Optimized for no scroll */}
      <div className="flex-1 p-3 space-y-3 overflow-hidden">
        {/* Top Metrics Bar */}
        <Card className="bg-white shadow-sm">
          <div className="p-3">
            <div className="grid grid-cols-8 gap-3 text-center">
              <div className="cursor-pointer hover:bg-slate-50 rounded p-1" onClick={() => navigate('/risks')}>
                <div className="text-sm text-slate-500">Total</div>
                <div className="text-2xl font-bold text-slate-900">{risks.length}</div>
              </div>
              <div className="border-l border-slate-200 pl-3 cursor-pointer hover:bg-slate-50 rounded p-1" onClick={() => navigate('/risks?level=Critical')}>
                <div className="text-sm text-slate-500">Critical</div>
                <div className="text-2xl font-bold text-red-600">{metrics.riskLevels.Critical}</div>
              </div>
              <div className="cursor-pointer hover:bg-slate-50 rounded p-1" onClick={() => navigate('/risks?level=High')}>
                <div className="text-sm text-slate-500">High</div>
                <div className="text-2xl font-bold text-orange-600">{metrics.riskLevels.High}</div>
              </div>
              <div className="cursor-pointer hover:bg-slate-50 rounded p-1" onClick={() => navigate('/risks?level=Medium')}>
                <div className="text-sm text-slate-500">Medium</div>
                <div className="text-2xl font-bold text-yellow-600">{metrics.riskLevels.Medium}</div>
              </div>
              <div className="cursor-pointer hover:bg-slate-50 rounded p-1" onClick={() => navigate('/risks?level=Low')}>
                <div className="text-sm text-slate-500">Low</div>
                <div className="text-2xl font-bold text-green-600">{metrics.riskLevels.Low}</div>
              </div>
              <div className="border-l border-slate-200 pl-3 cursor-pointer hover:bg-slate-50 rounded p-1" onClick={() => navigate('/risks?mitigated=true')}>
                <div className="text-sm text-slate-500">Mitigated</div>
                <div className="text-2xl font-bold text-green-600">{metrics.mitigated}</div>
              </div>
              <div className="cursor-pointer hover:bg-slate-50 rounded p-1" onClick={() => navigate('/risks?unmitigated=true')}>
                <div className="text-sm text-slate-500">Unmitigated</div>
                <div className="text-2xl font-bold text-red-600">{metrics.unmitigated}</div>
              </div>
              <div className="border-l border-slate-200 pl-3 cursor-pointer hover:bg-slate-50 rounded p-1" onClick={() => navigate('/controls')}>
                <div className="text-sm text-slate-500">Total Controls</div>
                <div className="text-2xl font-bold text-slate-900">{controls.length}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1">
          {/* Left Column: Risk Landscape */}
          <Card className="bg-white shadow-sm flex flex-col">
            <div className="border-b border-slate-200 px-3 py-2 flex-shrink-0">
              <h2 className="text-base font-semibold text-slate-900 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-[#0055D4]" />
                Risk Landscape
              </h2>
            </div>
            <div className="grid grid-cols-[2fr,3fr] divide-x divide-slate-200 flex-1 min-h-0">
              <div className="flex flex-col h-full">
                <div className="text-sm font-medium text-slate-700 px-3 pt-2 pb-1 flex-shrink-0">Residual Risk Matrix</div>
                <div className="flex-1 overflow-hidden">
                  <InteractiveRiskMatrix 
                    risks={risks}
                    selectedCell={selectedMatrixCell}
                    onCellSelect={setSelectedMatrixCell}
                    onCellHover={setHoveredMatrixCell}
                    hoveredCell={hoveredMatrixCell}
                  />
                </div>
              </div>
              <div className="flex flex-col min-h-0">
                <div className="text-xs font-medium text-slate-700 px-3 pt-2 pb-1">
                  Risk Details {selectedMatrixCell && `(Filtered)`}
                </div>
                <div className="flex-1 overflow-hidden">
                  <EnhancedRiskDetailsTable 
                    risks={selectedMatrixCell ? filteredRisks : risks} 
                    highlightedRisks={highlightedRiskIds}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Right Column - All Cards Stacked */}
          <div className="flex flex-col space-y-3 overflow-y-auto">
            {/* Control Implementation */}
            <Card className="bg-white shadow-sm">
              <div className="border-b border-slate-200 px-3 py-2">
                <h2 className="text-base font-semibold text-slate-900 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-[#0055D4]" />
                  Control Implementation Status
                </h2>
              </div>
              <div className="p-3">
                <InteractiveBarChart data={metrics.controlStatus} total={controls.length} />
              </div>
            </Card>

            {/* Risk Categories */}
            <Card className="bg-white shadow-sm">
              <div className="border-b border-slate-200 px-3 py-2">
                <h2 className="text-base font-semibold text-slate-900 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-[#0055D4]" />
                  Risk Distribution by Category
                </h2>
              </div>
              <div className="p-3">
                <InteractiveBarChart data={metrics.categories} total={risks.length} />
              </div>
            </Card>


            {/* Top Risk Owners */}
            <Card className="bg-white shadow-sm">
              <div className="border-b border-slate-200 px-3 py-2">
                <h2 className="text-base font-semibold text-slate-900 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-[#0055D4]" />
                  Top Risk Owners
                </h2>
              </div>
              <div className="p-3">
                <div className="space-y-2">
                  {metrics.topOwners.map(([owner, count]) => (
                    <div 
                      key={owner} 
                      onClick={() => navigate(`/risks?owner=${encodeURIComponent(owner)}`)}
                      className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <span className="text-sm text-slate-700">{owner}</span>
                      <span className="text-sm font-medium bg-white px-3 py-1 rounded-full border border-slate-200">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Critical Actions */}
            <Card className="bg-white shadow-sm">
              <div className="border-b border-slate-200 px-3 py-2">
                <h2 className="text-base font-semibold text-slate-900 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-[#0055D4]" />
                  Critical Actions Required
                </h2>
              </div>
              <div className="p-3 space-y-2">
                {metrics.unmitigated > 0 && (
                  <Link to="/risks?unmitigated=true" className="block">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-medium text-slate-900">Unmitigated Risks</span>
                      </div>
                      <span className="text-sm font-bold text-red-600">{metrics.unmitigated}</span>
                    </div>
                  </Link>
                )}
                {metrics.riskLevels.Critical > 0 && (
                  <Link to="/risks?level=Critical" className="block">
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <span className="text-sm font-medium text-slate-900">Critical Risks</span>
                      </div>
                      <span className="text-sm font-bold text-orange-600">{metrics.riskLevels.Critical}</span>
                    </div>
                  </Link>
                )}
                <Link to="/reports" className="block">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                    <div className="flex items-center space-x-2">
                      <FileWarning className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-slate-900">Generate Report</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </div>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};