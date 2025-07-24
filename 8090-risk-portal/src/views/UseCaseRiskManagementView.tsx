import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Button, Card, Badge, Input, Spinner, Breadcrumb, type BreadcrumbItem } from '../components/ui';
import { useUseCaseStore, useRiskStore } from '../store';

export function UseCaseRiskManagementView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedUseCase, fetchUseCase, loading: useCaseLoading } = useUseCaseStore();
  const { risks, fetchRisks, loading: risksLoading } = useRiskStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskIds, setSelectedRiskIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUseCase(id);
      fetchRisks();
    }
  }, [id, fetchUseCase, fetchRisks]);

  useEffect(() => {
    if (selectedUseCase?.associatedRisks) {
      setSelectedRiskIds(new Set(selectedUseCase.associatedRisks));
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
    risk.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    risk.category.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-semibold">Manage Associated Risks</h1>
          <p className="text-gray-600 mt-1">{selectedUseCase.title}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleBack}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
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
          placeholder="Search risks by description or category..."
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
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={getRiskLevelColor(risk.overallRiskLevel)}>
                      {risk.overallRiskLevel}
                    </Badge>
                    <span className="text-sm text-gray-600">{risk.category}</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{risk.description}</h3>
                  <p className="text-sm text-gray-600">
                    Impact: {risk.impact} | Probability: {risk.probability}
                  </p>
                  {risk.associatedControls.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {risk.associatedControls.length} control{risk.associatedControls.length !== 1 ? 's' : ''} associated
                    </p>
                  )}
                </div>
                <div className="ml-4">
                  {isSelected ? (
                    <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <div className="h-6 w-6 border-2 border-gray-300 rounded-full" />
                  )}
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