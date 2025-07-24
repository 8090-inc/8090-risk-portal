/**
 * Service for managing use cases
 */
class UseCaseService {
  constructor(persistenceProvider) {
    this.persistenceProvider = persistenceProvider;
  }

  /**
   * Get all use cases with optional filtering
   */
  async getAllUseCases(filters = {}) {
    console.log('[UseCaseService] Getting all use cases with filters:', filters);
    
    try {
      const useCases = await this.persistenceProvider.getAllUseCases();
      
      let filteredUseCases = [...useCases];
      
      // Apply filters
      if (filters.businessArea) {
        filteredUseCases = filteredUseCases.filter(uc => 
          uc.businessArea === filters.businessArea
        );
      }
      
      if (filters.aiCategory) {
        filteredUseCases = filteredUseCases.filter(uc => 
          uc.aiCategories && uc.aiCategories.includes(filters.aiCategory)
        );
      }
      
      if (filters.status) {
        filteredUseCases = filteredUseCases.filter(uc => 
          uc.status === filters.status
        );
      }
      
      if (filters.owner) {
        filteredUseCases = filteredUseCases.filter(uc => 
          uc.owner === filters.owner
        );
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredUseCases = filteredUseCases.filter(uc => 
          uc.title.toLowerCase().includes(searchLower) ||
          (uc.description && uc.description.toLowerCase().includes(searchLower)) ||
          uc.id.toLowerCase().includes(searchLower)
        );
      }
      
      // Add risk count to each use case
      const useCasesWithCounts = filteredUseCases.map(uc => ({
        ...uc,
        riskCount: uc.relatedRiskIds ? uc.relatedRiskIds.length : 0
      }));
      
      // Sort by ID (UC-001, UC-002, etc.)
      useCasesWithCounts.sort((a, b) => {
        const aNum = parseInt(a.id.replace('UC-', ''));
        const bNum = parseInt(b.id.replace('UC-', ''));
        return aNum - bNum;
      });
      
      console.log(`[UseCaseService] Returning ${useCasesWithCounts.length} use cases`);
      return useCasesWithCounts;
    } catch (error) {
      console.error('[UseCaseService] Error getting use cases:', error);
      throw error;
    }
  }

  /**
   * Get a single use case by ID
   */
  async getUseCaseById(id) {
    console.log(`[UseCaseService] Getting use case by ID: ${id}`);
    
    try {
      const useCase = await this.persistenceProvider.getUseCaseById(id);
      
      // Add risk count
      return {
        ...useCase,
        riskCount: useCase.relatedRiskIds ? useCase.relatedRiskIds.length : 0
      };
    } catch (error) {
      console.error(`[UseCaseService] Error getting use case ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new use case
   */
  async createUseCase(useCaseData) {
    console.log('[UseCaseService] Creating new use case:', useCaseData);
    
    try {
      // Validate required fields
      if (!useCaseData.title) {
        throw new Error('Title is required');
      }
      
      // Set defaults
      const newUseCase = {
        ...useCaseData,
        status: useCaseData.status || 'Concept',
        createdDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        relatedRiskIds: []
      };
      
      // Create in persistence
      const created = await this.persistenceProvider.createUseCase(newUseCase);
      
      console.log(`[UseCaseService] Use case created with ID: ${created.id}`);
      return created;
    } catch (error) {
      console.error('[UseCaseService] Error creating use case:', error);
      throw error;
    }
  }

  /**
   * Update an existing use case
   */
  async updateUseCase(id, updates) {
    console.log(`[UseCaseService] Updating use case ${id}:`, updates);
    
    try {
      // Remove fields that shouldn't be updated
      const { id: _, createdDate: __, relatedRiskIds: ___, ...cleanUpdates } = updates;
      
      // Update in persistence
      const updated = await this.persistenceProvider.updateUseCase(id, cleanUpdates);
      
      console.log(`[UseCaseService] Use case ${id} updated`);
      return updated;
    } catch (error) {
      console.error(`[UseCaseService] Error updating use case ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a use case
   */
  async deleteUseCase(id) {
    console.log(`[UseCaseService] Deleting use case: ${id}`);
    
    try {
      await this.persistenceProvider.deleteUseCase(id);
      console.log(`[UseCaseService] Use case ${id} deleted`);
    } catch (error) {
      console.error(`[UseCaseService] Error deleting use case ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update risk associations for a use case
   */
  async updateUseCaseRisks(id, riskIds) {
    console.log(`[UseCaseService] Updating risks for use case ${id}:`, riskIds);
    
    try {
      const useCase = await this.persistenceProvider.getUseCaseById(id);
      const currentRiskIds = useCase.relatedRiskIds || [];
      
      // Begin transaction for multiple operations
      await this.persistenceProvider.beginTransaction();
      
      try {
        // Remove risks that are no longer associated
        for (const riskId of currentRiskIds) {
          if (!riskIds.includes(riskId)) {
            await this.persistenceProvider.removeUseCaseRiskRelationship(id, riskId);
          }
        }
        
        // Add new risk associations
        for (const riskId of riskIds) {
          if (!currentRiskIds.includes(riskId)) {
            await this.persistenceProvider.addUseCaseRiskRelationship(id, riskId);
          }
        }
        
        // Commit transaction
        await this.persistenceProvider.commitTransaction();
        
        console.log(`[UseCaseService] Risk associations updated for use case ${id}`);
        
        // Return updated use case
        return this.getUseCaseById(id);
      } catch (error) {
        // Rollback on error
        await this.persistenceProvider.rollbackTransaction();
        throw error;
      }
    } catch (error) {
      console.error(`[UseCaseService] Error updating risks for use case ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get risks associated with a use case
   */
  async getRisksForUseCase(id) {
    console.log(`[UseCaseService] Getting risks for use case: ${id}`);
    
    try {
      const risks = await this.persistenceProvider.getRisksForUseCase(id);
      console.log(`[UseCaseService] Found ${risks.length} risks for use case ${id}`);
      return risks;
    } catch (error) {
      console.error(`[UseCaseService] Error getting risks for use case ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get use case statistics
   */
  async getUseCaseStatistics() {
    console.log('[UseCaseService] Getting use case statistics');
    
    try {
      const useCases = await this.persistenceProvider.getAllUseCases();
      
      const stats = {
        total: useCases.length,
        byStatus: {},
        byBusinessArea: {},
        byAiCategory: {},
        totalCostSaving: 0,
        averageEffortMonths: 0
      };
      
      // Calculate statistics
      let totalEffort = 0;
      let effortCount = 0;
      
      useCases.forEach(uc => {
        // Status counts
        stats.byStatus[uc.status] = (stats.byStatus[uc.status] || 0) + 1;
        
        // Business area counts
        if (uc.businessArea) {
          stats.byBusinessArea[uc.businessArea] = (stats.byBusinessArea[uc.businessArea] || 0) + 1;
        }
        
        // AI category counts
        if (uc.aiCategories) {
          uc.aiCategories.forEach(category => {
            stats.byAiCategory[category] = (stats.byAiCategory[category] || 0) + 1;
          });
        }
        
        // Cost saving
        if (uc.impact && uc.impact.costSaving) {
          stats.totalCostSaving += uc.impact.costSaving;
        }
        
        // Effort
        if (uc.impact && uc.impact.effortMonths) {
          totalEffort += uc.impact.effortMonths;
          effortCount++;
        }
      });
      
      // Calculate average effort
      if (effortCount > 0) {
        stats.averageEffortMonths = totalEffort / effortCount;
      }
      
      console.log('[UseCaseService] Statistics calculated:', stats);
      return stats;
    } catch (error) {
      console.error('[UseCaseService] Error getting statistics:', error);
      throw error;
    }
  }
}

module.exports = UseCaseService;