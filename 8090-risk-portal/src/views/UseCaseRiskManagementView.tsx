import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Button, Card, Badge, Input, Spinner, Breadcrumb, type BreadcrumbItem } from '../components/ui';
import { useUseCaseStore, useRiskStore } from '../store';

export function UseCaseRiskManagementView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedUseCase, fetchUseCase, loading: useCaseLoading } = useUseCaseStore();
  const { risks, loadRisks, loading: risksLoading } = useRiskStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskIds, setSelectedRiskIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUseCase(id);
      loadRisks();
    }
  }, [id, fetchUseCase, loadRisks]);

  useEffect(() => {
    if (selectedUseCase?.relatedRiskIds) {
      setSelectedRiskIds(new Set(selectedUseCase.relatedRiskIds));
    }
  }, [selectedUseCase]);

  const handleBack = () => {
    navigate(`/usecases/${id}`);
  };

  const toggleRisk = (riskId: string) => {
    const newSelection = new Set(selectedRiskIds);
    if (newSelection.has(riskId)) {
      newSelection.delete(riskId);
    } else {
      newSelection.add(riskId);
    }
    setSelectedRiskIds(newSelection);
  };

  const handleSave = async () => {
    if (!selectedUseCase || !id) return;
    
    setSaving(true);
    try {
      // Call the store method to update risk associations
      await useUseCaseStore.getState().associateRisks(id, Array.from(selectedRiskIds));
      navigate(`/usecases/${id}`);
    } catch (error) {
      console.error('Failed to update associated risks:', error);
    } finally {
      setSaving(false);
    }
  };

  const filteredRisks = risks.filter(risk => 
    risk.riskDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    risk.riskCategory?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskLevelColor = (level: string) => {
    const levelMap: Record<string, string> = {
      'Critical': 'badge-risk-critical',
      'High': 'badge-risk-high',
      'Medium': 'badge-risk-medium',
      'Low': 'badge-risk-low'
    };
    return levelMap[level] || '';
  };

  if (useCaseLoading || risksLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!selectedUseCase) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Use case not found</p>
        <Button onClick={() => navigate('/usecases')} className="mt-4">
          Back to Use Cases
        </Button>
      </div>
    );
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Use Cases', href: '/usecases' },
    { label: selectedUseCase.title, href: `/usecases/${id}` },
    { label: 'Manage Risks' }
  ];
  
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Manage Associated Risks</h1>
          <p className="text-sm text-gray-600 mt-1">{selectedUseCase.title}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleBack}
            size="sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="gap-2"
          >
            {saving ? <Spinner size="sm" /> : <Plus className="h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Search risks by description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selected Risks Summary */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm font-medium text-blue-900">
          {selectedRiskIds.size} risk{selectedRiskIds.size !== 1 ? 's' : ''} selected
        </p>
      </Card>

      {/* Risk List */}
      <div className="space-y-2">
        {filteredRisks.map((risk) => {
          const isSelected = selectedRiskIds.has(risk.id);
          return (
            <Card
              key={risk.id}
              className={`p-4 cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
              }`}
              onClick={() => toggleRisk(risk.id)}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleRisk(risk.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge 
                      className={getRiskLevelColor(risk.initialScoring.riskLevelCategory)}
                      size="sm"
                    >
                      {risk.initialScoring.riskLevelCategory}
                    </Badge>
                    <span className="text-xs font-semibold text-gray-700">ID: {risk.id}</span>
                    <span className="text-xs text-gray-600">• {risk.riskCategory}</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">{risk.riskDescription}</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>Impact: <span className="font-medium">{risk.initialScoring.impact}</span></span>
                    <span>Likelihood: <span className="font-medium">{risk.initialScoring.likelihood}</span></span>
                    {risk.relatedControlIds.length > 0 && (
                      <span className="flex items-center gap-1 text-xs">
                        <span className="text-gray-500">•</span>
                        {risk.relatedControlIds.length} control{risk.relatedControlIds.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredRisks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No risks found matching your search</p>
        </div>
      )}
    </div>
  );
}