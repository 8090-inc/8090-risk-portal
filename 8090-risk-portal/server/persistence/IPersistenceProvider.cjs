/**
 * Interface for persistence providers
 * Defines the contract that all persistence implementations must follow
 */

class IPersistenceProvider {
  // Risk operations
  async getAllRisks(options = {}) {
    throw new Error('getAllRisks not implemented');
  }
  
  async getRiskById(id) {
    throw new Error('getRiskById not implemented');
  }
  
  async createRisk(risk) {
    throw new Error('createRisk not implemented');
  }
  
  async updateRisk(id, risk) {
    throw new Error('updateRisk not implemented');
  }
  
  async deleteRisk(id) {
    throw new Error('deleteRisk not implemented');
  }
  
  // Control operations
  async getAllControls(options = {}) {
    throw new Error('getAllControls not implemented');
  }
  
  async getControlById(id) {
    throw new Error('getControlById not implemented');
  }
  
  async createControl(control) {
    throw new Error('createControl not implemented');
  }
  
  async updateControl(id, control) {
    throw new Error('updateControl not implemented');
  }
  
  async deleteControl(id) {
    throw new Error('deleteControl not implemented');
  }
  
  // Relationship operations
  async addRiskControlRelationship(riskId, controlId) {
    throw new Error('addRiskControlRelationship not implemented');
  }
  
  async removeRiskControlRelationship(riskId, controlId) {
    throw new Error('removeRiskControlRelationship not implemented');
  }
  
  async getControlsForRisk(riskId) {
    throw new Error('getControlsForRisk not implemented');
  }
  
  async getRisksForControl(controlId) {
    throw new Error('getRisksForControl not implemented');
  }
  
  // Transaction support
  async beginTransaction() {
    throw new Error('beginTransaction not implemented');
  }
  
  async commitTransaction() {
    throw new Error('commitTransaction not implemented');
  }
  
  async rollbackTransaction() {
    throw new Error('rollbackTransaction not implemented');
  }
}

module.exports = IPersistenceProvider;