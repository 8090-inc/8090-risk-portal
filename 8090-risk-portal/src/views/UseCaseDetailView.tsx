import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Badge, Breadcrumb, type BreadcrumbItem, Spinner } from '../components/ui';
import { PageHeader } from '../components/layout/PageHeader';
import { useUseCaseStore } from '../store/useCaseStore';
import type { Risk } from '../types';
import { 
  Edit, 
  Trash2, 
  DollarSign, 
  Calendar, 
  Users, 
  Target,
  Brain,
  CheckCircle,
  Shield,
  AlertTriangle
} from 'lucide-react';

export function UseCaseDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [associatedRisks, setAssociatedRisks] = useState<Risk[]>([]);
  const [risksLoading, setRisksLoading] = useState(false);
  
  const {
    selectedUseCase,
    loading,
    error,
    fetchUseCaseById,
    deleteUseCase,
    clearError
  } = useUseCaseStore();
  
  useEffect(() => {
    if (id) {
      fetchUseCaseById(id);
    }
  }, [id, fetchUseCaseById]);
  
  // Fetch associated risks when use case is loaded
  useEffect(() => {
    const fetchAssociatedRisks = async () => {
      if (!selectedUseCase || !id) return;
      
      setRisksLoading(true);
      try {
        const response = await fetch(`/api/v1/usecases/${id}/risks`);
        if (response.ok) {
          const data = await response.json();
          setAssociatedRisks(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch associated risks:', error);
      } finally {
        setRisksLoading(false);
      }
    };
    
    fetchAssociatedRisks();
  }, [selectedUseCase, id]);
  
  const handleEdit = () => {
    navigate(`/usecases/${id}/edit`);
  };
  
  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    
    try {
      await deleteUseCase(id!);
      navigate('/usecases');
    } catch (error) {
      console.error('Failed to delete use case:', error);
    }
  };
  
  const handleManageRisks = () => {
    navigate(`/usecases/${id}/risks`);
  };
  
  // Format currency
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Get status badge variant
  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'In Production':
        return 'default';
      case 'In Development':
      case 'Pilot':
        return 'secondary';
      case 'Approved':
        return 'success';
      case 'On Hold':
      case 'Cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };
  
  // Get complexity/level color
  const getLevelColor = (level?: string) => {
    switch (level) {
      case 'High':
        return 'text-red-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };
  
  // Get risk level badge color
  const getRiskLevelColor = (level: string) => {
    const levelMap: Record<string, string> = {
      'Critical': 'destructive',
      'High': 'destructive',
      'Medium': 'secondary',
      'Low': 'outline'
    };
    return levelMap[level] || 'secondary';
  };
  
  // Sort risks by severity
  const sortedRisks = [...associatedRisks].sort((a, b) => {
    const severityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
    return (severityOrder[a.initialScoring.riskLevelCategory] || 4) - (severityOrder[b.initialScoring.riskLevelCategory] || 4);
  });
  
  // Count risks by level
  const riskCounts = associatedRisks.reduce((acc, risk) => {
    acc[risk.initialScoring.riskLevelCategory] = (acc[risk.initialScoring.riskLevelCategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
          <div className="grid gap-6">
            <div className="h-48 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
          <div className="mt-4 space-x-2">
            <Button variant="secondary" onClick={() => navigate('/usecases')}>
              Back to Use Cases
            </Button>
            <Button variant="secondary" onClick={clearError}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!selectedUseCase) {
    return null;
  }
  
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Use Cases', href: '/usecases' },
    { label: selectedUseCase.title }
  ];
  
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-2">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      
      <PageHeader
        title={selectedUseCase.title}
        description={selectedUseCase.description}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            {deleteConfirm ? (
              <>
                <Button variant="secondary" onClick={() => setDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                  Confirm Delete
                </Button>
              </>
            ) : (
              <Button variant="danger" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        }
      />
      
      {/* Subtle Metadata Line */}
      <div className="mt-8 mb-8 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          {selectedUseCase.status && (
            <span className="font-medium text-slate-500">
              {selectedUseCase.status}
            </span>
          )}
          {selectedUseCase.businessArea && (
            <>
              {selectedUseCase.status && <span>•</span>}
              <span>{selectedUseCase.businessArea}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono">{selectedUseCase.id}</span>
          {selectedUseCase.lastUpdated && (
            <>
              <span>•</span>
              <span>{new Date(selectedUseCase.lastUpdated).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </>
          )}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* AI Categories */}
          {selectedUseCase.aiCategories && selectedUseCase.aiCategories.length > 0 && (
            <Card className="p-4 border-slate-200">
              <h3 className="text-lg font-semibold mb-3 flex items-center text-slate-900">
                <Brain className="mr-2 h-4 w-4 text-slate-600" />
                AI Technologies
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {selectedUseCase.aiCategories.map((category, index) => (
                  <Badge key={index} variant="secondary" size="sm" className="font-medium">
                    {category}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
          
          {/* Objective */}
          {selectedUseCase.objective && (
            <Card className="p-4 border-slate-200">
              <h3 className="text-lg font-semibold mb-3 text-slate-900">Objective & Solution</h3>
              <div className="space-y-3">
                {selectedUseCase.objective.currentState && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Current State</h4>
                    <p className="text-sm">{selectedUseCase.objective.currentState}</p>
                  </div>
                )}
                {selectedUseCase.objective.futureState && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Future State</h4>
                    <p className="text-sm">{selectedUseCase.objective.futureState}</p>
                  </div>
                )}
                {selectedUseCase.objective.solution && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Solution</h4>
                    <p className="text-sm">{selectedUseCase.objective.solution}</p>
                  </div>
                )}
                {selectedUseCase.objective.benefits && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Benefits</h4>
                    <p className="text-sm">{selectedUseCase.objective.benefits}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
          
          {/* Execution Details */}
          {selectedUseCase.execution && (
            <Card className="p-4 border-slate-200">
              <h3 className="text-lg font-semibold mb-3 text-slate-900">Execution Details</h3>
              <div className="space-y-3">
                {selectedUseCase.execution.functionsImpacted && selectedUseCase.execution.functionsImpacted.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Functions Impacted</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUseCase.execution.functionsImpacted.map((func, index) => (
                        <Badge key={index} variant="outline">
                          {func}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedUseCase.execution.dataRequirements && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Data Requirements</h4>
                    <p className="text-sm">{selectedUseCase.execution.dataRequirements}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  {selectedUseCase.execution.aiComplexity && (
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                      <span className="text-xs text-muted-foreground">AI Complexity</span>
                      <span className={`text-xs font-semibold ${getLevelColor(selectedUseCase.execution.aiComplexity)}`}>
                        {selectedUseCase.execution.aiComplexity}
                      </span>
                    </div>
                  )}
                  {selectedUseCase.execution.feasibility && (
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                      <span className="text-xs text-muted-foreground">Feasibility</span>
                      <span className={`text-xs font-semibold ${getLevelColor(selectedUseCase.execution.feasibility)}`}>
                        {selectedUseCase.execution.feasibility}
                      </span>
                    </div>
                  )}
                  {selectedUseCase.execution.value && (
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                      <span className="text-xs text-muted-foreground">Business Value</span>
                      <span className={`text-xs font-semibold ${getLevelColor(selectedUseCase.execution.value)}`}>
                        {selectedUseCase.execution.value}
                      </span>
                    </div>
                  )}
                  {selectedUseCase.execution.risk && (
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                      <span className="text-xs text-muted-foreground">Risk Level</span>
                      <span className={`text-xs font-semibold ${getLevelColor(selectedUseCase.execution.risk)}`}>
                        {selectedUseCase.execution.risk}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          {/* Impact & Metrics */}
          {selectedUseCase.impact && (
            <Card className="p-4 border-slate-200">
              <h3 className="text-lg font-semibold mb-3 text-slate-900">Impact & Metrics</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 bg-green-50 rounded-md">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cost Saving</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {formatCurrency(selectedUseCase.impact.costSaving)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 bg-blue-50 rounded-md">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Effort</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {selectedUseCase.impact.effortMonths || 'N/A'} months
                      </p>
                    </div>
                  </div>
                </div>
                
                {selectedUseCase.impact.impactPoints && selectedUseCase.impact.impactPoints.length > 0 && (
                  <div>
                    <h4 className="font-medium text-xs text-muted-foreground mb-2 uppercase tracking-wide">Key Impact Areas</h4>
                    <ul className="space-y-1">
                      {selectedUseCase.impact.impactPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}
          
          {/* Ownership & Stakeholders */}
          <Card className="p-4 border-slate-200">
            <h3 className="text-lg font-semibold mb-3 flex items-center text-slate-900">
              <Users className="mr-2 h-4 w-4 text-slate-600" />
              Ownership & Stakeholders
            </h3>
            <div className="space-y-3">
              {selectedUseCase.owner && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Owner</h4>
                  <p className="text-sm">{selectedUseCase.owner}</p>
                </div>
              )}
              
              {selectedUseCase.stakeholders && selectedUseCase.stakeholders.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Stakeholders</h4>
                  <ul className="space-y-1">
                    {selectedUseCase.stakeholders.map((stakeholder, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{stakeholder}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
          
          
          {/* Notes */}
          {selectedUseCase.notes && (
            <Card className="p-4 border-slate-200">
              <h3 className="text-lg font-semibold mb-2 text-slate-900">Notes</h3>
              <p className="text-sm whitespace-pre-wrap text-slate-700">{selectedUseCase.notes}</p>
            </Card>
          )}
          
          {/* Timeline */}
          {(selectedUseCase.implementationStart || selectedUseCase.implementationEnd) && (
            <Card className="p-4 border-slate-200">
              <h3 className="text-lg font-semibold mb-2 text-slate-900">Timeline</h3>
              <div className="space-y-1.5">
                {selectedUseCase.implementationStart && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Start Date</span>
                    <span className="text-sm">
                      {new Date(selectedUseCase.implementationStart).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {selectedUseCase.implementationEnd && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">End Date</span>
                    <span className="text-sm">
                      {new Date(selectedUseCase.implementationEnd).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
      
      {/* Prominent Risk Section */}
      <div className="mt-6">
        <Card className="overflow-hidden border-slate-200">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 border-b border-orange-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white rounded-md shadow-sm">
                  <Shield className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Associated Risks</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {associatedRisks.length === 0 
                      ? 'No risks have been associated with this use case'
                      : `${associatedRisks.length} risk${associatedRisks.length !== 1 ? 's' : ''} identified across ${Object.keys(riskCounts).length} severity level${Object.keys(riskCounts).length !== 1 ? 's' : ''}`
                    }
                  </p>
                </div>
              </div>
              <Button onClick={handleManageRisks} variant="secondary">
                <Target className="mr-2 h-4 w-4" />
                Manage Risks
              </Button>
            </div>
            
            {/* Risk Summary */}
            {associatedRisks.length > 0 && (
              <div className="flex gap-4 mt-4">
                {Object.entries(riskCounts).map(([level, count]) => (
                  <div key={level} className="flex items-center gap-1.5">
                    <Badge variant={getRiskLevelColor(level)} size="sm" className="font-semibold">
                      {level}
                    </Badge>
                    <span className="text-sm font-semibold text-slate-700">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-4">
            {risksLoading ? (
              <div className="flex items-center justify-center py-6">
                <Spinner size="lg" />
              </div>
            ) : associatedRisks.length === 0 ? (
              <div className="text-center py-6">
                <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">No risks have been identified for this use case yet.</p>
                <Button onClick={handleManageRisks} variant="outline" size="sm">
                  Associate Risks
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedRisks.map((risk) => (
                  <Card key={risk.id} className="p-3 hover:shadow-sm transition-all border-slate-200 hover:border-slate-300">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <Badge variant={getRiskLevelColor(risk.initialScoring.riskLevelCategory)} size="sm" className="font-semibold">
                            {risk.initialScoring.riskLevelCategory}
                          </Badge>
                          <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                            <span className="text-slate-400">#</span>{risk.id.toUpperCase()}
                          </span>
                          <span className="text-xs text-muted-foreground">• {risk.riskCategory}</span>
                        </div>
                        <h4 className="text-sm font-medium text-slate-900 line-clamp-1 mb-1">{risk.risk}</h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Impact: <span className="font-medium text-slate-700">{risk.initialScoring.impact}</span></span>
                          <span>Likelihood: <span className="font-medium text-slate-700">{risk.initialScoring.likelihood}</span></span>
                          {risk.relatedControlIds.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              <span className="font-medium text-slate-700">{risk.relatedControlIds.length}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/risks/${risk.id}`)}
                        className="text-xs"
                      >
                        View
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}