import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileWarning, CheckCircle, Clock, XCircle, AlertCircle, ExternalLink, Edit, AlertTriangle } from 'lucide-react';
import { useControlStore, useRiskStore } from '../store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { EditControlModal } from '../components/controls/EditControlModal';
import { RiskLevelBadge } from '../components/risks/RiskLevelBadge';
import type { Control, Risk, UpdateControlInput } from '../types';
import { cn } from '../utils/cn';

interface TabContentProps {
  control: Control;
  relatedRisks: Risk[];
}

const DetailsTab: React.FC<TabContentProps> = ({ control }) => {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'Implemented':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'In Progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'Planned':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <XCircle className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Implemented':
        return 'text-green-600 bg-green-50';
      case 'In Progress':
        return 'text-blue-600 bg-blue-50';
      case 'Planned':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-8090-primary" />
            Control Details
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-500">Control ID</label>
                <p className="mt-1 text-sm text-slate-900 font-mono">{control.mitigationID.toUpperCase()}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-500">Category</label>
                <div className="mt-1">
                  <Badge variant="default">{control.category}</Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-500">Related Risks</label>
                <p className="mt-1 text-sm text-slate-900">{control.relatedRiskIds?.length || 0} risks mitigated</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-500">Implementation Status</label>
                <div className={cn(
                  "mt-1 inline-flex items-center space-x-2 px-3 py-2 rounded-lg",
                  getStatusColor(control.implementationStatus)
                )}>
                  {getStatusIcon(control.implementationStatus)}
                  <span className="text-sm font-medium">
                    {control.implementationStatus || 'Not Started'}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-500">Effectiveness</label>
                <div className="mt-1">
                  <Badge variant={
                    control.effectiveness === 'High' ? 'success' : 
                    control.effectiveness === 'Medium' ? 'warning' : 
                    control.effectiveness === 'Low' ? 'danger' : 'default'
                  }>
                    {control.effectiveness || 'Not Assessed'}
                  </Badge>
                </div>
              </div>
              
              {control.complianceScore !== undefined && (
                <div>
                  <label className="text-sm font-medium text-slate-500">Compliance Score</label>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {Math.round(control.complianceScore * 100)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Description */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Description</h3>
          <p className="text-sm text-slate-700 leading-relaxed">{control.mitigationDescription}</p>
        </div>
      </Card>

      {/* Implementation Details */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Implementation Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-500">Implementation Date</label>
              <p className="mt-1 text-sm text-slate-900">
                {control.implementationDate ? 
                  new Date(control.implementationDate).toLocaleDateString() : 
                  'Not set'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-500">Created Date</label>
              <p className="mt-1 text-sm text-slate-900">
                {control.createdAt ? 
                  new Date(control.createdAt).toLocaleDateString() : 
                  'Unknown'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-500">Last Updated</label>
              <p className="mt-1 text-sm text-slate-900">
                {control.lastUpdated ? 
                  new Date(control.lastUpdated).toLocaleDateString() : 
                  'Never'}
              </p>
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
};

const ComplianceTab: React.FC<TabContentProps> = ({ control }) => {
  const complianceFrameworks = [
    { 
      name: '21 CFR Part 11 / Annex 11', 
      value: control.compliance.cfrPart11Annex11,
      icon: '📋',
      description: 'FDA electronic records and signatures'
    },
    { 
      name: 'HIPAA Safeguard', 
      value: control.compliance.hipaaSafeguard,
      icon: '🏥',
      description: 'Health information privacy and security'
    },
    { 
      name: 'GDPR Article', 
      value: control.compliance.gdprArticle,
      icon: '🇪🇺',
      description: 'EU data protection regulation'
    },
    { 
      name: 'EU AI Act Article', 
      value: control.compliance.euAiActArticle,
      icon: '🤖',
      description: 'EU artificial intelligence regulation'
    },
    { 
      name: 'NIST 800-53', 
      value: control.compliance.nist80053,
      icon: '🛡️',
      description: 'Security and privacy controls'
    },
    { 
      name: 'SOC 2 TSC', 
      value: control.compliance.soc2TSC,
      icon: '✓',
      description: 'Trust services criteria'
    }
  ];

  const applicableFrameworks = complianceFrameworks.filter(f => f.value);

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-8090-primary" />
            Regulatory Compliance Mappings
          </h3>
          
          {applicableFrameworks.length === 0 ? (
            <p className="text-slate-500 text-sm">No regulatory mappings configured for this control.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applicableFrameworks.map((framework) => (
                <div key={framework.name} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{framework.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{framework.name}</h4>
                      <p className="text-sm text-slate-600 mt-1">{framework.value}</p>
                      <p className="text-xs text-slate-500 mt-2">{framework.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Compliance Score Breakdown */}
      {control.complianceScore !== undefined && (
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Compliance Score Breakdown</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Overall Compliance</span>
                <span className="text-lg font-semibold text-slate-900">
                  {Math.round(control.complianceScore * 100)}%
                </span>
              </div>
              
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all",
                    control.complianceScore >= 0.8 ? "bg-green-500" :
                    control.complianceScore >= 0.6 ? "bg-yellow-500" :
                    "bg-red-500"
                  )}
                  style={{ width: `${control.complianceScore * 100}%` }}
                />
              </div>
              
              <p className="text-xs text-slate-500">
                Based on {applicableFrameworks.length} applicable regulatory frameworks
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

const RelatedRisksTab: React.FC<TabContentProps> = ({ control, relatedRisks }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRiskIds, setSelectedRiskIds] = useState<string[]>(control.relatedRiskIds);
  const { risks } = useRiskStore();
  const { updateControlRisks, updatingRelationships } = useControlStore();
  const isUpdating = updatingRelationships.has(control.mitigationID);

  const handleSaveRisks = async () => {
    try {
      await updateControlRisks(control.mitigationID, selectedRiskIds);
      setShowEditModal(false);
      // No need for full refresh - optimistic updates handle it
    } catch {
      alert('Failed to update risks. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center">
          <FileWarning className="h-5 w-5 mr-2 text-8090-primary" />
          Mitigated Risks ({relatedRisks.length})
        </h3>
        <Button
          variant="secondary"
          size="sm"
          icon={<Edit className="h-4 w-4" />}
          onClick={() => setShowEditModal(true)}
          disabled={isUpdating}
        >
          {isUpdating ? 'Updating...' : 'Edit Risks'}
        </Button>
      </div>

      {relatedRisks.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <FileWarning className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500">No risks are currently mitigated by this control.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {relatedRisks.map(risk => (
            <Card key={risk.id} className="hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-mono text-slate-600">
                        {risk.id.toUpperCase()}
                      </span>
                      <Badge variant="default">{risk.riskCategory}</Badge>
                      <Badge variant={
                        risk.residualScoring.riskLevelCategory === 'Critical' ? 'danger' :
                        risk.residualScoring.riskLevelCategory === 'High' ? 'warning' :
                        risk.residualScoring.riskLevelCategory === 'Medium' ? 'default' :
                        'success'
                      }>
                        {risk.residualScoring.riskLevelCategory} Risk
                      </Badge>
                    </div>
                    
                    <h4 className="text-base font-medium text-slate-900 mb-2">{risk.risk}</h4>
                    <p className="text-sm text-slate-600 line-clamp-2">{risk.riskDescription}</p>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500">Initial Risk</span>
                        <p className="font-medium text-slate-900">{risk.initialScoring.riskLevel}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Residual Risk</span>
                        <p className="font-medium text-slate-900">{risk.residualScoring.riskLevel}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Risk Reduction</span>
                        <p className="font-medium text-green-600">-{risk.riskReduction}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Effectiveness</span>
                        <p className="font-medium text-slate-900">{risk.mitigationEffectiveness}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/risks/${risk.id}`}
                    className="ml-4 text-slate-400 hover:text-slate-600"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Risks Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Related Risks"
        size="xl"
      >
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <p className="text-sm text-slate-600 mb-2">
              Select risks that are mitigated by this control. Changes will be saved to the Excel file.
            </p>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{selectedRiskIds.length} of {risks.length} risks selected</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedRiskIds(risks.map(r => r.id))}
                  className="text-8090-primary hover:text-8090-primary/80"
                >
                  Select All
                </button>
                <span>•</span>
                <button
                  onClick={() => setSelectedRiskIds([])}
                  className="text-8090-primary hover:text-8090-primary/80"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto space-y-3">
            {Object.entries(
              risks
                .sort((a, b) => a.riskCategory.localeCompare(b.riskCategory) || a.risk.localeCompare(b.risk))
                .reduce((acc, risk) => {
                  const category = risk.riskCategory;
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(risk);
                  return acc;
                }, {} as Record<string, typeof risks>)
            ).map(([category, categoryRisks]) => (
              <div key={category} className="border rounded-lg p-4 bg-slate-50">
                <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-8090-primary" />
                  {category}
                  <span className="ml-2 text-xs text-slate-500">
                    ({categoryRisks.filter(r => selectedRiskIds.includes(r.id)).length}/{categoryRisks.length})
                  </span>
                </h4>
                <div className="space-y-2">
                  {categoryRisks.map(risk => {
                    const isSelected = selectedRiskIds.includes(risk.id);
                    return (
                      <label
                        key={risk.id}
                        className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-8090-primary/10 border border-8090-primary/20' 
                            : 'bg-white border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRiskIds([...selectedRiskIds, risk.id]);
                            } else {
                              setSelectedRiskIds(selectedRiskIds.filter(id => id !== risk.id));
                            }
                          }}
                          className="mt-1 h-4 w-4 text-8090-primary border-slate-300 rounded focus:ring-8090-primary"
                        />
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-slate-900">{risk.id.toUpperCase()}</span>
                            <div className="flex items-center space-x-2">
                              <RiskLevelBadge 
                                level={risk.initialRiskLevel} 
                                category={risk.initialRiskLevelCategory as 'Low' | 'Medium' | 'High' | 'Critical'} 
                                size="sm"
                              />
                            </div>
                          </div>
                          <p className="font-medium text-sm text-slate-900 mb-1">{risk.risk}</p>
                          <p className="text-sm text-slate-600 line-clamp-2 mb-2">{risk.riskDescription}</p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span>Impact: {risk.initialImpact}</span>
                            <span>•</span>
                            <span>Likelihood: {risk.initialLikelihood}</span>
                            <span>•</span>
                            <span>Level: {risk.initialRiskLevel}</span>
                          </div>
                          {risk.proposedOversightOwnership && (
                            <div className="mt-2">
                              <span className="text-xs text-slate-500">Owner: </span>
                              <span className="text-xs text-slate-700">{risk.proposedOversightOwnership}</span>
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedRiskIds(control.relatedRiskIds);
                setShowEditModal(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveRisks}
            >
              Save Changes ({selectedRiskIds.length} selected)
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export const ControlDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { controls, loadControls, updateControl } = useControlStore();
  const { risks, loadRisks } = useRiskStore();
  const [activeTab, setActiveTab] = useState<'details' | 'compliance' | 'risks'>('details');
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (controls.length === 0) {
      loadControls();
    }
    if (risks.length === 0) {
      loadRisks();
    }
  }, [controls.length, risks.length, loadControls, loadRisks]);

  const control = controls.find(c => c.mitigationID === id);
  const relatedRisks = risks.filter(r => r.relatedControlIds?.includes(id || ''));

  if (!control) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Control Not Found</h2>
          <p className="text-slate-600 mb-4">The control with ID "{id}" could not be found.</p>
          <Button variant="primary" onClick={() => navigate('/controls')}>
            Back to Controls
          </Button>
        </div>
      </div>
    );
  }

  const handleSaveControl = async (updatedControl: Partial<Control>) => {
    try {
      if (!updatedControl.mitigationID) {
        console.error('Control ID is required for update');
        return;
      }
      await updateControl(updatedControl as UpdateControlInput);
      setShowEditModal(false);
    } catch {
      // Error will be displayed by the store
      console.error('Failed to update control:', error);
    }
  };

  const tabs = [
    { id: 'details', label: 'Details', icon: Shield },
    { id: 'compliance', label: 'Compliance', icon: CheckCircle },
    { id: 'risks', label: `Related Risks (${relatedRisks.length})`, icon: FileWarning }
  ] as const;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/controls')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Controls</span>
        </Button>
        
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900">{control.mitigationDescription}</h1>
          <p className="text-sm text-slate-600 mt-1">Control ID: {control.mitigationID.toUpperCase()}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowEditModal(true)}
            icon={<Edit className="h-4 w-4" />}
          >
            Edit Control
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2",
                  activeTab === tab.id
                    ? 'border-8090-primary text-8090-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'details' && <DetailsTab control={control} relatedRisks={relatedRisks} />}
        {activeTab === 'compliance' && <ComplianceTab control={control} relatedRisks={relatedRisks} />}
        {activeTab === 'risks' && <RelatedRisksTab control={control} relatedRisks={relatedRisks} />}
      </div>

      {/* Edit Control Modal */}
      <EditControlModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        control={control}
        onSave={handleSaveControl}
      />
    </div>
  );
};