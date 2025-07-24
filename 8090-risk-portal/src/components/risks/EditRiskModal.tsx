import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { MultiSelect } from '../ui/MultiSelect';
import { Badge } from '../ui/Badge';
import { RISK_OWNERS } from '../../constants/riskOwners';
import { useControlStore } from '../../store';
import { getRiskLevelCategory } from '../../utils/dataTransformers';
import type { Risk, RiskCategory, RiskLikelihood, RiskImpact, UpdateRiskInput } from '../../types';

interface EditRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  risk: Risk;
  onSave: (updatedRisk: Partial<Risk>) => Promise<void>;
}

const riskCategories: RiskCategory[] = [
  'Behavioral Risks',
  'Transparency Risks',
  'Security and Data Risks',
  'Other Risks',
  'Business/Cost Related Risks',
  'AI Human Impact Risks'
];

export const EditRiskModal: React.FC<EditRiskModalProps> = ({
  isOpen,
  onClose,
  risk,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<Risk>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { controls } = useControlStore();

  // Initialize form data when modal opens or risk changes
  useEffect(() => {
    if (isOpen && risk) {
      setFormData({
        id: risk.id,
        risk: risk.risk, // This will be read-only
        riskCategory: risk.riskCategory,
        riskDescription: risk.riskDescription,
        initialScoring: { ...risk.initialScoring },
        residualScoring: { ...risk.residualScoring },
        exampleMitigations: risk.exampleMitigations,
        agreedMitigation: risk.agreedMitigation,
        proposedOversightOwnership: [...risk.proposedOversightOwnership],
        proposedSupport: [...risk.proposedSupport],
        notes: risk.notes,
        relatedControlIds: [...risk.relatedControlIds]
      });
      setError(null);
    }
  }, [isOpen, risk]);

  // Auto-calculate risk levels when likelihood or impact changes
  useEffect(() => {
    if (formData.initialScoring) {
      const level = (formData.initialScoring.likelihood || 1) * (formData.initialScoring.impact || 1);
      setFormData(prev => ({
        ...prev,
        initialScoring: {
          ...prev.initialScoring!,
          riskLevel: level,
          riskLevelCategory: getRiskLevelCategory(level)
        }
      }));
    }
  }, [formData.initialScoring?.likelihood, formData.initialScoring?.impact]);

  useEffect(() => {
    if (formData.residualScoring) {
      const level = (formData.residualScoring.likelihood || 1) * (formData.residualScoring.impact || 1);
      setFormData(prev => ({
        ...prev,
        residualScoring: {
          ...prev.residualScoring!,
          riskLevel: level,
          riskLevelCategory: getRiskLevelCategory(level)
        }
      }));
    }
  }, [formData.residualScoring?.likelihood, formData.residualScoring?.impact]);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Calculate risk reduction values
      const initialLevel = formData.initialScoring?.riskLevel || 0;
      const residualLevel = formData.residualScoring?.riskLevel || 0;
      const riskReduction = initialLevel - residualLevel;
      const riskReductionPercentage = initialLevel > 0 
        ? Math.round((riskReduction / initialLevel) * 100)
        : 0;
      
      // Determine mitigation effectiveness
      let mitigationEffectiveness: 'High' | 'Medium' | 'Low' = 'Low';
      if (riskReductionPercentage >= 50) {
        mitigationEffectiveness = 'High';
      } else if (riskReductionPercentage >= 25) {
        mitigationEffectiveness = 'Medium';
      }
      
      const updatedRisk: UpdateRiskInput = {
        ...formData,
        id: risk.id, // Ensure ID is always included
        riskReduction,
        riskReductionPercentage,
        mitigationEffectiveness
      } as UpdateRiskInput;
      
      await onSave(updatedRisk);
      onClose();
    } catch (err) {
      console.error('Failed to save risk:', err);
      setError(err instanceof Error ? err.message : 'Failed to save risk. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskLevelBadgeVariant = (level: string): 'danger' | 'warning' | 'default' | 'success' => {
    switch (level) {
      case 'Critical': return 'danger';
      case 'High': return 'warning';
      case 'Medium': return 'default';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Risk"
      size="xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Risk Name (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Risk Name <span className="text-slate-500">(cannot be changed)</span>
          </label>
          <input
            type="text"
            value={formData.risk || ''}
            disabled
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-slate-500">
            Risk ID: {risk.id}
          </p>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
          
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Risk Category <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.riskCategory}
              onChange={(value) => setFormData(prev => ({ ...prev, riskCategory: value as RiskCategory }))}
              options={riskCategories.map(cat => ({ value: cat, label: cat }))}
              placeholder="Select category"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Risk Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.riskDescription || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, riskDescription: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
              rows={3}
              placeholder="Describe the risk"
            />
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Initial Assessment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Initial Assessment</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Likelihood (1-5)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.initialScoring?.likelihood || 1}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  initialScoring: {
                    ...prev.initialScoring!,
                    likelihood: parseInt(e.target.value) as RiskLikelihood
                  }
                }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>1 - Very Unlikely</span>
                <span className="font-semibold">{formData.initialScoring?.likelihood || 1}</span>
                <span>5 - Very Likely</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Impact (1-5)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.initialScoring?.impact || 1}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  initialScoring: {
                    ...prev.initialScoring!,
                    impact: parseInt(e.target.value) as RiskImpact
                  }
                }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>1 - Minimal</span>
                <span className="font-semibold">{formData.initialScoring?.impact || 1}</span>
                <span>5 - Severe</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Risk Level:</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{formData.initialScoring?.riskLevel || 0}</span>
                  <Badge variant={getRiskLevelBadgeVariant(formData.initialScoring?.riskLevelCategory || '')}>
                    {formData.initialScoring?.riskLevelCategory || 'Low'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Residual Assessment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Residual Assessment</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Likelihood (1-5)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.residualScoring?.likelihood || 1}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  residualScoring: {
                    ...prev.residualScoring!,
                    likelihood: parseInt(e.target.value) as RiskLikelihood
                  }
                }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>1 - Very Unlikely</span>
                <span className="font-semibold">{formData.residualScoring?.likelihood || 1}</span>
                <span>5 - Very Likely</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Impact (1-5)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.residualScoring?.impact || 1}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  residualScoring: {
                    ...prev.residualScoring!,
                    impact: parseInt(e.target.value) as RiskImpact
                  }
                }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>1 - Minimal</span>
                <span className="font-semibold">{formData.residualScoring?.impact || 1}</span>
                <span>5 - Severe</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Risk Level:</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{formData.residualScoring?.riskLevel || 0}</span>
                  <Badge variant={getRiskLevelBadgeVariant(formData.residualScoring?.riskLevelCategory || '')}>
                    {formData.residualScoring?.riskLevelCategory || 'Low'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Reduction Summary */}
        {formData.initialScoring && formData.residualScoring && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-semibold text-green-900 mb-2">Risk Reduction</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-700">Points Reduced:</span>
                <span className="ml-2 font-semibold text-green-900">
                  {(formData.initialScoring.riskLevel || 0) - (formData.residualScoring.riskLevel || 0)}
                </span>
              </div>
              <div>
                <span className="text-green-700">Percentage:</span>
                <span className="ml-2 font-semibold text-green-900">
                  {formData.initialScoring.riskLevel ? 
                    Math.round((((formData.initialScoring.riskLevel || 0) - (formData.residualScoring.riskLevel || 0)) / formData.initialScoring.riskLevel) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mitigation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Mitigation</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Agreed Mitigation
            </label>
            <textarea
              value={formData.agreedMitigation || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, agreedMitigation: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
              rows={4}
              placeholder="Describe the agreed mitigation strategy"
            />
            <p className="mt-1 text-xs text-slate-500">Supports markdown formatting</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Example Mitigations
            </label>
            <textarea
              value={formData.exampleMitigations || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, exampleMitigations: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
              rows={3}
              placeholder="List example mitigation strategies"
            />
          </div>
        </div>

        {/* Governance */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Governance & Ownership</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Proposed Oversight Ownership <span className="text-red-500">*</span>
            </label>
            <MultiSelect
              options={RISK_OWNERS.map(owner => ({ value: owner, label: owner }))}
              value={formData.proposedOversightOwnership || []}
              onChange={(value) => setFormData(prev => ({ ...prev, proposedOversightOwnership: value }))}
              placeholder="Select owners"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Proposed Support
            </label>
            <MultiSelect
              options={RISK_OWNERS.map(owner => ({ value: owner, label: owner }))}
              value={formData.proposedSupport || []}
              onChange={(value) => setFormData(prev => ({ ...prev, proposedSupport: value }))}
              placeholder="Select support teams"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
              rows={2}
              placeholder="Additional notes"
            />
          </div>
        </div>

        {/* Related Controls */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Related Controls
          </label>
          <MultiSelect
            options={controls.map(control => ({ 
              value: control.mitigationID, 
              label: `${control.mitigationID} - ${control.mitigationDescription}` 
            }))}
            value={formData.relatedControlIds || []}
            onChange={(value) => setFormData(prev => ({ ...prev, relatedControlIds: value }))}
            placeholder="Select related controls"
          />
          <p className="mt-1 text-xs text-slate-500">
            Changes to controls will update relationships in the Excel file
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isLoading || !formData.riskCategory || !formData.riskDescription || (formData.proposedOversightOwnership?.length || 0) === 0}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </Modal>
  );
};