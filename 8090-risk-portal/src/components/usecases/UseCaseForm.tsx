import { useState, useEffect } from 'react';
import { Button, Input, Label, Select, Textarea } from '../ui';
import { Card } from '../ui';
import { Plus, Trash2 } from 'lucide-react';
import {
  VALID_BUSINESS_AREAS,
  VALID_AI_CATEGORIES,
  VALID_STATUSES,
  VALID_COMPLEXITIES,
  VALID_LEVELS,
  type UseCase
} from '../../types/useCase.types';

interface UseCaseFormProps {
  useCase?: UseCase;
  onSubmit: (data: Partial<UseCase>) => Promise<void>;
  onCancel: () => void;
}

export function UseCaseForm({ useCase, onSubmit, onCancel }: UseCaseFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form state
  const [formData, setFormData] = useState<Partial<UseCase>>({
    title: '',
    description: '',
    businessArea: '',
    aiCategories: [],
    objective: {
      currentState: '',
      futureState: '',
      solution: '',
      benefits: ''
    },
    impact: {
      impactPoints: [],
      costSaving: undefined,
      effortMonths: undefined
    },
    execution: {
      functionsImpacted: [],
      dataRequirements: '',
      aiComplexity: undefined,
      feasibility: undefined,
      value: undefined,
      risk: undefined
    },
    status: 'Concept',
    owner: '',
    stakeholders: [],
    notes: '',
    implementationStart: '',
    implementationEnd: ''
  });
  
  // Initialize form with existing data
  useEffect(() => {
    if (useCase) {
      setFormData(useCase);
    }
  }, [useCase]);
  
  // Handle basic field changes
  const handleFieldChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  // Handle nested object field changes
  const handleNestedFieldChange = (parent: string, field: string, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof UseCase] as Record<string, unknown> || {}),
        [field]: value
      }
    }));
  };
  
  // Handle array field changes
  const handleArrayAdd = (field: string, parent?: string) => {
    const value = prompt(`Add ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    if (value) {
      if (parent) {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...(prev[parent as keyof UseCase] as Record<string, unknown> || {}),
            [field]: [...((prev[parent as keyof UseCase] as Record<string, string[]>)?.[field] || []), value]
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [field]: [...((prev[field as keyof UseCase] as string[]) || []), value]
        }));
      }
    }
  };
  
  const handleArrayRemove = (field: string, index: number, parent?: string) => {
    if (parent) {
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof UseCase] as Record<string, unknown> || {}),
          [field]: ((prev[parent as keyof UseCase] as Record<string, string[]>)?.[field] || []).filter((_: string, i: number) => i !== index)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: ((prev[field as keyof UseCase] as string[]) || []).filter((_: string, i: number) => i !== index)
      }));
    }
  };
  
  // Handle AI category selection
  const handleAICategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      aiCategories: prev.aiCategories?.includes(category)
        ? prev.aiCategories.filter(c => c !== category)
        : [...(prev.aiCategories || []), category]
    }));
  };
  
  // Validate form
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.title && formData.title.length > 200) {
      newErrors.title = 'Title must be 200 characters or less';
    }
    
    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Description must be 2000 characters or less';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className={errors.title ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessArea">Business Area</Label>
              <Select
                value={formData.businessArea || ''}
                onChange={(value) => handleFieldChange('businessArea', value)}
                options={[
                  { value: '', label: 'Select area' },
                  ...VALID_BUSINESS_AREAS.map(area => ({
                    value: area,
                    label: area
                  }))
                ]}
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || 'Concept'}
                onChange={(value) => handleFieldChange('status', value)}
                options={VALID_STATUSES.map(status => ({
                  value: status,
                  label: status
                }))}
                disabled={loading}
              />
            </div>
          </div>
          
          <div>
            <Label>AI Categories</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {VALID_AI_CATEGORIES.map(category => (
                <label key={category} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.aiCategories?.includes(category) || false}
                    onChange={() => handleAICategoryToggle(category)}
                    disabled={loading}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Objective & Solution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Objective & Solution</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="currentState">Current State</Label>
            <Textarea
              id="currentState"
              value={formData.objective?.currentState || ''}
              onChange={(e) => handleNestedFieldChange('objective', 'currentState', e.target.value)}
              rows={2}
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="futureState">Future State</Label>
            <Textarea
              id="futureState"
              value={formData.objective?.futureState || ''}
              onChange={(e) => handleNestedFieldChange('objective', 'futureState', e.target.value)}
              rows={2}
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="solution">Solution</Label>
            <Textarea
              id="solution"
              value={formData.objective?.solution || ''}
              onChange={(e) => handleNestedFieldChange('objective', 'solution', e.target.value)}
              rows={2}
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="benefits">Benefits</Label>
            <Textarea
              id="benefits"
              value={formData.objective?.benefits || ''}
              onChange={(e) => handleNestedFieldChange('objective', 'benefits', e.target.value)}
              rows={2}
              disabled={loading}
            />
          </div>
        </div>
      </Card>
      
      {/* Impact & Metrics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Impact & Metrics</h3>
        <div className="space-y-4">
          <div>
            <Label>Impact Points</Label>
            <div className="space-y-2 mt-2">
              {formData.impact?.impactPoints?.map((point, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={point} readOnly disabled />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleArrayRemove('impactPoints', index, 'impact')}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleArrayAdd('impactPoints', 'impact')}
                disabled={loading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Impact Point
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="costSaving">Cost Saving (USD)</Label>
              <Input
                id="costSaving"
                type="number"
                value={formData.impact?.costSaving || ''}
                onChange={(e) => handleNestedFieldChange('impact', 'costSaving', e.target.value ? Number(e.target.value) : undefined)}
                min="0"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="effortMonths">Effort (Months)</Label>
              <Input
                id="effortMonths"
                type="number"
                value={formData.impact?.effortMonths || ''}
                onChange={(e) => handleNestedFieldChange('impact', 'effortMonths', e.target.value ? Number(e.target.value) : undefined)}
                min="0"
                max="120"
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </Card>
      
      {/* Execution Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Execution Details</h3>
        <div className="space-y-4">
          <div>
            <Label>Functions Impacted</Label>
            <div className="space-y-2 mt-2">
              {formData.execution?.functionsImpacted?.map((func, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={func} readOnly disabled />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleArrayRemove('functionsImpacted', index, 'execution')}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleArrayAdd('functionsImpacted', 'execution')}
                disabled={loading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Function
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="dataRequirements">Data Requirements</Label>
            <Textarea
              id="dataRequirements"
              value={formData.execution?.dataRequirements || ''}
              onChange={(e) => handleNestedFieldChange('execution', 'dataRequirements', e.target.value)}
              rows={2}
              disabled={loading}
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="aiComplexity">AI Complexity</Label>
              <Select
                value={formData.execution?.aiComplexity || ''}
                onChange={(value) => handleNestedFieldChange('execution', 'aiComplexity', value)}
                options={[
                  { value: '', label: 'Select' },
                  ...VALID_COMPLEXITIES.map(level => ({
                    value: level,
                    label: level
                  }))
                ]}
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="feasibility">Feasibility</Label>
              <Select
                value={formData.execution?.feasibility || ''}
                onChange={(value) => handleNestedFieldChange('execution', 'feasibility', value)}
                options={[
                  { value: '', label: 'Select' },
                  ...VALID_LEVELS.map(level => ({
                    value: level,
                    label: level
                  }))
                ]}
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="value">Business Value</Label>
              <Select
                value={formData.execution?.value || ''}
                onChange={(value) => handleNestedFieldChange('execution', 'value', value)}
                options={[
                  { value: '', label: 'Select' },
                  ...VALID_LEVELS.map(level => ({
                    value: level,
                    label: level
                  }))
                ]}
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="risk">Risk Level</Label>
              <Select
                value={formData.execution?.risk || ''}
                onChange={(value) => handleNestedFieldChange('execution', 'risk', value)}
                options={[
                  { value: '', label: 'Select' },
                  ...VALID_LEVELS.map(level => ({
                    value: level,
                    label: level
                  }))
                ]}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </Card>
      
      {/* Ownership & Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ownership & Timeline</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="owner">Owner</Label>
            <Input
              id="owner"
              value={formData.owner || ''}
              onChange={(e) => handleFieldChange('owner', e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div>
            <Label>Stakeholders</Label>
            <div className="space-y-2 mt-2">
              {formData.stakeholders?.map((stakeholder, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={stakeholder} readOnly disabled />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleArrayRemove('stakeholders', index)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleArrayAdd('stakeholders')}
                disabled={loading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Stakeholder
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="implementationStart">Implementation Start</Label>
              <Input
                id="implementationStart"
                type="date"
                value={formData.implementationStart || ''}
                onChange={(e) => handleFieldChange('implementationStart', e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="implementationEnd">Implementation End</Label>
              <Input
                id="implementationEnd"
                type="date"
                value={formData.implementationEnd || ''}
                onChange={(e) => handleFieldChange('implementationEnd', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>
        </div>
      </Card>
      
      {/* Form Actions */}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : (useCase ? 'Update Use Case' : 'Create Use Case')}
        </Button>
      </div>
    </form>
  );
}