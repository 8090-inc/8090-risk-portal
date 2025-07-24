import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { MultiSelect } from '../components/ui/MultiSelect';
import { 
  Download, 
  Plus, 
  Save, 
  X, 
  AlertTriangle, 
  Brain, 
  Shield, 
  Eye, 
  DollarSign, 
  Users,
  ChevronDown,
  ChevronRight,
  Minimize2,
  Maximize2,
  Check
} from 'lucide-react';
import { useRiskStore, useControlStore } from '../store';
import { RISK_OWNERS } from '../constants/riskOwners';
import { getRiskLevelCategory } from '../utils/dataTransformers';
import { exportRisksToCSV } from '../utils/exportUtils';
import type { CreateRiskInput, RiskCategory, RiskLikelihood, RiskImpact, ControlCategory, Control, CreateControlInput, Risk } from '../types';

// Risk level color mapping with gradients
const getRiskLevelColor = (level: string) => {
  switch (level) {
    case 'Critical': return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
    case 'High': return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
    case 'Medium': return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
    case 'Low': return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
    default: return 'bg-gradient-to-r from-slate-400 to-slate-500 text-white';
  }
};

// Get risk level background color for cells (not currently used, but kept for potential future use)

// Category icons
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Behavioral Risks': return <Brain className="h-3 w-3" />;
    case 'Security and Data Risks': return <Shield className="h-3 w-3" />;
    case 'Transparency Risks': return <Eye className="h-3 w-3" />;
    case 'Business/Cost Related Risks': return <DollarSign className="h-3 w-3" />;
    case 'AI Human Impact Risks': return <Users className="h-3 w-3" />;
    default: return null;
  }
};

// Risk Matrix Mini Component
const RiskMatrixMini: React.FC<{ likelihood: number; impact: number }> = ({ likelihood, impact }) => {
  return (
    <div className="inline-grid grid-cols-5 gap-px w-12 h-12 bg-slate-200 p-0.5 rounded">
      {Array.from({ length: 25 }, (_, i) => {
        const row = Math.floor(i / 5);
        const col = i % 5;
        const cellL = 5 - row;
        const cellI = col + 1;
        const isActive = cellL === likelihood && cellI === impact;
        const level = cellL * cellI;
        
        let bgColor = 'bg-slate-100';
        if (level >= 20) bgColor = 'bg-red-400';
        else if (level >= 12) bgColor = 'bg-orange-400';
        else if (level >= 8) bgColor = 'bg-yellow-400';
        else if (level >= 4) bgColor = 'bg-green-400';
        
        return (
          <div
            key={i}
            className={`${bgColor} ${isActive ? 'ring-2 ring-slate-900 ring-inset' : ''}`}
            title={`L${cellL} x I${cellI} = ${level}`}
          />
        );
      })}
    </div>
  );
};

// Progress bar component
const RiskReductionBar: React.FC<{ percentage: number }> = ({ percentage }) => {
  const getColor = () => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-slate-200 rounded-full h-1.5">
        <div 
          className={`h-1.5 rounded-full transition-all ${getColor()}`}
          style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
        />
      </div>
      <span className="text-xs font-mono font-bold">{percentage}%</span>
    </div>
  );
};

// Compact number input
const CompactNumberInput: React.FC<{
  value: number;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
}> = ({ value, onChange }) => {
  // Ensure we always have a string value for the input
  const displayValue = value !== undefined && value !== null ? String(value) : '';
  
  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={(e) => {
        const newValue = e.target.value;
        // Only allow numbers 1-5 or empty
        if (newValue === '' || (/^[1-5]$/.test(newValue))) {
          onChange(newValue);
        }
      }}
      className="w-10 h-7 px-1 text-sm font-bold text-center text-slate-900 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="-"
    />
  );
};

// Expandable text cell
const ExpandableTextCell: React.FC<{
  value: string;
  onChange: (value: string) => void;
  maxLines?: number;
}> = ({ value, onChange, maxLines = 2 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full text-xs border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded px-1 py-0.5 resize-none transition-all ${
          isExpanded || isFocused ? '' : 'line-clamp-2'
        }`}
        rows={isExpanded || isFocused ? 4 : maxLines}
        style={{ minHeight: isExpanded || isFocused ? '60px' : '28px' }}
      />
      {!isFocused && value.length > 100 && (
        <button
          className="absolute bottom-0 right-0 text-[10px] text-blue-600 hover:text-blue-800 bg-white px-1"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Less' : 'More'}
        </button>
      )}
    </div>
  );
};

export const SimpleRiskMatrixView: React.FC = () => {
  const { risks, loadRisks, createRisk, updateRisk, deleteRisk } = useRiskStore();
  const { controls, loadControls, createControl } = useControlStore();
  const [editedRisks, setEditedRisks] = useState<Record<string, Partial<Risk>>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddRiskModal, setShowAddRiskModal] = useState(false);
  const [showAddControlModal, setShowAddControlModal] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [selectedRisks, setSelectedRisks] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  
  const [newControl, setNewControl] = useState({
    mitigationDescription: '',
    category: '' as ControlCategory,
    compliance: {
      cfrPart11Annex11: '',
      hipaaSafeguard: '',
      gdprArticle: '',
      euAiActArticle: '',
      nist80053: '',
      soc2TSC: ''
    },
    implementationStatus: 'Not Started' as Control['implementationStatus'],
    effectiveness: 'Not Assessed' as Control['effectiveness'],
    relatedRiskIds: [] as string[]
  });
  
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
    notes: '',
    relatedControlIds: [] as string[]
  });

  useEffect(() => {
    loadRisks();
    loadControls();
  }, [loadRisks, loadControls]);

  // Toggle category collapse
  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Handle risk selection
  const handleRiskSelect = (riskId: string) => {
    setSelectedRisks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(riskId)) {
        newSet.delete(riskId);
      } else {
        newSet.add(riskId);
      }
      return newSet;
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRisks.size === risks.length) {
      setSelectedRisks(new Set());
    } else {
      setSelectedRisks(new Set(risks.map(r => r.id)));
    }
  };

  // Handle delete selected
  const handleDeleteSelected = async () => {
    if (selectedRisks.size === 0) return;
    
    setShowDeleteConfirm(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    try {
      for (const riskId of selectedRisks) {
        await deleteRisk(riskId);
      }
      setSelectedRisks(new Set());
      setShowDeleteConfirm(false);
      alert(`Successfully deleted ${selectedRisks.size} risk(s)`);
    } catch {
      alert('Failed to delete some risks. Please try again.');
    }
  };

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
      const updateData: Risk = { ...risk };
      
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
      
      // Handle arrays
      if (changes.proposedOversightOwnership !== undefined) {
        updateData.proposedOversightOwnership = changes.proposedOversightOwnership.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      if (changes.proposedSupport !== undefined) {
        updateData.proposedSupport = changes.proposedSupport.split(',').map((s: string) => s.trim()).filter(Boolean);
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

  // Export to CSV
  const handleExportCSV = () => {
    exportRisksToCSV(risks);
  };

  // Handle new risk creation
  const handleAddRisk = async () => {
    try {
      const initialRiskLevel = newRisk.initialLikelihood * newRisk.initialImpact;
      const residualRiskLevel = newRisk.residualLikelihood * newRisk.residualImpact;
      const riskReduction = initialRiskLevel - residualRiskLevel;
      const riskReductionPercentage = initialRiskLevel > 0 
        ? Math.round((riskReduction / initialRiskLevel) * 100)
        : 0;
      
      const riskInput: CreateRiskInput = {
        riskCategory: newRisk.category,
        risk: newRisk.name,
        riskDescription: newRisk.description,
        initialScoring: {
          likelihood: newRisk.initialLikelihood,
          impact: newRisk.initialImpact,
          riskLevel: initialRiskLevel,
          riskLevelCategory: getRiskLevelCategory(initialRiskLevel)
        },
        residualScoring: {
          likelihood: newRisk.residualLikelihood,
          impact: newRisk.residualImpact,
          riskLevel: residualRiskLevel,
          riskLevelCategory: getRiskLevelCategory(residualRiskLevel)
        },
        exampleMitigations: '',
        agreedMitigation: newRisk.agreedMitigation,
        proposedOversightOwnership: newRisk.proposedOversightOwnership,
        proposedSupport: newRisk.proposedSupport,
        notes: newRisk.notes,
        riskReductionPercentage,
        relatedControlIds: newRisk.relatedControlIds
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
        notes: '',
        relatedControlIds: []
      });
      alert('Risk added successfully!');
    } catch {
      alert('Failed to add risk. Please check all required fields.');
    }
  };

  // Handle new control creation
  // Debug: Log risks when modal opens
  useEffect(() => {
    if (showAddControlModal) {
      console.log('Add Control Modal opened, available risks:', risks.length);
      console.log('First few risks:', risks.slice(0, 3).map(r => ({ id: r.id, name: r.riskName || r.risk })));
    }
  }, [showAddControlModal, risks]);

  const handleAddControl = async () => {
    try {
      // Generate control ID based on category
      const categoryPrefix = {
        'Accuracy & Judgment': 'ACC',
        'Security & Data Privacy': 'SEC',
        'Audit & Traceability': 'LOG',
        'Governance & Compliance': 'GOV'
      };
      
      const prefix = categoryPrefix[newControl.category];
      if (!prefix) {
        alert('Please select a valid category');
        return;
      }
      
      // Find next available ID number
      const existingNumbers = controls
        .filter(c => c.mitigationID.startsWith(prefix + '-'))
        .map(c => parseInt(c.mitigationID.split('-')[1]))
        .filter(n => !isNaN(n));
      const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
      const mitigationID = `${prefix}-${nextNumber.toString().padStart(2, '0')}`;
      
      const controlInput: CreateControlInput = {
        mitigationID,
        mitigationDescription: newControl.mitigationDescription,
        category: newControl.category,
        compliance: newControl.compliance,
        implementationStatus: newControl.implementationStatus,
        effectiveness: newControl.effectiveness
      };
      
      await createControl(controlInput);
      setShowAddControlModal(false);
      // Reset form
      setNewControl({
        mitigationDescription: '',
        category: '' as ControlCategory,
        compliance: {
          cfrPart11Annex11: '',
          hipaaSafeguard: '',
          gdprArticle: '',
          euAiActArticle: '',
          nist80053: '',
          soc2TSC: ''
        },
        implementationStatus: 'Not Started' as Control['implementationStatus'],
        effectiveness: 'Not Assessed' as Control['effectiveness'],
        relatedRiskIds: []
      });
      alert('Control added successfully!');
    } catch {
      alert('Failed to add control. Please check all required fields.');
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

  // Group risks by category
  const risksByCategory = risks.reduce((acc, risk) => {
    if (!acc[risk.riskCategory]) {
      acc[risk.riskCategory] = [];
    }
    acc[risk.riskCategory].push(risk);
    return acc;
  }, {} as Record<string, Risk[]>);

  // Table row class based on compact mode
  const rowClass = isCompactMode ? 'h-8' : 'h-10';
  const cellPadding = isCompactMode ? 'px-1 py-0.5' : 'px-2 py-1';

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Risk Matrix</h1>
            <p className="mt-1 text-sm text-slate-600">
              Professional risk assessment and management - {risks.length} risks across {Object.keys(risksByCategory).length} categories
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCompactMode(!isCompactMode)}
              icon={isCompactMode ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              title={isCompactMode ? "Normal view" : "Compact view"}
            >
              {isCompactMode ? 'Normal' : 'Compact'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setShowAddRiskModal(true)}
            >
              Add Risk
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setShowAddControlModal(true)}
            >
              Add Control
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
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
            {selectedRisks.size > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteSelected}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                <span>Delete Selected ({selectedRisks.size})</span>
              </Button>
            )}
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="mt-2 flex items-center space-x-4">
          <div className="text-xs text-slate-600">
            <span className="font-medium">Total:</span> {risks.length}
          </div>
          <div className="flex items-center space-x-1">
            <Badge variant="default" className={`${getRiskLevelColor('Critical')} px-2 py-0.5`}>
              Critical: {risks.filter(r => r.residualScoring.riskLevelCategory === 'Critical').length}
            </Badge>
            <Badge variant="default" className={`${getRiskLevelColor('High')} px-2 py-0.5`}>
              High: {risks.filter(r => r.residualScoring.riskLevelCategory === 'High').length}
            </Badge>
            <Badge variant="default" className={`${getRiskLevelColor('Medium')} px-2 py-0.5`}>
              Medium: {risks.filter(r => r.residualScoring.riskLevelCategory === 'Medium').length}
            </Badge>
            <Badge variant="default" className={`${getRiskLevelColor('Low')} px-2 py-0.5`}>
              Low: {risks.filter(r => r.residualScoring.riskLevelCategory === 'Low').length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Enhanced Table with Fixed Headers and Frozen Columns */}
      <div className="flex-1 overflow-hidden bg-slate-50 min-h-0">
        <div ref={tableRef} className="h-full overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-20">
              <tr>
                {/* Checkbox column */}
                <th className="bg-slate-100 border-b-2 border-slate-300"></th>
                {/* Risk Info Group */}
                <th colSpan={3} className="bg-slate-100 border-b-2 border-slate-300 text-xs font-bold text-slate-700 px-2 py-1">
                  Risk Information
                </th>
                {/* Initial Risk Group */}
                <th colSpan={4} className="bg-blue-50 border-b-2 border-blue-200 text-xs font-bold text-blue-700 px-2 py-1">
                  Initial Risk Assessment
                </th>
                {/* Residual Risk Group */}
                <th colSpan={5} className="bg-green-50 border-b-2 border-green-200 text-xs font-bold text-green-700 px-2 py-1">
                  Residual Risk Assessment
                </th>
                {/* Management Group */}
                <th colSpan={4} className="bg-yellow-50 border-b-2 border-yellow-200 text-xs font-bold text-yellow-700 px-2 py-1">
                  Risk Management & Mitigation
                </th>
              </tr>
              <tr className="text-[11px]">
                {/* Checkbox column */}
                <th className="sticky left-0 z-10 bg-slate-100 border-r border-slate-300 px-2 py-2 text-center font-medium text-slate-900 w-10">
                  <input
                    type="checkbox"
                    checked={selectedRisks.size === risks.length && risks.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300"
                  />
                </th>
                {/* Frozen columns */}
                <th className="sticky left-10 z-10 bg-slate-100 border-r border-slate-300 px-2 py-2 text-left font-medium text-slate-900 w-32">Category</th>
                <th className="sticky left-42 z-10 bg-slate-100 border-r border-slate-300 px-2 py-2 text-left font-medium text-slate-900 w-40">Risk</th>
                <th className="sticky left-82 z-10 bg-slate-100 border-r-2 border-slate-400 px-2 py-2 text-left font-medium text-slate-900 min-w-[300px]">Description</th>
                
                {/* Initial Risk */}
                <th className="bg-blue-50 px-1 py-2 text-center font-medium text-slate-900 w-12">L</th>
                <th className="bg-blue-50 px-1 py-2 text-center font-medium text-slate-900 w-12">I</th>
                <th className="bg-blue-50 px-1 py-2 text-center font-medium text-slate-900 w-16">Matrix</th>
                <th className="bg-blue-50 border-r border-blue-200 px-1 py-2 text-center font-medium text-slate-900 w-20">Level</th>
                
                {/* Residual Risk */}
                <th className="bg-green-50 px-1 py-2 text-center font-medium text-slate-900 w-12">L</th>
                <th className="bg-green-50 px-1 py-2 text-center font-medium text-slate-900 w-12">I</th>
                <th className="bg-green-50 px-1 py-2 text-center font-medium text-slate-900 w-16">Matrix</th>
                <th className="bg-green-50 px-1 py-2 text-center font-medium text-slate-900 w-20">Level</th>
                <th className="bg-green-50 border-r border-green-200 px-1 py-2 text-center font-medium text-slate-900 w-24">Reduction</th>
                
                {/* Management */}
                <th className="bg-yellow-50 px-2 py-2 text-left font-medium text-slate-900 min-w-[350px]">Agreed Mitigation</th>
                <th className="bg-yellow-50 px-2 py-2 text-left font-medium text-slate-900 w-36">Ownership</th>
                <th className="bg-yellow-50 px-2 py-2 text-left font-medium text-slate-900 w-36">Support</th>
                <th className="bg-yellow-50 px-2 py-2 text-left font-medium text-slate-900 w-48">Notes</th>
              </tr>
            </thead>
            <tbody className="text-[11px]">
              {Object.entries(risksByCategory).map(([category, categoryRisks]) => {
                const isCollapsed = collapsedCategories.has(category);
                const criticalCount = categoryRisks.filter(r => r.residualScoring.riskLevelCategory === 'Critical').length;
                
                return (
                  <React.Fragment key={category}>
                    {/* Category Header Row */}
                    <tr 
                      className="bg-slate-200 hover:bg-slate-300 cursor-pointer"
                      onClick={() => toggleCategory(category)}
                    >
                      <td colSpan={17} className="px-2 py-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            <span className="font-bold flex items-center gap-1">
                              {getCategoryIcon(category)}
                              {category}
                            </span>
                            <Badge variant="default" className="text-[10px] px-1.5 py-0">
                              {categoryRisks.length} risks
                            </Badge>
                            {criticalCount > 0 && (
                              <Badge variant="default" className="bg-red-100 text-red-800 text-[10px] px-1.5 py-0 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {criticalCount} critical
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Category Risks */}
                    {!isCollapsed && categoryRisks.map((risk, index) => {
                      const isEdited = editedRisks[risk.id];
                      const isEvenRow = index % 2 === 0;
                      
                      const isSelected = selectedRisks.has(risk.id);
                      const currentData = {
                        riskCategory: editedRisks[risk.id]?.riskCategory ?? risk.riskCategory,
                        risk: editedRisks[risk.id]?.risk ?? risk.risk,
                        riskDescription: editedRisks[risk.id]?.riskDescription ?? risk.riskDescription,
                        initialLikelihood: editedRisks[risk.id]?.initialLikelihood ?? risk.initialScoring?.likelihood,
                        initialImpact: editedRisks[risk.id]?.initialImpact ?? risk.initialScoring?.impact,
                        residualLikelihood: editedRisks[risk.id]?.residualLikelihood ?? risk.residualScoring?.likelihood,
                        residualImpact: editedRisks[risk.id]?.residualImpact ?? risk.residualScoring?.impact,
                        agreedMitigation: editedRisks[risk.id]?.agreedMitigation ?? risk.agreedMitigation,
                        proposedOversightOwnership: editedRisks[risk.id]?.proposedOversightOwnership ?? risk.proposedOversightOwnership?.join(', '),
                        proposedSupport: editedRisks[risk.id]?.proposedSupport ?? risk.proposedSupport?.join(', '),
                        notes: editedRisks[risk.id]?.notes ?? risk.notes
                      };
                      
                      const initialLevel = Number(currentData.initialLikelihood) * Number(currentData.initialImpact);
                      const residualLevel = Number(currentData.residualLikelihood) * Number(currentData.residualImpact);
                      const riskReduction = initialLevel > 0 ? Math.round(((initialLevel - residualLevel) / initialLevel) * 100) : 0;
                      
                      return (
                        <tr 
                          key={risk.id} 
                          className={`
                            ${isEvenRow ? 'bg-white' : 'bg-slate-50'} 
                            ${isEdited ? 'ring-2 ring-blue-400 ring-inset' : ''} 
                            hover:bg-slate-100 transition-colors
                            ${rowClass}
                          `}
                        >
                          {/* Checkbox column */}
                          <td className={`sticky left-0 z-10 ${isEvenRow ? 'bg-white' : 'bg-slate-50'} border-r border-slate-300 ${cellPadding} text-center`}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleRiskSelect(risk.id)}
                              className="rounded border-slate-300"
                            />
                          </td>
                          {/* Frozen columns */}
                          <td className={`sticky left-10 z-10 ${isEvenRow ? 'bg-white' : 'bg-slate-50'} border-r border-slate-300 ${cellPadding}`}>
                            <div className="flex items-center gap-1">
                              {getCategoryIcon(currentData.riskCategory)}
                              <select
                                value={currentData.riskCategory}
                                onChange={(e) => handleCellEdit(risk.id, 'riskCategory', e.target.value)}
                                className="flex-1 text-xs border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded px-0.5"
                              >
                                {riskCategories.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>
                          </td>
                          
                          <td className={`sticky left-42 z-10 ${isEvenRow ? 'bg-white' : 'bg-slate-50'} border-r border-slate-300 ${cellPadding}`}>
                            <input
                              type="text"
                              value={currentData.risk}
                              onChange={(e) => handleCellEdit(risk.id, 'risk', e.target.value)}
                              className="w-full text-xs border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded px-0.5"
                            />
                          </td>
                          
                          <td className={`sticky left-82 z-10 ${isEvenRow ? 'bg-white' : 'bg-slate-50'} border-r-2 border-slate-400 ${cellPadding}`}>
                            <ExpandableTextCell
                              value={currentData.riskDescription}
                              onChange={(value) => handleCellEdit(risk.id, 'riskDescription', value)}
                            />
                          </td>
                          
                          {/* Initial Risk */}
                          <td className={`bg-blue-50/50 ${cellPadding} text-center`}>
                            <CompactNumberInput
                              value={currentData.initialLikelihood || 0}
                              onChange={(value) => handleCellEdit(risk.id, 'initialLikelihood', value)}
                            />
                          </td>
                          
                          <td className={`bg-blue-50/50 ${cellPadding} text-center`}>
                            <CompactNumberInput
                              value={currentData.initialImpact || 0}
                              onChange={(value) => handleCellEdit(risk.id, 'initialImpact', value)}
                            />
                          </td>
                          
                          <td className={`bg-blue-50/50 ${cellPadding} text-center`}>
                            <RiskMatrixMini 
                              likelihood={Number(currentData.initialLikelihood)} 
                              impact={Number(currentData.initialImpact)} 
                            />
                          </td>
                          
                          <td className={`bg-blue-50/50 border-r border-blue-200 ${cellPadding} text-center`}>
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${getRiskLevelColor(getRiskLevelCategory(initialLevel))}`}>
                              <span className="font-mono">{initialLevel}</span>
                              {initialLevel >= 20 && <AlertTriangle className="h-3 w-3" />}
                            </div>
                          </td>
                          
                          {/* Residual Risk */}
                          <td className={`bg-green-50/50 ${cellPadding} text-center`}>
                            <CompactNumberInput
                              value={currentData.residualLikelihood || 0}
                              onChange={(value) => handleCellEdit(risk.id, 'residualLikelihood', value)}
                            />
                          </td>
                          
                          <td className={`bg-green-50/50 ${cellPadding} text-center`}>
                            <CompactNumberInput
                              value={currentData.residualImpact || 0}
                              onChange={(value) => handleCellEdit(risk.id, 'residualImpact', value)}
                            />
                          </td>
                          
                          <td className={`bg-green-50/50 ${cellPadding} text-center`}>
                            <RiskMatrixMini 
                              likelihood={Number(currentData.residualLikelihood)} 
                              impact={Number(currentData.residualImpact)} 
                            />
                          </td>
                          
                          <td className={`bg-green-50/50 ${cellPadding} text-center`}>
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${getRiskLevelCategory(residualLevel)}`}>
                              <span className="font-mono">{residualLevel}</span>
                              {residualLevel <= 4 && <Check className="h-3 w-3" />}
                            </div>
                          </td>
                          
                          <td className={`bg-green-50/50 border-r border-green-200 ${cellPadding} text-center`}>
                            <RiskReductionBar percentage={riskReduction} />
                          </td>
                          
                          {/* Management */}
                          <td className={`bg-yellow-50/50 ${cellPadding}`}>
                            <ExpandableTextCell
                              value={currentData.agreedMitigation}
                              onChange={(value) => handleCellEdit(risk.id, 'agreedMitigation', value)}
                            />
                          </td>
                          
                          <td className={`bg-yellow-50/50 ${cellPadding}`}>
                            <input
                              type="text"
                              value={currentData.proposedOversightOwnership}
                              onChange={(e) => handleCellEdit(risk.id, 'proposedOversightOwnership', e.target.value)}
                              className="w-full text-xs border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded px-0.5"
                              placeholder="Owners..."
                            />
                          </td>
                          
                          <td className={`bg-yellow-50/50 ${cellPadding}`}>
                            <input
                              type="text"
                              value={currentData.proposedSupport}
                              onChange={(e) => handleCellEdit(risk.id, 'proposedSupport', e.target.value)}
                              className="w-full text-xs border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded px-0.5"
                              placeholder="Support..."
                            />
                          </td>
                          
                          <td className={`bg-yellow-50/50 ${cellPadding}`}>
                            <ExpandableTextCell
                              value={currentData.notes}
                              onChange={(value) => handleCellEdit(risk.id, 'notes', value)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
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

          {/* Related Controls */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Related Controls
            </label>
            <MultiSelect
              options={controls.map(control => ({ 
                value: control.mitigationID, 
                label: `${control.mitigationID} - ${control.mitigationDescription}` 
              }))}
              value={newRisk.relatedControlIds}
              onChange={(value) => setNewRisk(prev => ({ ...prev, relatedControlIds: value }))}
              placeholder="Select related controls"
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

      {/* Add Control Modal */}
      <Modal
        isOpen={showAddControlModal}
        onClose={() => setShowAddControlModal(false)}
        title="Add New Control"
        size="xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Control Category <span className="text-red-500">*</span>
            </label>
            <Select
              value={newControl.category}
              onChange={(value) => setNewControl(prev => ({ ...prev, category: value as ControlCategory }))}
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
              value={newControl.mitigationDescription}
              onChange={(e) => setNewControl(prev => ({ ...prev, mitigationDescription: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
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
              value={newControl.implementationStatus}
              onChange={(value) => setNewControl(prev => ({ ...prev, implementationStatus: value as Control['implementationStatus'] }))}
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
              value={newControl.effectiveness}
              onChange={(value) => setNewControl(prev => ({ ...prev, effectiveness: value as Control['effectiveness'] }))}
              options={[
                { value: 'High', label: 'High' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Low', label: 'Low' },
                { value: 'Not Assessed', label: 'Not Assessed' }
              ]}
              placeholder="Select effectiveness"
            />
          </div>

          {/* Compliance Mappings */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Compliance Mappings
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">21 CFR Part 11 / Annex 11</label>
                <input
                  type="text"
                  value={newControl.compliance.cfrPart11Annex11}
                  onChange={(e) => setNewControl(prev => ({ 
                    ...prev, 
                    compliance: { ...prev.compliance, cfrPart11Annex11: e.target.value }
                  }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent/20"
                  placeholder="e.g., 11.10(a)"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">HIPAA Safeguard</label>
                <input
                  type="text"
                  value={newControl.compliance.hipaaSafeguard}
                  onChange={(e) => setNewControl(prev => ({ 
                    ...prev, 
                    compliance: { ...prev.compliance, hipaaSafeguard: e.target.value }
                  }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent/20"
                  placeholder="e.g., Technical"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">GDPR Article</label>
                <input
                  type="text"
                  value={newControl.compliance.gdprArticle}
                  onChange={(e) => setNewControl(prev => ({ 
                    ...prev, 
                    compliance: { ...prev.compliance, gdprArticle: e.target.value }
                  }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent/20"
                  placeholder="e.g., Art. 32"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">EU AI Act Article</label>
                <input
                  type="text"
                  value={newControl.compliance.euAiActArticle}
                  onChange={(e) => setNewControl(prev => ({ 
                    ...prev, 
                    compliance: { ...prev.compliance, euAiActArticle: e.target.value }
                  }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent/20"
                  placeholder="e.g., Art. 15"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">NIST 800-53</label>
                <input
                  type="text"
                  value={newControl.compliance.nist80053}
                  onChange={(e) => setNewControl(prev => ({ 
                    ...prev, 
                    compliance: { ...prev.compliance, nist80053: e.target.value }
                  }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent/20"
                  placeholder="e.g., AU - Audit"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">SOC 2 TSC</label>
                <input
                  type="text"
                  value={newControl.compliance.soc2TSC}
                  onChange={(e) => setNewControl(prev => ({ 
                    ...prev, 
                    compliance: { ...prev.compliance, soc2TSC: e.target.value }
                  }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent/20"
                  placeholder="e.g., CC1.1"
                />
              </div>
            </div>
          </div>

          {/* Related Risks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Related Risks
            </label>
            <MultiSelect
              options={risks.map(risk => ({ 
                value: risk.id, 
                label: `${risk.risk} (${risk.riskCategory})` 
              }))}
              value={newControl.relatedRiskIds}
              onChange={(value) => setNewControl(prev => ({ ...prev, relatedRiskIds: value }))}
              placeholder="Select related risks"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setShowAddControlModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddControl}
            disabled={!newControl.category || !newControl.mitigationDescription}
          >
            Add Control
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete {selectedRisks.size} selected risk{selectedRisks.size > 1 ? 's' : ''}?
          </p>
          <p className="text-sm text-gray-600">
            This action cannot be undone. The risks will be permanently removed from the Excel file in Google Drive.
          </p>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
          >
            Delete {selectedRisks.size} Risk{selectedRisks.size > 1 ? 's' : ''}
          </Button>
        </div>
      </Modal>
    </div>
  );
};