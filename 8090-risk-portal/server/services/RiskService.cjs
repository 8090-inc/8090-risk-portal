const ApiError = require('../errors/ApiError.cjs');
const { ErrorCodes } = require('../errors/errorCodes.cjs');
const { generateRiskId } = require('../utils/idGenerator.cjs');

class RiskService {
  constructor(persistenceProvider) {
    this.persistence = persistenceProvider;
  }
  
  async getAllRisks(options = {}) {
    const { filters, pagination, sort } = options;
    const allRisks = await this.persistence.getAllRisks();
    
    // Apply filters
    let filteredRisks = this.applyFilters(allRisks, filters);
    
    // Apply sorting
    if (sort) {
      filteredRisks = this.applySorting(filteredRisks, sort);
    }
    
    // Apply pagination
    const { page = 1, limit = 20 } = pagination || {};
    const paginatedRisks = this.applyPagination(filteredRisks, { page, limit });
    
    return {
      risks: paginatedRisks,
      total: filteredRisks.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(filteredRisks.length / limit)
    };
  }
  
  async getRiskById(id) {
    return await this.persistence.getRiskById(id);
  }
  
  async createRisk(riskData) {
    // Validate required fields
    if (!riskData.risk) {
      throw new ApiError(400, ErrorCodes.MISSING_REQUIRED_FIELD, { 
        field: 'risk',
        requiredFields: 'risk, riskCategory, riskDescription'
      });
    }
    
    // Generate ID from risk name
    const id = generateRiskId(riskData.risk);
    
    // Check for duplicates
    try {
      const existing = await this.persistence.getRiskById(id);
      if (existing) {
        throw new ApiError(422, ErrorCodes.DUPLICATE_RISK_NAME, { 
          name: riskData.risk,
          id: id 
        });
      }
    } catch (error) {
      if (error.code !== 'RISK_NOT_FOUND') {
        throw error;
      }
    }
    
    // Set defaults
    const newRisk = {
      ...riskData,
      id,
      initialScoring: {
        likelihood: riskData.initialScoring?.likelihood || 3,
        impact: riskData.initialScoring?.impact || 3,
        riskLevel: (riskData.initialScoring?.likelihood || 3) * (riskData.initialScoring?.impact || 3)
      },
      residualScoring: {
        likelihood: riskData.residualScoring?.likelihood || riskData.initialScoring?.likelihood || 3,
        impact: riskData.residualScoring?.impact || riskData.initialScoring?.impact || 3,
        riskLevel: (riskData.residualScoring?.likelihood || riskData.initialScoring?.likelihood || 3) * 
                  (riskData.residualScoring?.impact || riskData.initialScoring?.impact || 3)
      },
      proposedOversightOwnership: riskData.proposedOversightOwnership || [],
      proposedSupport: riskData.proposedSupport || [],
      agreedMitigation: riskData.agreedMitigation || '',
      notes: riskData.notes || '',
      relatedControlIds: []
    };
    
    return await this.persistence.createRisk(newRisk);
  }
  
  async updateRisk(id, riskData) {
    // Ensure risk exists
    await this.getRiskById(id);
    
    // Don't allow changing the risk name (which would change the ID)
    if (riskData.risk) {
      const newId = generateRiskId(riskData.risk);
      if (newId !== id) {
        throw new ApiError(400, ErrorCodes.INVALID_RISK_DATA, {
          details: 'Cannot change risk name as it would change the ID'
        });
      }
    }
    
    // Recalculate risk levels if scores changed
    if (riskData.initialScoring) {
      riskData.initialScoring.riskLevel = 
        (riskData.initialScoring.likelihood || 1) * (riskData.initialScoring.impact || 1);
    }
    
    if (riskData.residualScoring) {
      riskData.residualScoring.riskLevel = 
        (riskData.residualScoring.likelihood || 1) * (riskData.residualScoring.impact || 1);
    }
    
    return await this.persistence.updateRisk(id, riskData);
  }
  
  async deleteRisk(id) {
    // This will handle relationship cleanup in the persistence layer
    return await this.persistence.deleteRisk(id);
  }
  
  // Helper methods
  applyFilters(risks, filters) {
    if (!filters) return risks;
    
    return risks.filter(risk => {
      if (filters.category && risk.riskCategory !== filters.category) return false;
      if (filters.minScore && risk.residualScoring.riskLevel < filters.minScore) return false;
      if (filters.maxScore && risk.residualScoring.riskLevel > filters.maxScore) return false;
      if (filters.hasControls !== undefined) {
        const hasControls = risk.relatedControlIds && risk.relatedControlIds.length > 0;
        if (filters.hasControls !== hasControls) return false;
      }
      return true;
    });
  }
  
  applySorting(risks, sort) {
    const field = sort.startsWith('-') ? sort.slice(1) : sort;
    const direction = sort.startsWith('-') ? -1 : 1;
    
    return [...risks].sort((a, b) => {
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
  
  applyPagination(risks, { page, limit }) {
    const start = (page - 1) * limit;
    const end = start + limit;
    return risks.slice(start, end);
  }
  
  getSortValue(risk, field) {
    switch (field) {
      case 'residualRiskLevel':
        return risk.residualScoring?.riskLevel || 0;
      case 'initialRiskLevel':
        return risk.initialScoring?.riskLevel || 0;
      case 'risk':
        return risk.risk;
      case 'riskCategory':
        return risk.riskCategory;
      case 'controlCount':
        return risk.relatedControlIds?.length || 0;
      default:
        return risk[field];
    }
  }
  
  // Business logic methods
  async getHighRisks(threshold = 15) {
    const allRisks = await this.persistence.getAllRisks();
    return allRisks.filter(risk => 
      risk.residualScoring?.riskLevel >= threshold
    );
  }
  
  async getRisksWithoutControls() {
    const allRisks = await this.persistence.getAllRisks();
    return allRisks.filter(risk => 
      !risk.relatedControlIds || risk.relatedControlIds.length === 0
    );
  }
  
  async getRiskStatistics() {
    const allRisks = await this.persistence.getAllRisks();
    
    const stats = {
      total: allRisks.length,
      byCategory: {},
      byRiskLevel: {
        veryLow: 0,    // 1-5
        low: 0,        // 6-10
        medium: 0,     // 11-15
        high: 0,       // 16-20
        veryHigh: 0    // 21-25
      },
      withControls: 0,
      withoutControls: 0,
      averageInitialRisk: 0,
      averageResidualRisk: 0
    };
    
    let totalInitial = 0;
    let totalResidual = 0;
    
    allRisks.forEach(risk => {
      // By category
      if (!stats.byCategory[risk.riskCategory]) {
        stats.byCategory[risk.riskCategory] = 0;
      }
      stats.byCategory[risk.riskCategory]++;
      
      // By risk level
      const level = risk.residualScoring?.riskLevel || 0;
      if (level <= 5) stats.byRiskLevel.veryLow++;
      else if (level <= 10) stats.byRiskLevel.low++;
      else if (level <= 15) stats.byRiskLevel.medium++;
      else if (level <= 20) stats.byRiskLevel.high++;
      else stats.byRiskLevel.veryHigh++;
      
      // With/without controls
      if (risk.relatedControlIds && risk.relatedControlIds.length > 0) {
        stats.withControls++;
      } else {
        stats.withoutControls++;
      }
      
      // Averages
      totalInitial += risk.initialScoring?.riskLevel || 0;
      totalResidual += risk.residualScoring?.riskLevel || 0;
    });
    
    stats.averageInitialRisk = allRisks.length > 0 ? 
      Math.round(totalInitial / allRisks.length * 10) / 10 : 0;
    stats.averageResidualRisk = allRisks.length > 0 ? 
      Math.round(totalResidual / allRisks.length * 10) / 10 : 0;
    
    return stats;
  }
}

module.exports = RiskService;