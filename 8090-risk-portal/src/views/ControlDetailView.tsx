import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileWarning, CheckCircle, Clock, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useControlStore, useRiskStore } from '../store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import type { Control, Risk } from '../types';
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
        return <XCircle className="h-5 w-5 text-gray-400" />;
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
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-8090-primary" />
            Control Details
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Control ID</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{control.mitigationID.toUpperCase()}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <div className="mt-1">
                  <Badge variant="default">{control.category}</Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Related Risks</label>
                <p className="mt-1 text-sm text-gray-900">{control.relatedRiskIds.length} risks mitigated</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Implementation Status</label>
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
                <label className="text-sm font-medium text-gray-500">Effectiveness</label>
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
                  <label className="text-sm font-medium text-gray-500">Compliance Score</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">
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
          <h3 className="text-lg font-semibold text-gray-900">Description</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{control.mitigationDescription}</p>
        </div>
      </Card>

      {/* Implementation Details */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Implementation Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Implementation Date</label>
              <p className="mt-1 text-sm text-gray-900">
                {control.implementationDate ? 
                  new Date(control.implementationDate).toLocaleDateString() : 
                  'Not set'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Created Date</label>
              <p className="mt-1 text-sm text-gray-900">
                {control.createdAt ? 
                  new Date(control.createdAt).toLocaleDateString() : 
                  'Unknown'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <p className="mt-1 text-sm text-gray-900">
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
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-8090-primary" />
            Regulatory Compliance Mappings
          </h3>
          
          {applicableFrameworks.length === 0 ? (
            <p className="text-gray-500 text-sm">No regulatory mappings configured for this control.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applicableFrameworks.map((framework) => (
                <div key={framework.name} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{framework.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{framework.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{framework.value}</p>
                      <p className="text-xs text-gray-500 mt-2">{framework.description}</p>
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
            <h3 className="text-lg font-semibold text-gray-900">Compliance Score Breakdown</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall Compliance</span>
                <span className="text-lg font-semibold text-gray-900">
                  {Math.round(control.complianceScore * 100)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
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
              
              <p className="text-xs text-gray-500">
                Based on {applicableFrameworks.length} applicable regulatory frameworks
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

const RelatedRisksTab: React.FC<TabContentProps> = ({ relatedRisks }) => {

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileWarning className="h-5 w-5 mr-2 text-8090-primary" />
          Mitigated Risks ({relatedRisks.length})
        </h3>
      </div>

      {relatedRisks.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <FileWarning className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No risks are currently mitigated by this control.</p>
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
                      <span className="text-sm font-mono text-gray-600">
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
                    
                    <h4 className="text-base font-medium text-gray-900 mb-2">{risk.risk}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{risk.riskDescription}</p>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500">Initial Risk</span>
                        <p className="font-medium text-gray-900">{risk.initialScoring.riskLevel}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Residual Risk</span>
                        <p className="font-medium text-gray-900">{risk.residualScoring.riskLevel}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Risk Reduction</span>
                        <p className="font-medium text-green-600">-{risk.riskReduction}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Effectiveness</span>
                        <p className="font-medium text-gray-900">{risk.mitigationEffectiveness}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/risks/${risk.id}`}
                    className="ml-4 text-gray-400 hover:text-gray-600"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export const ControlDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { controls, loadControls } = useControlStore();
  const { risks, loadRisks } = useRiskStore();
  const [activeTab, setActiveTab] = useState<'details' | 'compliance' | 'risks'>('details');

  useEffect(() => {
    if (controls.length === 0) {
      loadControls();
    }
    if (risks.length === 0) {
      loadRisks();
    }
  }, [controls.length, risks.length, loadControls, loadRisks]);

  const control = controls.find(c => c.mitigationID === id);
  const relatedRisks = risks.filter(r => r.relatedControlIds.includes(id || ''));

  if (!control) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Control Not Found</h2>
          <p className="text-gray-600 mb-4">The control with ID "{id}" could not be found.</p>
          <Button variant="primary" onClick={() => navigate('/controls')}>
            Back to Controls
          </Button>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">{control.mitigationDescription}</h1>
            <Badge variant={
              control.implementationStatus === 'Implemented' ? 'success' :
              control.implementationStatus === 'In Progress' ? 'warning' :
              control.implementationStatus === 'Planned' ? 'default' : 'secondary'
            }>
              {control.implementationStatus || 'Not Started'}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1">Control ID: {control.mitigationID.toUpperCase()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
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
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
    </div>
  );
};