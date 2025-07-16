import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { MultiSelect } from '../components/ui/MultiSelect';
import { Download, Plus, Save, X } from 'lucide-react';
import { useRiskStore } from '../store';
import { RISK_OWNERS } from '../constants/riskOwners';
import { getRiskLevelCategory } from '../utils/dataTransformers';
import type { CreateRiskInput, RiskCategory, RiskLikelihood, RiskImpact } from '../types';

export const SimpleRiskMatrixView: React.FC = () => {
  const { risks, loadRisks, createRisk, updateRisk } = useRiskStore();
  const [editedRisks, setEditedRisks] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddRiskModal, setShowAddRiskModal] = useState(false);
  const [newRisk, setNewRisk] = useState({
    category: '' as RiskCategory,
    name: '',
    description: '',
    initialLikelihood: 3 as RiskLikelihood,
    initialImpact: 3 as RiskImpact,
    residualLikelihood: 2 as RiskLikelihood,
    residualImpact: 2 as RiskImpact,
    agreedMitigation: '',
    proposedOversightOwnership: [] as string[],
    proposedSupport: [] as string[],
    notes: ''
  });

  useEffect(() => {
    loadRisks();
  }, [loadRisks]);
  


  // Handle cell edit
  const handleCellEdit = (riskId: string, field: string, value: string) => {
    setEditedRisks(prev => ({
      ...prev,
      [riskId]: {
        ...prev[riskId],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  // Apply all changes
  const applyChanges = async () => {
    for (const [riskId, changes] of Object.entries(editedRisks)) {
      const risk = risks.find(r => r.id === riskId);
      if (!risk) continue;
      
      // Prepare the update object with proper structure
      const updateData: any = { id: riskId };
      
      // Basic fields
      if (changes.riskCategory !== undefined) updateData.riskCategory = changes.riskCategory;
      if (changes.risk !== undefined) updateData.risk = changes.risk;
      if (changes.riskDescription !== undefined) updateData.riskDescription = changes.riskDescription;
      if (changes.agreedMitigation !== undefined) updateData.agreedMitigation = changes.agreedMitigation;
      if (changes.notes !== undefined) updateData.notes = changes.notes;
      
      // Handle scoring updates
      if (changes.initialLikelihood !== undefined || changes.initialImpact !== undefined) {
        const likelihood = Number(changes.initialLikelihood ?? risk.initialScoring.likelihood);
        const impact = Number(changes.initialImpact ?? risk.initialScoring.impact);
        updateData.initialScoring = {
          likelihood: likelihood as RiskLikelihood,
          impact: impact as RiskImpact,
          riskLevel: likelihood * impact,
          riskLevelCategory: getRiskLevelCategory(likelihood * impact)
        };
      }
      
      if (changes.residualLikelihood !== undefined || changes.residualImpact !== undefined) {
        const likelihood = Number(changes.residualLikelihood ?? risk.residualScoring.likelihood);
        const impact = Number(changes.residualImpact ?? risk.residualScoring.impact);
        updateData.residualScoring = {
          likelihood: likelihood as RiskLikelihood,
          impact: impact as RiskImpact,
          riskLevel: likelihood * impact,
          riskLevelCategory: getRiskLevelCategory(likelihood * impact)
        };
      }
      
      await updateRisk(updateData);
    }
    setEditedRisks({});
    setHasChanges(false);
    alert('Changes applied successfully!');
  };

  // Discard changes
  const discardChanges = () => {
    if (window.confirm('Are you sure you want to discard all changes?')) {
      setEditedRisks({});
      setHasChanges(false);
    }
  };

  // Handle new risk creation
  const handleAddRisk = async () => {
    try {
      const riskInput: CreateRiskInput = {
        riskCategory: newRisk.category,
        risk: newRisk.name,
        riskDescription: newRisk.description,
        initialScoring: {
          likelihood: newRisk.initialLikelihood,
          impact: newRisk.initialImpact,
          riskLevel: newRisk.initialLikelihood * newRisk.initialImpact,
          riskLevelCategory: getRiskLevelCategory(newRisk.initialLikelihood * newRisk.initialImpact)
        },
        residualScoring: {
          likelihood: newRisk.residualLikelihood,
          impact: newRisk.residualImpact,
          riskLevel: newRisk.residualLikelihood * newRisk.residualImpact,
          riskLevelCategory: getRiskLevelCategory(newRisk.residualLikelihood * newRisk.residualImpact)
        },
        exampleMitigations: '',
        agreedMitigation: newRisk.agreedMitigation,
        proposedOversightOwnership: newRisk.proposedOversightOwnership,
        proposedSupport: newRisk.proposedSupport,
        notes: newRisk.notes
      };
      
      await createRisk(riskInput);
      setShowAddRiskModal(false);
      // Reset form
      setNewRisk({
        category: '' as RiskCategory,
        name: '',
        description: '',
        initialLikelihood: 3 as RiskLikelihood,
        initialImpact: 3 as RiskImpact,
        residualLikelihood: 2 as RiskLikelihood,
        residualImpact: 2 as RiskImpact,
        agreedMitigation: '',
        proposedOversightOwnership: [],
        proposedSupport: [],
        notes: ''
      });
      alert('Risk added successfully!');
    } catch (error) {
      alert('Failed to add risk. Please check all required fields.');
    }
  };

  const riskCategories: RiskCategory[] = [
    'Behavioral Risks',
    'Transparency Risks',
    'Security and Data Risks',
    'Other Risks',
    'Business/Cost Related Risks',
    'AI Human Impact Risks'
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Risk Matrix (Simple View)</h1>
            <p className="mt-1 text-sm text-slate-600">
              Edit risks directly in the table. Changes are applied when you click "Apply Changes" - {risks.length} risks found
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setShowAddRiskModal(true)}
            >
              Add Risk
            </Button>
            {hasChanges && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={applyChanges}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Apply Changes ({Object.keys(editedRisks).length})</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={discardChanges}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  <span>Discard Changes</span>
                </Button>
              </>
            )}
            <Button
              variant="secondary"
              size="sm"
              icon={<Download className="h-4 w-4" />}
            >
              Export CSV
            </Button>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="mt-4 flex items-center space-x-6">
          <div className="text-sm text-slate-600">
            <span className="font-medium">Total Risks:</span> {risks.length}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="default" className="bg-red-100 text-red-800">
              Critical: {risks.filter(r => r.residualScoring.riskLevelCategory === 'Critical').length}
            </Badge>
            <Badge variant="default" className="bg-orange-100 text-orange-800">
              High: {risks.filter(r => r.residualScoring.riskLevelCategory === 'High').length}
            </Badge>
            <Badge variant="default" className="bg-yellow-100 text-yellow-800">
              Medium: {risks.filter(r => r.residualScoring.riskLevelCategory === 'Medium').length}
            </Badge>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Low: {risks.filter(r => r.residualScoring.riskLevelCategory === 'Low').length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Simple Table */}
      <div className="flex-1 p-6 bg-slate-50 overflow-auto">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="min-w-[120px] px-2 py-3 text-left text-xs font-medium text-slate-900">Category</th>
                  <th className="min-w-[180px] px-2 py-3 text-left text-xs font-medium text-slate-900">Risk</th>
                  <th className="min-w-[250px] px-2 py-3 text-left text-xs font-medium text-slate-900">Description</th>
                  <th className="w-12 px-1 py-3 text-center text-xs font-medium text-slate-900">Init L</th>
                  <th className="w-12 px-1 py-3 text-center text-xs font-medium text-slate-900">Init I</th>
                  <th className="w-16 px-1 py-3 text-center text-xs font-medium text-slate-900">Level</th>
                  <th className="w-12 px-1 py-3 text-center text-xs font-medium text-slate-900">Res L</th>
                  <th className="w-12 px-1 py-3 text-center text-xs font-medium text-slate-900">Res I</th>
                  <th className="min-w-[300px] px-2 py-3 text-left text-xs font-medium text-slate-900">Agreed Mitigation</th>
                  <th className="min-w-[200px] px-2 py-3 text-left text-xs font-medium text-slate-900">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {risks.map((risk) => {
                  const isEdited = editedRisks[risk.id];
                  
                  const currentData = {
                    riskCategory: editedRisks[risk.id]?.riskCategory ?? risk.riskCategory,
                    risk: editedRisks[risk.id]?.risk ?? risk.risk,
                    riskDescription: editedRisks[risk.id]?.riskDescription ?? risk.riskDescription,
                    initialLikelihood: editedRisks[risk.id]?.initialLikelihood ?? risk.initialScoring?.likelihood ?? 3,
                    initialImpact: editedRisks[risk.id]?.initialImpact ?? risk.initialScoring?.impact ?? 3,
                    residualLikelihood: editedRisks[risk.id]?.residualLikelihood ?? risk.residualScoring?.likelihood ?? 2,
                    residualImpact: editedRisks[risk.id]?.residualImpact ?? risk.residualScoring?.impact ?? 2,
                    agreedMitigation: editedRisks[risk.id]?.agreedMitigation ?? risk.agreedMitigation,
                    notes: editedRisks[risk.id]?.notes ?? risk.notes
                  };
                  
                  
                  return (
                    <tr key={risk.id} className={`hover:bg-slate-50 ${isEdited ? 'bg-blue-50' : ''}`}>
                      <td className="px-2 py-3">
                        <select
                          value={currentData.riskCategory}
                          onChange={(e) => handleCellEdit(risk.id, 'riskCategory', e.target.value)}
                          className="w-full text-xs text-slate-900 bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-accent/20 rounded p-1"
                        >
                          {riskCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-3">
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          className="text-xs font-medium text-slate-900 whitespace-normal break-words min-h-[30px] p-1 rounded focus:outline-none focus:ring-2 focus:ring-accent/20 focus:bg-white"
                          onBlur={(e) => handleCellEdit(risk.id, 'risk', e.currentTarget.textContent || '')}
                          dangerouslySetInnerHTML={{ __html: currentData.risk }}
                        />
                      </td>
                      <td className="px-2 py-3">
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          className="text-xs text-slate-700 whitespace-normal break-words min-h-[40px] p-1 rounded focus:outline-none focus:ring-2 focus:ring-accent/20 focus:bg-white"
                          onBlur={(e) => handleCellEdit(risk.id, 'riskDescription', e.currentTarget.textContent || '')}
                          dangerouslySetInnerHTML={{ __html: currentData.riskDescription }}
                        />
                      </td>
                      <td className="px-1 py-3">
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={currentData.initialLikelihood || ''}
                          onChange={(e) => handleCellEdit(risk.id, 'initialLikelihood', e.target.value)}
                          className="w-full text-xs text-center text-slate-900 bg-white border border-slate-300 rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                          style={{ minWidth: '40px' }}
                        />
                      </td>
                      <td className="px-1 py-3">
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={currentData.initialImpact || ''}
                          onChange={(e) => handleCellEdit(risk.id, 'initialImpact', e.target.value)}
                          className="w-full text-xs text-center text-slate-900 bg-white border border-slate-300 rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                          style={{ minWidth: '40px' }}
                        />
                      </td>
                      <td className="px-2 py-3 text-xs text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getRiskLevelCategory((currentData.initialLikelihood || 3) * (currentData.initialImpact || 3)) === 'Critical' ? 'bg-red-100 text-red-800' :
                          getRiskLevelCategory((currentData.initialLikelihood || 3) * (currentData.initialImpact || 3)) === 'High' ? 'bg-orange-100 text-orange-800' :
                          getRiskLevelCategory((currentData.initialLikelihood || 3) * (currentData.initialImpact || 3)) === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {getRiskLevelCategory((currentData.initialLikelihood || 3) * (currentData.initialImpact || 3))}
                        </span>
                      </td>
                      <td className="px-1 py-3">
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={currentData.residualLikelihood || ''}
                          onChange={(e) => handleCellEdit(risk.id, 'residualLikelihood', e.target.value)}
                          className="w-full text-xs text-center text-slate-900 bg-white border border-slate-300 rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                          style={{ minWidth: '40px' }}
                        />
                      </td>
                      <td className="px-1 py-3">
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={currentData.residualImpact || ''}
                          onChange={(e) => handleCellEdit(risk.id, 'residualImpact', e.target.value)}
                          className="w-full text-xs text-center text-slate-900 bg-white border border-slate-300 rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                          style={{ minWidth: '40px' }}
                        />
                      </td>
                      <td className="px-2 py-3">
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          className="text-xs text-slate-700 whitespace-normal break-words min-h-[40px] p-1 rounded focus:outline-none focus:ring-2 focus:ring-accent/20 focus:bg-white"
                          onBlur={(e) => handleCellEdit(risk.id, 'agreedMitigation', e.currentTarget.textContent || '')}
                          dangerouslySetInnerHTML={{ __html: currentData.agreedMitigation }}
                        />
                      </td>
                      <td className="px-2 py-3">
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          className="text-xs text-slate-700 whitespace-normal break-words min-h-[40px] p-1 rounded focus:outline-none focus:ring-2 focus:ring-accent/20 focus:bg-white"
                          onBlur={(e) => handleCellEdit(risk.id, 'notes', e.currentTarget.textContent || '')}
                          dangerouslySetInnerHTML={{ __html: currentData.notes }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Risk Modal */}
      <Modal
        isOpen={showAddRiskModal}
        onClose={() => setShowAddRiskModal(false)}
        title="Add New Risk"
        size="xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Risk Category <span className="text-red-500">*</span>
            </label>
            <Select
              value={newRisk.category}
              onChange={(value) => setNewRisk(prev => ({ ...prev, category: value as RiskCategory }))}
              options={riskCategories.map(cat => ({ value: cat, label: cat }))}
              placeholder="Select category"
            />
          </div>

          {/* Risk Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Risk Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newRisk.name}
              onChange={(e) => setNewRisk(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
              placeholder="Enter risk name"
            />
          </div>

          {/* Risk Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Risk Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={newRisk.description}
              onChange={(e) => setNewRisk(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
              rows={3}
              placeholder="Describe the risk"
            />
          </div>

          {/* Initial Risk Assessment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Likelihood (1-5)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={newRisk.initialLikelihood}
                onChange={(e) => setNewRisk(prev => ({ ...prev, initialLikelihood: Number(e.target.value) as RiskLikelihood }))}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600">{newRisk.initialLikelihood}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Impact (1-5)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={newRisk.initialImpact}
                onChange={(e) => setNewRisk(prev => ({ ...prev, initialImpact: Number(e.target.value) as RiskImpact }))}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600">{newRisk.initialImpact}</div>
            </div>
          </div>

          {/* Agreed Mitigation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agreed Mitigation
            </label>
            <textarea
              value={newRisk.agreedMitigation}
              onChange={(e) => setNewRisk(prev => ({ ...prev, agreedMitigation: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
              rows={3}
              placeholder="Describe the agreed mitigation strategy"
            />
          </div>

          {/* Residual Risk Assessment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Residual Likelihood (1-5)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={newRisk.residualLikelihood}
                onChange={(e) => setNewRisk(prev => ({ ...prev, residualLikelihood: Number(e.target.value) as RiskLikelihood }))}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600">{newRisk.residualLikelihood}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Residual Impact (1-5)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={newRisk.residualImpact}
                onChange={(e) => setNewRisk(prev => ({ ...prev, residualImpact: Number(e.target.value) as RiskImpact }))}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600">{newRisk.residualImpact}</div>
            </div>
          </div>

          {/* Ownership */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proposed Oversight Ownership <span className="text-red-500">*</span>
            </label>
            <MultiSelect
              options={RISK_OWNERS.map(owner => ({ value: owner, label: owner }))}
              value={newRisk.proposedOversightOwnership}
              onChange={(value) => setNewRisk(prev => ({ ...prev, proposedOversightOwnership: value }))}
              placeholder="Select owners"
            />
          </div>

          {/* Support */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proposed Support
            </label>
            <MultiSelect
              options={RISK_OWNERS.map(owner => ({ value: owner, label: owner }))}
              value={newRisk.proposedSupport}
              onChange={(value) => setNewRisk(prev => ({ ...prev, proposedSupport: value }))}
              placeholder="Select support teams"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={newRisk.notes}
              onChange={(e) => setNewRisk(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
              rows={2}
              placeholder="Additional notes"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setShowAddRiskModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddRisk}
            disabled={!newRisk.category || !newRisk.name || !newRisk.description || newRisk.proposedOversightOwnership.length === 0}
          >
            Add Risk
          </Button>
        </div>
      </Modal>
    </div>
  );
};