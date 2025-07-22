import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Shield, Users, AlertTriangle, FileText, Brain, ExternalLink, Edit } from 'lucide-react';
import { useRiskStore, useControlStore } from '../store';
import { RiskLevelBadge } from '../components/risks/RiskLevelBadge';
import { MitigationDisplay } from '../components/risks/MitigationDisplay';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { MultiSelect } from '../components/ui/MultiSelect';
import type { Risk, Control } from '../types';

interface TabContentProps {
  risk: Risk;
  relatedControls: Control[];
}

const DetailsTab: React.FC<TabContentProps> = ({ risk }) => {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-8090-primary" />
            Risk Details
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Risk ID</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{risk.id.toUpperCase()}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <div className="mt-1">
                  <Badge variant="default">{risk.riskCategory}</Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Risk Name</label>
                <p className="mt-1 text-sm text-gray-900 font-medium">{risk.risk}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Initial Risk Level</label>
                <div className="mt-1">
                  <RiskLevelBadge 
                    level={risk.initialScoring.riskLevelCategory} 
                    score={risk.initialScoring.riskLevel}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Residual Risk Level</label>
                <div className="mt-1">
                  <RiskLevelBadge 
                    level={risk.residualScoring.riskLevelCategory} 
                    score={risk.residualScoring.riskLevel}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Risk Reduction</label>
                <p className="mt-1 text-sm font-medium text-green-600">
                  -{risk.riskReduction} points ({risk.riskReductionPercentage}%)
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Risk Description */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Description</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{risk.riskDescription}</p>
        </div>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Initial Assessment */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Initial Assessment</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Likelihood</span>
                  <span className="text-sm font-medium">{risk.initialScoring.likelihood}/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Impact</span>
                  <span className="text-sm font-medium">{risk.initialScoring.impact}/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Risk Score</span>
                  <span className="text-sm font-medium">{risk.initialScoring.riskLevel}</span>
                </div>
              </div>
            </div>
            
            {/* Residual Assessment */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Residual Assessment</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Likelihood</span>
                  <span className="text-sm font-medium">{risk.residualScoring.likelihood}/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Impact</span>
                  <span className="text-sm font-medium">{risk.residualScoring.impact}/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Risk Score</span>
                  <span className="text-sm font-medium">{risk.residualScoring.riskLevel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Agreed Mitigation */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Agreed Mitigation</h3>
          <MitigationDisplay content={risk.agreedMitigation} />
          
          <div className="border-t pt-4 mt-6">
            <label className="text-sm font-medium text-gray-500">Mitigation Effectiveness</label>
            <div className="mt-1">
              <Badge variant={
                risk.mitigationEffectiveness === 'High' ? 'success' : 
                risk.mitigationEffectiveness === 'Medium' ? 'warning' : 'danger'
              }>
                {risk.mitigationEffectiveness}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Ownership and Support */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-8090-primary" />
            Ownership & Support
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Proposed Oversight Ownership</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {risk.proposedOversightOwnership.length > 0 ? (
                  risk.proposedOversightOwnership.map((owner, index) => (
                    <Badge key={index} variant="default" className="text-xs">
                      {owner}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">No owners assigned</span>
                )}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Proposed Support</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {risk.proposedSupport.length > 0 ? (
                  risk.proposedSupport.map((support, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {support}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">No support assigned</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Notes */}
      {risk.notes && (
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-8090-primary" />
              Notes
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">{risk.notes}</p>
          </div>
        </Card>
      )}
    </div>
  );
};

const ControlsTab: React.FC<TabContentProps> = ({ risk, relatedControls }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedControlIds, setSelectedControlIds] = useState<string[]>(risk.relatedControlIds);
  const { controls } = useControlStore();
  const { updateRiskControls } = useRiskStore();

  const handleSaveControls = async () => {
    try {
      await updateRiskControls(risk.id, selectedControlIds);
      setShowEditModal(false);
    } catch {
      alert('Failed to update controls. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-8090-primary" />
          Related Controls ({relatedControls.length})
        </h3>
        <Button
          variant="secondary"
          size="sm"
          icon={<Edit className="h-4 w-4" />}
          onClick={() => setShowEditModal(true)}
        >
          Edit Controls
        </Button>
      </div>

      {relatedControls.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No controls are currently linked to this risk.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {relatedControls.map(control => (
            <Card key={control.mitigationID}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-mono text-gray-600">{control.mitigationID}</span>
                      <Badge variant="default">{control.category}</Badge>
                      {control.implementationStatus && (
                        <Badge variant={
                          control.implementationStatus === 'Implemented' ? 'success' :
                          control.implementationStatus === 'In Progress' ? 'warning' : 'default'
                        }>
                          {control.implementationStatus}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 mb-2">{control.mitigationDescription}</p>
                  </div>
                  <Link 
                    to={`/controls/${control.mitigationID}`}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>

                {/* Compliance Mappings */}
                <div className="border-t pt-3">
                  <h5 className="text-xs font-medium text-gray-500 mb-2">REGULATORY COMPLIANCE</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
                    {control.compliance.cfrPart11Annex11 && (
                      <div>
                        <span className="text-gray-500">CFR Part 11:</span>
                        <span className="ml-1 text-gray-900">{control.compliance.cfrPart11Annex11}</span>
                      </div>
                    )}
                    {control.compliance.hipaaSafeguard && (
                      <div>
                        <span className="text-gray-500">HIPAA:</span>
                        <span className="ml-1 text-gray-900">{control.compliance.hipaaSafeguard}</span>
                      </div>
                    )}
                    {control.compliance.gdprArticle && (
                      <div>
                        <span className="text-gray-500">GDPR:</span>
                        <span className="ml-1 text-gray-900">{control.compliance.gdprArticle}</span>
                      </div>
                    )}
                    {control.compliance.euAiActArticle && (
                      <div>
                        <span className="text-gray-500">EU AI Act:</span>
                        <span className="ml-1 text-gray-900">{control.compliance.euAiActArticle}</span>
                      </div>
                    )}
                    {control.compliance.nist80053 && (
                      <div>
                        <span className="text-gray-500">NIST 800-53:</span>
                        <span className="ml-1 text-gray-900">{control.compliance.nist80053}</span>
                      </div>
                    )}
                    {control.compliance.soc2TSC && (
                      <div>
                        <span className="text-gray-500">SOC 2:</span>
                        <span className="ml-1 text-gray-900">{control.compliance.soc2TSC}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Controls Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Related Controls"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Select controls that are related to this risk. These controls help mitigate the risk.
          </p>
          
          <MultiSelect
            options={controls.map(control => ({
              value: control.mitigationID,
              label: `${control.mitigationID} - ${control.mitigationDescription}`
            }))}
            value={selectedControlIds}
            onChange={setSelectedControlIds}
            placeholder="Select controls..."
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedControlIds(risk.relatedControlIds);
                setShowEditModal(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveControls}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const AIAnalysisTab: React.FC<TabContentProps> = ({ risk, relatedControls }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate AI analysis - replace with actual Gemini API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAnalysis(`
**Risk Assessment Summary:**
This ${risk.riskCategory.toLowerCase()} presents a ${risk.residualScoring.riskLevelCategory.toLowerCase()} level threat to AI governance. The risk has been reduced by ${risk.riskReduction} points (${risk.riskReductionPercentage}%) through implemented mitigations.

**Key Concerns:**
• Initial likelihood was ${risk.initialScoring.likelihood}/5 with impact ${risk.initialScoring.impact}/5
• Current residual risk shows likelihood ${risk.residualScoring.likelihood}/5 with impact ${risk.residualScoring.impact}/5
• Mitigation effectiveness is rated as ${risk.mitigationEffectiveness.toLowerCase()}

**Control Coverage:**
• ${relatedControls.length} control(s) are currently linked to this risk
• ${relatedControls.filter(c => c.implementationStatus === 'Implemented').length} controls are fully implemented
• Additional controls may be needed if residual risk remains high

**Recommendations:**
1. Monitor the effectiveness of current mitigation strategies
2. Consider additional controls if residual risk remains high
3. Regular review of risk parameters as AI systems evolve
4. Ensure oversight ownership is clearly defined and accountable

**Regulatory Considerations:**
Given the risk category "${risk.riskCategory}", this should be evaluated against relevant compliance frameworks including GDPR, EU AI Act, and industry-specific regulations.
      `.trim());
      
    } catch {
      setError('Failed to generate AI analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Brain className="h-5 w-5 mr-2 text-8090-primary" />
          AI Risk Analysis
        </h3>
        <Button
          variant="primary"
          size="sm"
          onClick={generateAnalysis}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : analysis ? 'Regenerate Analysis' : 'Generate Analysis'}
        </Button>
      </div>

      {error && (
        <Card>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </div>
        </Card>
      )}

      {loading && (
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-8090-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Generating AI analysis...</p>
          </div>
        </Card>
      )}

      {analysis && !loading && (
        <Card>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed">
              {analysis}
            </div>
          </div>
        </Card>
      )}

      {!analysis && !loading && !error && (
        <Card>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              Generate an AI-powered analysis of this risk including recommendations and regulatory considerations.
            </p>
            <Button variant="primary" onClick={generateAnalysis}>
              Generate Analysis
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export const RiskDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { risks, loadRisks } = useRiskStore();
  const { controls, loadControls } = useControlStore();
  const [activeTab, setActiveTab] = useState<'details' | 'controls' | 'ai'>('details');

  useEffect(() => {
    if (risks.length === 0) {
      loadRisks();
    }
    if (controls.length === 0) {
      loadControls();
    }
  }, [risks.length, controls.length, loadRisks, loadControls]);

  const risk = risks.find(r => r.id === id);
  const relatedControls = controls.filter(c => c.relatedRiskIds.includes(id || ''));

  if (!risk) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Risk Not Found</h2>
          <p className="text-gray-600 mb-4">The risk with ID "{id}" could not be found.</p>
          <Button variant="primary" onClick={() => navigate('/risks')}>
            Back to Risk Register
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'controls', label: `Controls (${relatedControls.length})`, icon: Shield },
    { id: 'ai', label: 'AI Analysis', icon: Brain }
  ] as const;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/risks')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Risk Register</span>
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">{risk.risk}</h1>
            <RiskLevelBadge 
              level={risk.residualScoring.riskLevelCategory} 
              score={risk.residualScoring.riskLevel}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">Risk ID: {risk.id.toUpperCase()}</p>
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
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-8090-primary text-8090-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
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
        {activeTab === 'details' && <DetailsTab risk={risk} relatedControls={relatedControls} />}
        {activeTab === 'controls' && <ControlsTab risk={risk} relatedControls={relatedControls} />}
        {activeTab === 'ai' && <AIAnalysisTab risk={risk} relatedControls={relatedControls} />}
      </div>
    </div>
  );
};