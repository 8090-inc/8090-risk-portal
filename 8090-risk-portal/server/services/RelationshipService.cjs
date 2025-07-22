const ApiError = require('../errors/ApiError.cjs');
const { ErrorCodes } = require('../errors/errorCodes.cjs');

class RelationshipService {
  constructor(persistenceProvider) {
    this.persistence = persistenceProvider;
  }
  
  // Risk -> Controls relationships
  async getControlsForRisk(riskId) {
    // Verify risk exists
    const risk = await this.persistence.getRiskById(riskId);
    
    // Get all controls for this risk
    const controls = await this.persistence.getControlsForRisk(riskId);
    
    return {
      riskId: riskId,
      riskName: risk.risk,
      controls: controls,
      controlCount: controls.length
    };
  }
  
  async setControlsForRisk(riskId, controlIds) {
    // Verify risk exists
    await this.persistence.getRiskById(riskId);
    
    // Verify all controls exist
    for (const controlId of controlIds) {
      await this.persistence.getControlById(controlId);
    }
    
    // Start transaction
    const transaction = await this.persistence.beginTransaction();
    
    try {
      // Get current controls for this risk
      const currentControls = await this.persistence.getControlsForRisk(riskId);
      const currentControlIds = currentControls.map(c => c.mitigationID);
      
      // Find controls to add and remove
      const controlsToAdd = controlIds.filter(id => !currentControlIds.includes(id));
      const controlsToRemove = currentControlIds.filter(id => !controlIds.includes(id));
      
      // Remove old relationships
      for (const controlId of controlsToRemove) {
        await this.persistence.removeRiskControlRelationship(riskId, controlId);
      }
      
      // Add new relationships
      for (const controlId of controlsToAdd) {
        await this.persistence.addRiskControlRelationship(riskId, controlId);
      }
      
      await this.persistence.commitTransaction();
      
      // Return updated controls
      return await this.getControlsForRisk(riskId);
    } catch (error) {
      await this.persistence.rollbackTransaction();
      throw error;
    }
  }
  
  async addControlToRisk(riskId, controlId) {
    // Verify both exist
    await this.persistence.getRiskById(riskId);
    await this.persistence.getControlById(controlId);
    
    // Check if relationship already exists
    const existingControls = await this.persistence.getControlsForRisk(riskId);
    if (existingControls.some(c => c.mitigationID === controlId)) {
      throw new ApiError(422, ErrorCodes.DUPLICATE_RELATIONSHIP, {
        riskId,
        controlId,
        message: 'This control is already linked to the risk'
      });
    }
    
    // Add the relationship
    await this.persistence.addRiskControlRelationship(riskId, controlId);
    
    return await this.getControlsForRisk(riskId);
  }
  
  async removeControlFromRisk(riskId, controlId) {
    // Verify both exist
    await this.persistence.getRiskById(riskId);
    await this.persistence.getControlById(controlId);
    
    // Remove the relationship
    await this.persistence.removeRiskControlRelationship(riskId, controlId);
    
    return await this.getControlsForRisk(riskId);
  }
  
  // Control -> Risks relationships
  async getRisksForControl(controlId) {
    // Verify control exists
    const control = await this.persistence.getControlById(controlId);
    
    // Get all risks for this control
    const risks = await this.persistence.getRisksForControl(controlId);
    
    return {
      controlId: controlId,
      controlDescription: control.mitigationDescription,
      risks: risks,
      riskCount: risks.length
    };
  }
  
  async setRisksForControl(controlId, riskIds) {
    // Verify control exists
    await this.persistence.getControlById(controlId);
    
    // Verify all risks exist
    for (const riskId of riskIds) {
      await this.persistence.getRiskById(riskId);
    }
    
    // Start transaction
    const transaction = await this.persistence.beginTransaction();
    
    try {
      // Get current risks for this control
      const currentRisks = await this.persistence.getRisksForControl(controlId);
      const currentRiskIds = currentRisks.map(r => r.id);
      
      // Find risks to add and remove
      const risksToAdd = riskIds.filter(id => !currentRiskIds.includes(id));
      const risksToRemove = currentRiskIds.filter(id => !riskIds.includes(id));
      
      // Remove old relationships
      for (const riskId of risksToRemove) {
        await this.persistence.removeRiskControlRelationship(riskId, controlId);
      }
      
      // Add new relationships
      for (const riskId of risksToAdd) {
        await this.persistence.addRiskControlRelationship(riskId, controlId);
      }
      
      await this.persistence.commitTransaction();
      
      // Return updated risks
      return await this.getRisksForControl(controlId);
    } catch (error) {
      await this.persistence.rollbackTransaction();
      throw error;
    }
  }
  
  async addRiskToControl(controlId, riskId) {
    // Verify both exist
    await this.persistence.getControlById(controlId);
    await this.persistence.getRiskById(riskId);
    
    // Check if relationship already exists
    const existingRisks = await this.persistence.getRisksForControl(controlId);
    if (existingRisks.some(r => r.id === riskId)) {
      throw new ApiError(422, ErrorCodes.DUPLICATE_RELATIONSHIP, {
        controlId,
        riskId,
        message: 'This risk is already linked to the control'
      });
    }
    
    // Add the relationship
    await this.persistence.addRiskControlRelationship(riskId, controlId);
    
    return await this.getRisksForControl(controlId);
  }
  
  async removeRiskFromControl(controlId, riskId) {
    // Verify both exist
    await this.persistence.getControlById(controlId);
    await this.persistence.getRiskById(riskId);
    
    // Remove the relationship
    await this.persistence.removeRiskControlRelationship(riskId, controlId);
    
    return await this.getRisksForControl(controlId);
  }
  
  // Bulk operations
  async linkMultipleControlsToRisk(riskId, controlIds) {
    // Verify risk exists
    await this.persistence.getRiskById(riskId);
    
    const results = {
      succeeded: [],
      failed: []
    };
    
    for (const controlId of controlIds) {
      try {
        await this.persistence.getControlById(controlId);
        await this.persistence.addRiskControlRelationship(riskId, controlId);
        results.succeeded.push(controlId);
      } catch (error) {
        results.failed.push({
          controlId,
          error: error.message
        });
      }
    }
    
    return results;
  }
  
  async linkMultipleRisksToControl(controlId, riskIds) {
    // Verify control exists
    await this.persistence.getControlById(controlId);
    
    const results = {
      succeeded: [],
      failed: []
    };
    
    for (const riskId of riskIds) {
      try {
        await this.persistence.getRiskById(riskId);
        await this.persistence.addRiskControlRelationship(riskId, controlId);
        results.succeeded.push(riskId);
      } catch (error) {
        results.failed.push({
          riskId,
          error: error.message
        });
      }
    }
    
    return results;
  }
  
  // Analysis methods
  async getRelationshipMatrix() {
    const risks = await this.persistence.getAllRisks();
    const controls = await this.persistence.getAllControls();
    
    const matrix = {
      risks: risks.map(r => ({
        id: r.id,
        name: r.risk,
        category: r.riskCategory,
        controlCount: r.relatedControlIds?.length || 0
      })),
      controls: controls.map(c => ({
        id: c.mitigationID,
        description: c.mitigationDescription,
        category: c.category,
        riskCount: c.relatedRiskIds?.length || 0
      })),
      relationships: []
    };
    
    // Build relationship list
    risks.forEach(risk => {
      if (risk.relatedControlIds) {
        risk.relatedControlIds.forEach(controlId => {
          matrix.relationships.push({
            riskId: risk.id,
            controlId: controlId
          });
        });
      }
    });
    
    return matrix;
  }
  
  async getOrphanedEntities() {
    const risks = await this.persistence.getAllRisks();
    const controls = await this.persistence.getAllControls();
    
    return {
      risksWithoutControls: risks
        .filter(r => !r.relatedControlIds || r.relatedControlIds.length === 0)
        .map(r => ({ id: r.id, name: r.risk, category: r.riskCategory })),
      controlsWithoutRisks: controls
        .filter(c => !c.relatedRiskIds || c.relatedRiskIds.length === 0)
        .map(c => ({ id: c.mitigationID, description: c.mitigationDescription, category: c.category }))
    };
  }
  
  async validateAllRelationships() {
    const risks = await this.persistence.getAllRisks();
    const controls = await this.persistence.getAllControls();
    
    const issues = [];
    
    // Check risk -> control relationships
    for (const risk of risks) {
      if (risk.relatedControlIds) {
        for (const controlId of risk.relatedControlIds) {
          const control = controls.find(c => c.mitigationID === controlId);
          if (!control) {
            issues.push({
              type: 'missing_control',
              riskId: risk.id,
              controlId: controlId,
              message: `Risk "${risk.risk}" references non-existent control "${controlId}"`
            });
          } else if (!control.relatedRiskIds?.includes(risk.id)) {
            issues.push({
              type: 'one_way_relationship',
              riskId: risk.id,
              controlId: controlId,
              message: `Risk "${risk.risk}" links to control "${controlId}" but control doesn't link back`
            });
          }
        }
      }
    }
    
    // Check control -> risk relationships
    for (const control of controls) {
      if (control.relatedRiskIds) {
        for (const riskId of control.relatedRiskIds) {
          const risk = risks.find(r => r.id === riskId);
          if (!risk) {
            issues.push({
              type: 'missing_risk',
              controlId: control.mitigationID,
              riskId: riskId,
              message: `Control "${control.mitigationID}" references non-existent risk "${riskId}"`
            });
          } else if (!risk.relatedControlIds?.includes(control.mitigationID)) {
            issues.push({
              type: 'one_way_relationship',
              controlId: control.mitigationID,
              riskId: riskId,
              message: `Control "${control.mitigationID}" links to risk "${riskId}" but risk doesn't link back`
            });
          }
        }
      }
    }
    
    return {
      valid: issues.length === 0,
      issueCount: issues.length,
      issues: issues
    };
  }
}

module.exports = RelationshipService;