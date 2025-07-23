const ApiError = require('../errors/ApiError.cjs');
const { ErrorCodes } = require('../errors/errorCodes.cjs');
const { validateControlId } = require('../utils/idGenerator.cjs');

class ControlService {
  constructor(persistenceProvider) {
    this.persistence = persistenceProvider;
  }
  
  async getAllControls(options = {}) {
    const { filters, pagination, sort } = options;
    const allControls = await this.persistence.getAllControls();
    
    // Apply filters
    let filteredControls = this.applyFilters(allControls, filters);
    
    // Apply sorting
    if (sort) {
      filteredControls = this.applySorting(filteredControls, sort);
    }
    
    // Apply pagination
    const { page = 1, limit = 20 } = pagination || {};
    const paginatedControls = this.applyPagination(filteredControls, { page, limit });
    
    return {
      controls: paginatedControls,
      total: filteredControls.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(filteredControls.length / limit)
    };
  }
  
  async getControlById(id) {
    return await this.persistence.getControlById(id);
  }
  
  async createControl(controlData) {
    // Validate required fields
    if (!controlData.mitigationID) {
      throw new ApiError(400, ErrorCodes.MISSING_REQUIRED_FIELD, { 
        field: 'mitigationID',
        requiredFields: 'mitigationID, mitigationDescription, category'
      });
    }
    
    if (!controlData.mitigationDescription) {
      throw new ApiError(400, ErrorCodes.MISSING_REQUIRED_FIELD, { 
        field: 'mitigationDescription',
        requiredFields: 'mitigationID, mitigationDescription, category'
      });
    }
    
    // Validate control ID format
    try {
      validateControlId(controlData.mitigationID);
    } catch (error) {
      throw new ApiError(400, ErrorCodes.INVALID_CONTROL_PATTERN, {
        id: controlData.mitigationID
      });
    }
    
    // Check for duplicates
    try {
      const existing = await this.persistence.getControlById(controlData.mitigationID);
      if (existing) {
        throw new ApiError(422, ErrorCodes.DUPLICATE_CONTROL_ID, { 
          id: controlData.mitigationID 
        });
      }
    } catch (error) {
      if (error.code !== 'CONTROL_NOT_FOUND') {
        throw error;
      }
    }
    
    // Set defaults
    const newControl = {
      ...controlData,
      implementationStatus: controlData.implementationStatus || 'Not Started',
      effectiveness: controlData.effectiveness || 'Not Assessed',
      implementationNotes: controlData.implementationNotes || '',
      compliance: {
        cfrPart11Annex11: '',
        hipaaSafeguard: '',
        gdprArticle: '',
        euAiActArticle: '',
        nist80053: '',
        soc2TSC: '',
        ...controlData.compliance
      },
      relatedRiskIds: controlData.relatedRiskIds || []
    };
    
    return await this.persistence.createControl(newControl);
  }
  
  async updateControl(id, controlData) {
    // Ensure control exists
    await this.getControlById(id);
    
    // Don't allow changing the control ID
    if (controlData.mitigationID && controlData.mitigationID !== id) {
      throw new ApiError(400, ErrorCodes.INVALID_CONTROL_DATA, {
        details: 'Cannot change control ID'
      });
    }
    
    return await this.persistence.updateControl(id, controlData);
  }
  
  async deleteControl(id) {
    // This will handle relationship cleanup in the persistence layer
    return await this.persistence.deleteControl(id);
  }
  
  // Helper methods
  applyFilters(controls, filters) {
    if (!filters) return controls;
    
    return controls.filter(control => {
      if (filters.category && control.category !== filters.category) return false;
      if (filters.implementationStatus && control.implementationStatus !== filters.implementationStatus) return false;
      if (filters.effectiveness && control.effectiveness !== filters.effectiveness) return false;
      if (filters.hasRisks !== undefined) {
        const hasRisks = control.relatedRiskIds && control.relatedRiskIds.length > 0;
        if (filters.hasRisks !== hasRisks) return false;
      }
      if (filters.compliance) {
        // Check if control has any compliance mapping for the specified framework
        const hasCompliance = control.compliance && control.compliance[filters.compliance];
        if (!hasCompliance) return false;
      }
      return true;
    });
  }
  
  applySorting(controls, sort) {
    const field = sort.startsWith('-') ? sort.slice(1) : sort;
    const direction = sort.startsWith('-') ? -1 : 1;
    
    return [...controls].sort((a, b) => {
      const aValue = this.getSortValue(a, field);
      const bValue = this.getSortValue(b, field);
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string') {
        return aValue.localeCompare(bValue) * direction;
      }
      
      return (aValue < bValue ? -1 : 1) * direction;
    });
  }
  
  applyPagination(controls, { page, limit }) {
    const start = (page - 1) * limit;
    const end = start + limit;
    return controls.slice(start, end);
  }
  
  getSortValue(control, field) {
    switch (field) {
      case 'mitigationID':
        return control.mitigationID;
      case 'category':
        return control.category;
      case 'implementationStatus':
        return control.implementationStatus;
      case 'effectiveness':
        return control.effectiveness;
      case 'riskCount':
        return control.relatedRiskIds?.length || 0;
      default:
        return control[field];
    }
  }
  
  // Business logic methods
  async getControlsByCategory() {
    const allControls = await this.persistence.getAllControls();
    const byCategory = {};
    
    allControls.forEach(control => {
      if (!byCategory[control.category]) {
        byCategory[control.category] = [];
      }
      byCategory[control.category].push(control);
    });
    
    return byCategory;
  }
  
  async getControlsWithoutRisks() {
    const allControls = await this.persistence.getAllControls();
    return allControls.filter(control => 
      !control.relatedRiskIds || control.relatedRiskIds.length === 0
    );
  }
  
  async getControlStatistics() {
    const allControls = await this.persistence.getAllControls();
    
    const stats = {
      total: allControls.length,
      byCategory: {},
      byImplementationStatus: {
        'Implemented': 0,
        'In Progress': 0,
        'Planned': 0,
        'Not Started': 0
      },
      byEffectiveness: {
        'High': 0,
        'Medium': 0,
        'Low': 0,
        'Not Assessed': 0
      },
      withRisks: 0,
      withoutRisks: 0,
      withCompliance: {
        cfrPart11Annex11: 0,
        hipaaSafeguard: 0,
        gdprArticle: 0,
        euAiActArticle: 0,
        nist80053: 0,
        soc2TSC: 0
      }
    };
    
    allControls.forEach(control => {
      // By category
      if (!stats.byCategory[control.category]) {
        stats.byCategory[control.category] = 0;
      }
      stats.byCategory[control.category]++;
      
      // By implementation status
      if (stats.byImplementationStatus[control.implementationStatus] !== undefined) {
        stats.byImplementationStatus[control.implementationStatus]++;
      }
      
      // By effectiveness
      if (stats.byEffectiveness[control.effectiveness] !== undefined) {
        stats.byEffectiveness[control.effectiveness]++;
      }
      
      // With/without risks
      if (control.relatedRiskIds && control.relatedRiskIds.length > 0) {
        stats.withRisks++;
      } else {
        stats.withoutRisks++;
      }
      
      // Compliance mappings
      if (control.compliance) {
        Object.keys(stats.withCompliance).forEach(framework => {
          if (control.compliance[framework]) {
            stats.withCompliance[framework]++;
          }
        });
      }
    });
    
    return stats;
  }
  
  async getControlEffectivenessReport() {
    const allControls = await this.persistence.getAllControls();
    const allRisks = await this.persistence.getAllRisks();
    
    const report = {
      totalControls: allControls.length,
      totalRisks: allRisks.length,
      controlsByEffectiveness: {},
      averageRisksPerControl: 0,
      averageControlsPerRisk: 0,
      unmitigatedRisks: []
    };
    
    // Group controls by effectiveness
    allControls.forEach(control => {
      const effectiveness = control.effectiveness || 'Not Assessed';
      if (!report.controlsByEffectiveness[effectiveness]) {
        report.controlsByEffectiveness[effectiveness] = {
          count: 0,
          controls: [],
          totalRisksCovered: 0
        };
      }
      
      report.controlsByEffectiveness[effectiveness].count++;
      report.controlsByEffectiveness[effectiveness].controls.push(control.mitigationID);
      report.controlsByEffectiveness[effectiveness].totalRisksCovered += 
        control.relatedRiskIds?.length || 0;
    });
    
    // Calculate averages
    const totalRiskRelationships = allControls.reduce((sum, control) => 
      sum + (control.relatedRiskIds?.length || 0), 0
    );
    
    report.averageRisksPerControl = allControls.length > 0 ? 
      Math.round(totalRiskRelationships / allControls.length * 10) / 10 : 0;
    
    const risksWithControls = allRisks.filter(risk => 
      risk.relatedControlIds && risk.relatedControlIds.length > 0
    );
    
    report.averageControlsPerRisk = risksWithControls.length > 0 ?
      Math.round(risksWithControls.reduce((sum, risk) => 
        sum + risk.relatedControlIds.length, 0
      ) / risksWithControls.length * 10) / 10 : 0;
    
    // Find unmitigated risks
    report.unmitigatedRisks = allRisks
      .filter(risk => !risk.relatedControlIds || risk.relatedControlIds.length === 0)
      .map(risk => ({ id: risk.id, name: risk.risk, category: risk.riskCategory }));
    
    return report;
  }
  
  async cleanupDuplicates() {
    console.log('[ControlService] Starting duplicate cleanup...');
    
    // Get current data from persistence provider
    const currentData = await this.persistence.getData();
    const { buffer } = currentData;
    
    // Use the cleanupDuplicateControls utility
    const { cleanupDuplicateControls } = require('../utils/cleanupDuplicates.cjs');
    const cleanupResult = await cleanupDuplicateControls(buffer);
    
    // Check if any changes were made
    if (cleanupResult.removedCount === 0) {
      console.log('[ControlService] No duplicates found to remove');
      return {
        success: true,
        message: 'No duplicate controls found',
        duplicatesRemoved: 0,
        removedIds: []
      };
    }
    
    // Save the cleaned data back to Google Drive
    console.log(`[ControlService] Saving cleaned data to Google Drive (removed ${cleanupResult.removedCount} duplicates)...`);
    await this.persistence.uploadFile(cleanupResult.buffer);
    
    // Get updated data to verify
    const updatedData = await this.persistence.getData();
    const previousCount = currentData.controls.length;
    const newCount = updatedData.controls.length;
    
    console.log(`[ControlService] Cleanup complete. Controls: ${previousCount} → ${newCount}`);
    
    return {
      success: true,
      message: 'Duplicate controls removed successfully',
      duplicatesRemoved: cleanupResult.removedCount,
      removedIds: cleanupResult.removedIds,
      previousCount,
      newCount,
      controlIds: updatedData.controls.map(c => c.mitigationID).sort()
    };
  }
}

module.exports = ControlService;