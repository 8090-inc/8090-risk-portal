/**
 * Google Drive implementation of IPersistenceProvider
 * Manages all data operations with the Excel file in Google Drive
 */

const IPersistenceProvider = require('./IPersistenceProvider.cjs');
const ApiError = require('../errors/ApiError.cjs');
const { ErrorCodes } = require('../errors/errorCodes.cjs');
const { 
  parseRisksFromWorkbook,
  parseControlsFromWorkbook,
  parseRelationshipsFromWorkbook,
  parseUseCasesFromWorkbook,
  addRiskToWorkbook,
  updateRiskInWorkbook,
  deleteRiskFromWorkbook,
  addControlToWorkbook,
  updateControlInWorkbook,
  deleteControlFromWorkbook,
  addUseCaseToWorkbook,
  updateUseCaseInWorkbook,
  deleteUseCaseFromWorkbook,
  addRelationshipToWorkbook,
  removeRelationshipFromWorkbook,
  removeAllRelationshipsForRisk,
  removeAllRelationshipsForControl,
  removeAllRelationshipsForUseCase
} = require('../utils/excelParser.cjs');

class GoogleDrivePersistenceProvider extends IPersistenceProvider {
  constructor(driveService, fileId) {
    super();
    console.log('[GoogleDrivePersistenceProvider] Constructor called');
    console.log(`[GoogleDrivePersistenceProvider] File ID: ${fileId}`);
    console.log(`[GoogleDrivePersistenceProvider] Drive service provided: ${!!driveService}`);
    this.driveService = driveService;
    this.fileId = fileId;
    this.cache = null;
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.transactionBuffer = null;
    this.inTransaction = false;
  }
  
  /**
   * Get data from cache or fetch from Google Drive
   */
  async getData(forceRefresh = false) {
    if (!forceRefresh && this.cache && Date.now() - this.cache.timestamp < this.cacheExpiry) {
      return this.cache.data;
    }
    
    try {
      const buffer = await this.downloadFile();
      const risks = await parseRisksFromWorkbook(buffer);
      const controls = await parseControlsFromWorkbook(buffer);
      const relationships = await parseRelationshipsFromWorkbook(buffer);
      const useCases = await parseUseCasesFromWorkbook(buffer);
      
      // Build relationships
      const data = this.buildRelationships(risks, controls, useCases, relationships);
      
      this.cache = {
        data: { ...data, buffer },
        timestamp: Date.now()
      };
      
      return this.cache.data;
    } catch (error) {
      throw new ApiError(500, ErrorCodes.EXCEL_PARSE_ERROR, { 
        details: error.message 
      });
    }
  }
  
  /**
   * Build bidirectional relationships between risks, controls, and use cases
   */
  buildRelationships(risks, controls, useCases, relationships) {
    // Build maps from relationships data
    const riskControlMap = new Map();
    const controlRiskMap = new Map();
    const useCaseRiskMap = new Map();
    const riskUseCaseMap = new Map();
    
    // Process relationships from dedicated sheet
    relationships.forEach(rel => {
      if (rel.linkType === 'UseCase-Risk') {
        // Handle use case-risk relationships
        const useCaseId = rel.controlId; // In this case, controlId is actually the use case ID
        const riskId = rel.riskId;
        
        // Add to use case → risks map
        if (!useCaseRiskMap.has(useCaseId)) {
          useCaseRiskMap.set(useCaseId, []);
        }
        if (!useCaseRiskMap.get(useCaseId).includes(riskId)) {
          useCaseRiskMap.get(useCaseId).push(riskId);
        }
        
        // Add to risk → use cases map
        if (!riskUseCaseMap.has(riskId)) {
          riskUseCaseMap.set(riskId, []);
        }
        if (!riskUseCaseMap.get(riskId).includes(useCaseId)) {
          riskUseCaseMap.get(riskId).push(useCaseId);
        }
      } else {
        // Handle control-risk relationships (existing logic)
        // Add to risk → controls map
        if (!riskControlMap.has(rel.riskId)) {
          riskControlMap.set(rel.riskId, []);
        }
        if (!riskControlMap.get(rel.riskId).includes(rel.controlId)) {
          riskControlMap.get(rel.riskId).push(rel.controlId);
        }
        
        // Add to control → risks map
        if (!controlRiskMap.has(rel.controlId)) {
          controlRiskMap.set(rel.controlId, []);
        }
        if (!controlRiskMap.get(rel.controlId).includes(rel.riskId)) {
          controlRiskMap.get(rel.controlId).push(rel.riskId);
        }
      }
    });
    
    // Apply relationships to risks
    risks.forEach(risk => {
      risk.relatedControlIds = riskControlMap.get(risk.id) || [];
      risk.relatedUseCaseIds = riskUseCaseMap.get(risk.id) || [];
    });
    
    // Apply relationships to controls
    controls.forEach(control => {
      control.relatedRiskIds = controlRiskMap.get(control.mitigationID) || [];
    });
    
    // Apply relationships to use cases
    useCases.forEach(useCase => {
      useCase.relatedRiskIds = useCaseRiskMap.get(useCase.id) || [];
    });
    
    return { risks, controls, useCases, relationships };
  }
  
  /**
   * Download file from Google Drive
   */
  async downloadFile() {
    try {
      // Get file metadata to check type
      const fileMetadata = await this.driveService.files.get({
        fileId: this.fileId,
        fields: 'mimeType',
        supportsAllDrives: true
      });
      
      let buffer;
      
      if (fileMetadata.data.mimeType === 'application/vnd.google-apps.spreadsheet') {
        // It's a Google Sheets file, use export
        const response = await this.driveService.files.export({
          fileId: this.fileId,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }, {
          responseType: 'arraybuffer'
        });
        buffer = Buffer.from(response.data);
      } else {
        // It's already an Excel file, download directly
        const response = await this.driveService.files.get({
          fileId: this.fileId,
          alt: 'media',
          supportsAllDrives: true
        }, {
          responseType: 'arraybuffer'
        });
        buffer = Buffer.from(response.data);
      }
      
      return buffer;
    } catch (error) {
      throw new ApiError(500, ErrorCodes.GOOGLE_DRIVE_ERROR, {
        details: error.message
      });
    }
  }
  
  /**
   * Upload file to Google Drive
   */
  async uploadFile(buffer) {
    console.log('[GoogleDrivePersistenceProvider] uploadFile called');
    console.log(`[GoogleDrivePersistenceProvider] File ID: ${this.fileId}`);
    console.log(`[GoogleDrivePersistenceProvider] Buffer size: ${buffer ? buffer.length : 0} bytes`);
    console.log(`[GoogleDrivePersistenceProvider] In transaction: ${this.inTransaction}`);
    
    try {
      const media = {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: buffer
      };
      
      console.log('[GoogleDrivePersistenceProvider] Calling Google Drive API files.update...');
      const result = await this.driveService.files.update({
        fileId: this.fileId,
        media: media,
        supportsAllDrives: true
      });
      console.log('[GoogleDrivePersistenceProvider] Google Drive API response:', result.status);
      
      // Invalidate cache after upload
      this.cache = null;
      console.log('[GoogleDrivePersistenceProvider] Cache invalidated after successful upload');
    } catch (error) {
      console.error('[GoogleDrivePersistenceProvider] Upload error:', error.message);
      console.error('[GoogleDrivePersistenceProvider] Error details:', error);
      throw new ApiError(500, ErrorCodes.GOOGLE_DRIVE_ERROR, {
        details: error.message
      });
    }
  }
  
  // Risk operations
  async getAllRisks(options = {}) {
    const data = await this.getData();
    return data.risks;
  }
  
  async getRiskById(id) {
    const data = await this.getData();
    const risk = data.risks.find(r => r.id === id);
    
    if (!risk) {
      throw new ApiError(404, ErrorCodes.RISK_NOT_FOUND, { id });
    }
    
    return risk;
  }
  
  async createRisk(risk) {
    console.log('[GoogleDrivePersistenceProvider] createRisk called with:', JSON.stringify(risk, null, 2));
    const data = await this.getData();
    
    // Check for duplicate
    const existing = data.risks.find(r => r.id === risk.id);
    if (existing) {
      console.log('[GoogleDrivePersistenceProvider] Duplicate risk found:', risk.id);
      throw new ApiError(422, ErrorCodes.DUPLICATE_RISK_NAME, {
        name: risk.risk
      });
    }
    
    // If in transaction, work with transaction buffer
    const buffer = this.inTransaction ? this.transactionBuffer : data.buffer;
    console.log(`[GoogleDrivePersistenceProvider] Using ${this.inTransaction ? 'transaction' : 'data'} buffer`);
    
    const updatedBuffer = await addRiskToWorkbook(buffer, risk);
    console.log('[GoogleDrivePersistenceProvider] Risk added to workbook buffer');
    
    if (this.inTransaction) {
      console.log('[GoogleDrivePersistenceProvider] In transaction - buffering changes');
      this.transactionBuffer = updatedBuffer;
    } else {
      console.log('[GoogleDrivePersistenceProvider] Not in transaction - uploading to Google Drive');
      await this.uploadFile(updatedBuffer);
      // Update cache
      data.risks.push(risk);
      data.buffer = updatedBuffer;
      console.log('[GoogleDrivePersistenceProvider] Cache updated with new risk');
    }
    
    return risk;
  }
  
  async updateRisk(id, riskUpdates) {
    const data = await this.getData();
    
    // Ensure risk exists
    const existingIndex = data.risks.findIndex(r => r.id === id);
    if (existingIndex === -1) {
      throw new ApiError(404, ErrorCodes.RISK_NOT_FOUND, { id });
    }
    
    // Merge updates with existing risk
    const existingRisk = data.risks[existingIndex];
    const updatedRisk = {
      ...existingRisk,
      ...riskUpdates,
      id: existingRisk.id, // Preserve ID
      lastUpdated: new Date().toISOString()
    };
    
    // Handle nested objects
    if (riskUpdates.initialScoring) {
      updatedRisk.initialScoring = {
        ...existingRisk.initialScoring,
        ...riskUpdates.initialScoring
      };
    }
    
    if (riskUpdates.residualScoring) {
      updatedRisk.residualScoring = {
        ...existingRisk.residualScoring,
        ...riskUpdates.residualScoring
      };
    }
    
    const buffer = this.inTransaction ? this.transactionBuffer : data.buffer;
    const updatedBuffer = await updateRiskInWorkbook(buffer, id, updatedRisk);
    
    if (this.inTransaction) {
      this.transactionBuffer = updatedBuffer;
    } else {
      await this.uploadFile(updatedBuffer);
      // Update cache
      data.risks[existingIndex] = updatedRisk;
      data.buffer = updatedBuffer;
    }
    
    return updatedRisk;
  }
  
  async deleteRisk(id) {
    const data = await this.getData();
    const risk = data.risks.find(r => r.id === id);
    
    if (!risk) {
      throw new ApiError(404, ErrorCodes.RISK_NOT_FOUND, { id });
    }
    
    let buffer = this.inTransaction ? this.transactionBuffer : data.buffer;
    
    // Remove all relationships for this risk
    buffer = await removeAllRelationshipsForRisk(buffer, id);
    
    // Delete the risk
    const updatedBuffer = await deleteRiskFromWorkbook(buffer, id);
    
    if (this.inTransaction) {
      this.transactionBuffer = updatedBuffer;
    } else {
      await this.uploadFile(updatedBuffer);
      // Update cache
      data.risks = data.risks.filter(r => r.id !== id);
      data.relationships = data.relationships.filter(rel => rel.riskId !== id);
      data.buffer = updatedBuffer;
    }
  }
  
  // Control operations
  async getAllControls(options = {}) {
    const data = await this.getData();
    return data.controls;
  }
  
  async getControlById(id) {
    const data = await this.getData();
    const control = data.controls.find(c => c.mitigationID === id);
    
    if (!control) {
      throw new ApiError(404, ErrorCodes.CONTROL_NOT_FOUND, { id });
    }
    
    return control;
  }
  
  async createControl(control) {
    const data = await this.getData();
    
    // Check for duplicate
    const existing = data.controls.find(c => c.mitigationID === control.mitigationID);
    if (existing) {
      throw new ApiError(422, {
        code: 'DUPLICATE_CONTROL_ID',
        message: `Control with ID "${control.mitigationID}" already exists`,
        suggestion: 'Use a different control ID or update the existing control'
      });
    }
    
    const buffer = this.inTransaction ? this.transactionBuffer : data.buffer;
    const updatedBuffer = await addControlToWorkbook(buffer, control);
    
    if (this.inTransaction) {
      this.transactionBuffer = updatedBuffer;
    } else {
      await this.uploadFile(updatedBuffer);
      // Update cache
      data.controls.push(control);
      data.buffer = updatedBuffer;
    }
    
    return control;
  }
  
  async updateControl(id, controlUpdates) {
    const data = await this.getData();
    
    // Ensure control exists
    const existingIndex = data.controls.findIndex(c => c.mitigationID === id);
    if (existingIndex === -1) {
      throw new ApiError(404, ErrorCodes.CONTROL_NOT_FOUND, { id });
    }
    
    // Merge updates with existing control
    const existingControl = data.controls[existingIndex];
    const updatedControl = {
      ...existingControl,
      ...controlUpdates,
      mitigationID: existingControl.mitigationID, // Preserve ID
      lastUpdated: new Date().toISOString()
    };
    
    // Handle nested compliance object
    if (controlUpdates.compliance) {
      updatedControl.compliance = {
        ...existingControl.compliance,
        ...controlUpdates.compliance
      };
    }
    
    const buffer = this.inTransaction ? this.transactionBuffer : data.buffer;
    const updatedBuffer = await updateControlInWorkbook(buffer, id, updatedControl);
    
    if (this.inTransaction) {
      this.transactionBuffer = updatedBuffer;
    } else {
      await this.uploadFile(updatedBuffer);
      // Update cache
      data.controls[existingIndex] = updatedControl;
      data.buffer = updatedBuffer;
    }
    
    return updatedControl;
  }
  
  async deleteControl(id) {
    const data = await this.getData();
    const control = data.controls.find(c => c.mitigationID === id);
    
    if (!control) {
      throw new ApiError(404, ErrorCodes.CONTROL_NOT_FOUND, { id });
    }
    
    let buffer = this.inTransaction ? this.transactionBuffer : data.buffer;
    
    // Remove all relationships for this control
    buffer = await removeAllRelationshipsForControl(buffer, id);
    
    // Delete the control
    const updatedBuffer = await deleteControlFromWorkbook(buffer, id);
    
    if (this.inTransaction) {
      this.transactionBuffer = updatedBuffer;
    } else {
      await this.uploadFile(updatedBuffer);
      // Update cache
      data.controls = data.controls.filter(c => c.mitigationID !== id);
      data.relationships = data.relationships.filter(rel => rel.controlId !== id);
      data.buffer = updatedBuffer;
    }
  }
  
  // Use case operations
  async getAllUseCases(options = {}) {
    const data = await this.getData();
    return data.useCases;
  }
  
  async getUseCaseById(id) {
    const data = await this.getData();
    const useCase = data.useCases.find(uc => uc.id === id);
    
    if (!useCase) {
      throw new ApiError(404, ErrorCodes.USE_CASE_NOT_FOUND, { id });
    }
    
    return useCase;
  }
  
  async createUseCase(useCase) {
    console.log('[GoogleDrivePersistenceProvider] createUseCase called with:', JSON.stringify(useCase, null, 2));
    const data = await this.getData();
    
    // Check for duplicate
    const existing = data.useCases.find(uc => uc.id === useCase.id);
    if (existing) {
      console.log('[GoogleDrivePersistenceProvider] Duplicate use case found:', useCase.id);
      throw new ApiError(422, ErrorCodes.DUPLICATE_USE_CASE_ID, { id: useCase.id });
    }
    
    // If in transaction, work with transaction buffer
    const buffer = this.inTransaction ? this.transactionBuffer : data.buffer;
    console.log(`[GoogleDrivePersistenceProvider] Using ${this.inTransaction ? 'transaction' : 'data'} buffer`);
    
    const updatedBuffer = await addUseCaseToWorkbook(buffer, useCase);
    console.log('[GoogleDrivePersistenceProvider] Use case added to workbook buffer');
    
    if (this.inTransaction) {
      console.log('[GoogleDrivePersistenceProvider] In transaction - buffering changes');
      this.transactionBuffer = updatedBuffer;
    } else {
      console.log('[GoogleDrivePersistenceProvider] Not in transaction - uploading to Google Drive');
      await this.uploadFile(updatedBuffer);
      // Update cache
      data.useCases.push(useCase);
      data.buffer = updatedBuffer;
      console.log('[GoogleDrivePersistenceProvider] Cache updated with new use case');
    }
    
    return useCase;
  }
  
  async updateUseCase(id, useCaseUpdates) {
    const data = await this.getData();
    
    // Ensure use case exists
    const existingIndex = data.useCases.findIndex(uc => uc.id === id);
    if (existingIndex === -1) {
      throw new ApiError(404, ErrorCodes.USE_CASE_NOT_FOUND, { id });
    }
    
    // Merge updates with existing use case
    const existingUseCase = data.useCases[existingIndex];
    const updatedUseCase = {
      ...existingUseCase,
      ...useCaseUpdates,
      id: existingUseCase.id, // Preserve ID
      lastUpdated: new Date().toISOString()
    };
    
    // Handle nested objects
    if (useCaseUpdates.objective) {
      updatedUseCase.objective = {
        ...existingUseCase.objective,
        ...useCaseUpdates.objective
      };
    }
    
    if (useCaseUpdates.impact) {
      updatedUseCase.impact = {
        ...existingUseCase.impact,
        ...useCaseUpdates.impact
      };
    }
    
    if (useCaseUpdates.execution) {
      updatedUseCase.execution = {
        ...existingUseCase.execution,
        ...useCaseUpdates.execution
      };
    }
    
    const buffer = this.inTransaction ? this.transactionBuffer : data.buffer;
    const updatedBuffer = await updateUseCaseInWorkbook(buffer, id, updatedUseCase);
    
    if (this.inTransaction) {
      this.transactionBuffer = updatedBuffer;
    } else {
      await this.uploadFile(updatedBuffer);
      // Update cache
      data.useCases[existingIndex] = updatedUseCase;
      data.buffer = updatedBuffer;
    }
    
    return updatedUseCase;
  }
  
  async deleteUseCase(id) {
    const data = await this.getData();
    const useCase = data.useCases.find(uc => uc.id === id);
    
    if (!useCase) {
      throw new ApiError(404, ErrorCodes.USE_CASE_NOT_FOUND, { id });
    }
    
    let buffer = this.inTransaction ? this.transactionBuffer : data.buffer;
    
    // Remove all relationships for this use case
    buffer = await removeAllRelationshipsForUseCase(buffer, id);
    
    // Delete the use case
    const updatedBuffer = await deleteUseCaseFromWorkbook(buffer, id);
    
    if (this.inTransaction) {
      this.transactionBuffer = updatedBuffer;
    } else {
      await this.uploadFile(updatedBuffer);
      // Update cache
      data.useCases = data.useCases.filter(uc => uc.id !== id);
      data.relationships = data.relationships.filter(rel => 
        !(rel.linkType === 'UseCase-Risk' && rel.controlId === id)
      );
      data.buffer = updatedBuffer;
    }
  }
  
  // Relationship operations
  async addRiskControlRelationship(riskId, controlId) {
    // Verify both exist
    const risk = await this.getRiskById(riskId);
    const control = await this.getControlById(controlId);
    const data = await this.getData();
    
    // Check if relationship already exists
    const existingRelationship = data.relationships.find(
      rel => rel.riskId === riskId && rel.controlId === controlId
    );
    
    if (existingRelationship) {
      return; // Relationship already exists
    }
    
    // Create new relationship
    const relationship = {
      controlId,
      riskId,
      linkType: 'mitigates',
      effectiveness: 'Medium',
      notes: '',
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    const buffer = this.inTransaction ? this.transactionBuffer : data.buffer;
    const updatedBuffer = await addRelationshipToWorkbook(
      buffer, 
      relationship.controlId, 
      relationship.riskId, 
      relationship.linkType, 
      relationship.effectiveness, 
      relationship.notes
    );
    
    if (this.inTransaction) {
      this.transactionBuffer = updatedBuffer;
    } else {
      await this.uploadFile(updatedBuffer);
      // Update cache
      data.relationships.push(relationship);
      if (!risk.relatedControlIds.includes(controlId)) {
        risk.relatedControlIds.push(controlId);
      }
      if (!control.relatedRiskIds.includes(riskId)) {
        control.relatedRiskIds.push(riskId);
      }
      data.buffer = updatedBuffer;
    }
  }
  
  async removeRiskControlRelationship(riskId, controlId) {
    // Verify both exist
    const risk = await this.getRiskById(riskId);
    const control = await this.getControlById(controlId);
    const data = await this.getData();
    
    const buffer = this.inTransaction ? this.transactionBuffer : data.buffer;
    const updatedBuffer = await removeRelationshipFromWorkbook(buffer, controlId, riskId);
    
    if (this.inTransaction) {
      this.transactionBuffer = updatedBuffer;
    } else {
      await this.uploadFile(updatedBuffer);
      // Update cache
      data.relationships = data.relationships.filter(
        rel => !(rel.riskId === riskId && rel.controlId === controlId)
      );
      risk.relatedControlIds = risk.relatedControlIds.filter(id => id !== controlId);
      control.relatedRiskIds = control.relatedRiskIds.filter(id => id !== riskId);
      data.buffer = updatedBuffer;
    }
  }
  
  async getControlsForRisk(riskId) {
    const risk = await this.getRiskById(riskId);
    const data = await this.getData();
    
    return data.controls.filter(c => 
      risk.relatedControlIds.includes(c.mitigationID)
    );
  }
  
  async getRisksForControl(controlId) {
    const control = await this.getControlById(controlId);
    const data = await this.getData();
    
    return data.risks.filter(r => 
      control.relatedRiskIds.includes(r.id)
    );
  }
  
  async addUseCaseRiskRelationship(useCaseId, riskId) {
    // Verify both exist
    const useCase = await this.getUseCaseById(useCaseId);
    const risk = await this.getRiskById(riskId);
    const data = await this.getData();
    
    // Check if relationship already exists
    const existingRelationship = data.relationships.find(
      rel => rel.linkType === 'UseCase-Risk' && rel.controlId === useCaseId && rel.riskId === riskId
    );
    
    if (existingRelationship) {
      return; // Relationship already exists
    }
    
    // Create new relationship
    const relationship = {
      controlId: useCaseId, // Using controlId field to store use case ID
      riskId,
      linkType: 'UseCase-Risk',
      effectiveness: '', // Not applicable for use case-risk
      notes: '',
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    const buffer = this.inTransaction ? this.transactionBuffer : data.buffer;
    const updatedBuffer = await addRelationshipToWorkbook(
      buffer, 
      relationship.controlId, 
      relationship.riskId, 
      relationship.linkType, 
      relationship.effectiveness, 
      relationship.notes
    );
    
    if (this.inTransaction) {
      this.transactionBuffer = updatedBuffer;
    } else {
      await this.uploadFile(updatedBuffer);
      // Update cache
      data.relationships.push(relationship);
      if (!useCase.relatedRiskIds.includes(riskId)) {
        useCase.relatedRiskIds.push(riskId);
      }
      if (!risk.relatedUseCaseIds) {
        risk.relatedUseCaseIds = [];
      }
      if (!risk.relatedUseCaseIds.includes(useCaseId)) {
        risk.relatedUseCaseIds.push(useCaseId);
      }
      data.buffer = updatedBuffer;
    }
  }
  
  async removeUseCaseRiskRelationship(useCaseId, riskId) {
    // Verify both exist
    const useCase = await this.getUseCaseById(useCaseId);
    const risk = await this.getRiskById(riskId);
    const data = await this.getData();
    
    const buffer = this.inTransaction ? this.transactionBuffer : data.buffer;
    const updatedBuffer = await removeRelationshipFromWorkbook(buffer, useCaseId, riskId);
    
    if (this.inTransaction) {
      this.transactionBuffer = updatedBuffer;
    } else {
      await this.uploadFile(updatedBuffer);
      // Update cache
      data.relationships = data.relationships.filter(
        rel => !(rel.linkType === 'UseCase-Risk' && rel.controlId === useCaseId && rel.riskId === riskId)
      );
      useCase.relatedRiskIds = useCase.relatedRiskIds.filter(id => id !== riskId);
      if (risk.relatedUseCaseIds) {
        risk.relatedUseCaseIds = risk.relatedUseCaseIds.filter(id => id !== useCaseId);
      }
      data.buffer = updatedBuffer;
    }
  }
  
  async getRisksForUseCase(useCaseId) {
    const useCase = await this.getUseCaseById(useCaseId);
    const data = await this.getData();
    
    return data.risks.filter(r => 
      useCase.relatedRiskIds.includes(r.id)
    );
  }
  
  async getUseCasesForRisk(riskId) {
    const risk = await this.getRiskById(riskId);
    const data = await this.getData();
    
    if (!risk.relatedUseCaseIds) {
      return [];
    }
    
    return data.useCases.filter(uc => 
      risk.relatedUseCaseIds.includes(uc.id)
    );
  }
  
  // Transaction support
  async beginTransaction() {
    if (this.inTransaction) {
      throw new Error('Transaction already in progress');
    }
    
    const data = await this.getData();
    this.transactionBuffer = data.buffer;
    this.inTransaction = true;
  }
  
  async commitTransaction() {
    if (!this.inTransaction) {
      throw new Error('No transaction in progress');
    }
    
    try {
      await this.uploadFile(this.transactionBuffer);
      this.inTransaction = false;
      this.transactionBuffer = null;
    } catch (error) {
      // Keep transaction state on error
      throw error;
    }
  }
  
  async rollbackTransaction() {
    if (!this.inTransaction) {
      throw new Error('No transaction in progress');
    }
    
    this.inTransaction = false;
    this.transactionBuffer = null;
    // Force cache refresh to get clean data
    this.cache = null;
  }
}

module.exports = GoogleDrivePersistenceProvider;