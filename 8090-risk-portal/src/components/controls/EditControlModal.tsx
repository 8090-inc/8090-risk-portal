import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import type { Control, ControlCategory } from '../../types';

interface EditControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  control: Control;
  onSave: (updatedControl: Partial<Control>) => Promise<void>;
}

export const EditControlModal: React.FC<EditControlModalProps> = ({
  isOpen,
  onClose,
  control,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<Control>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data when modal opens or control changes
  useEffect(() => {
    if (isOpen && control) {
      setFormData({
        mitigationID: control.mitigationID,
        mitigationDescription: control.mitigationDescription,
        category: control.category,
        implementationStatus: control.implementationStatus,
        effectiveness: control.effectiveness,
        implementationNotes: control.implementationNotes || '',
        compliance: { ...control.compliance }
      });
    }
  }, [isOpen, control]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save control:', error);
      // Error will be handled by the store/parent component
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateCompliance = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      compliance: {
        cfrPart11Annex11: '',
        hipaaSafeguard: '',
        gdprArticle: '',
        euAiActArticle: '',
        nist80053: '',
        soc2TSC: '',
        ...prev.compliance,
        [field]: value
      }
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Control: ${control?.mitigationID}`}
      size="xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
        {/* Control ID (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Control ID
          </label>
          <input
            type="text"
            value={formData.mitigationID || ''}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Control Category <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.category || ''}
            onChange={(value) => updateFormData('category', value as ControlCategory)}
            options={[
              { value: 'Accuracy & Judgment', label: 'Accuracy & Judgment' },
              { value: 'Security & Data Privacy', label: 'Security & Data Privacy' },
              { value: 'Audit & Traceability', label: 'Audit & Traceability' },
              { value: 'Governance & Compliance', label: 'Governance & Compliance' }
            ]}
            placeholder="Select category"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Control Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.mitigationDescription || ''}
            onChange={(e) => updateFormData('mitigationDescription', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-8090-primary/20"
            rows={3}
            placeholder="Describe the control measure"
          />
        </div>

        {/* Implementation Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Implementation Status
          </label>
          <Select
            value={formData.implementationStatus || ''}
            onChange={(value) => updateFormData('implementationStatus', value)}
            options={[
              { value: 'Implemented', label: 'Implemented' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Planned', label: 'Planned' },
              { value: 'Not Started', label: 'Not Started' }
            ]}
            placeholder="Select status"
          />
        </div>

        {/* Effectiveness */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Effectiveness
          </label>
          <Select
            value={formData.effectiveness || ''}
            onChange={(value) => updateFormData('effectiveness', value)}
            options={[
              { value: 'High', label: 'High' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low', label: 'Low' },
              { value: 'Not Assessed', label: 'Not Assessed' }
            ]}
            placeholder="Select effectiveness"
          />
        </div>

        {/* Implementation Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Implementation Notes
          </label>
          <textarea
            value={formData.implementationNotes || ''}
            onChange={(e) => updateFormData('implementationNotes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-8090-primary/20"
            rows={2}
            placeholder="Add notes about implementation"
          />
        </div>

        {/* Compliance Mappings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Compliance Mappings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                21 CFR Part 11 / Annex 11
              </label>
              <input
                type="text"
                value={formData.compliance?.cfrPart11Annex11 || ''}
                onChange={(e) => updateCompliance('cfrPart11Annex11', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-8090-primary/20"
                placeholder="e.g., 11.10(a), 11.50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HIPAA Safeguard
              </label>
              <input
                type="text"
                value={formData.compliance?.hipaaSafeguard || ''}
                onChange={(e) => updateCompliance('hipaaSafeguard', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-8090-primary/20"
                placeholder="e.g., § 164.308(a)(1)(i)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GDPR Article
              </label>
              <input
                type="text"
                value={formData.compliance?.gdprArticle || ''}
                onChange={(e) => updateCompliance('gdprArticle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-8090-primary/20"
                placeholder="e.g., Art. 22"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                EU AI Act Article
              </label>
              <input
                type="text"
                value={formData.compliance?.euAiActArticle || ''}
                onChange={(e) => updateCompliance('euAiActArticle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-8090-primary/20"
                placeholder="e.g., Art. 14"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIST 800-53
              </label>
              <input
                type="text"
                value={formData.compliance?.nist80053 || ''}
                onChange={(e) => updateCompliance('nist80053', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-8090-primary/20"
                placeholder="e.g., IA-2, IA-4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SOC 2 TSC
              </label>
              <input
                type="text"
                value={formData.compliance?.soc2TSC || ''}
                onChange={(e) => updateCompliance('soc2TSC', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-8090-primary/20"
                placeholder="e.g., PI 1.2, PI 1.4"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isLoading || !formData.mitigationDescription || !formData.category}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
