/**
 * Data validation utilities
 */

/**
 * Calculate risk level from likelihood and impact
 * @param {number} likelihood - Likelihood score (1-5)
 * @param {number} impact - Impact score (1-5)
 * @returns {number} Risk level (1-25)
 */
function calculateRiskLevel(likelihood, impact) {
  if (!Number.isInteger(likelihood) || likelihood < 1 || likelihood > 5) {
    throw new Error('Likelihood must be an integer between 1 and 5');
  }
  
  if (!Number.isInteger(impact) || impact < 1 || impact > 5) {
    throw new Error('Impact must be an integer between 1 and 5');
  }
  
  return likelihood * impact;
}

/**
 * Determine risk level category based on risk score
 * @param {number} riskLevel - Risk level score (1-25)
 * @returns {string} Risk level category
 */
function getRiskLevelCategory(riskLevel) {
  if (riskLevel >= 20) return 'Critical';
  if (riskLevel >= 15) return 'High';
  if (riskLevel >= 10) return 'Medium';
  return 'Low';
}

/**
 * Calculate risk reduction metrics
 * @param {number} initialRiskLevel - Initial risk level
 * @param {number} residualRiskLevel - Residual risk level
 * @returns {Object} Risk reduction metrics
 */
function calculateRiskReduction(initialRiskLevel, residualRiskLevel) {
  const reduction = initialRiskLevel - residualRiskLevel;
  const percentage = initialRiskLevel > 0 
    ? Math.round((reduction / initialRiskLevel) * 100) 
    : 0;
  
  let effectiveness = 'Low';
  if (percentage >= 75) effectiveness = 'High';
  else if (percentage >= 50) effectiveness = 'Medium';
  
  return {
    riskReduction: reduction,
    riskReductionPercentage: percentage,
    mitigationEffectiveness: effectiveness
  };
}

/**
 * Validate and normalize risk scoring data
 * @param {Object} scoring - Scoring object with likelihood and impact
 * @returns {Object} Normalized scoring object
 */
function normalizeRiskScoring(scoring) {
  if (!scoring) {
    return {
      likelihood: 0,
      impact: 0,
      riskLevel: 0,
      riskLevelCategory: ''
    };
  }
  
  const likelihood = Number(scoring.likelihood) || 0;
  const impact = Number(scoring.impact) || 0;
  const riskLevel = likelihood * impact;
  const riskLevelCategory = riskLevel > 0 ? getRiskLevelCategory(riskLevel) : '';
  
  return {
    likelihood,
    impact,
    riskLevel,
    riskLevelCategory
  };
}

/**
 * Parse comma-separated string to array
 * @param {string|Array} value - Value to parse
 * @returns {Array} Array of trimmed strings
 */
function parseArrayValue(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  
  return value
    .split(',')
    .map(item => item.trim())
    .filter(item => item);
}

/**
 * Format array as comma-separated string for Excel
 * @param {Array} array - Array to format
 * @returns {string} Comma-separated string
 */
function formatArrayForExcel(array) {
  if (!Array.isArray(array)) return '';
  return array.filter(item => item).join(', ');
}

/**
 * Validate date format
 * @param {string} date - Date string to validate
 * @returns {boolean} True if valid ISO date
 */
function isValidDate(date) {
  if (!date) return false;
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}

/**
 * Get current ISO timestamp
 * @returns {string} ISO timestamp
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

module.exports = {
  calculateRiskLevel,
  getRiskLevelCategory,
  calculateRiskReduction,
  normalizeRiskScoring,
  parseArrayValue,
  formatArrayForExcel,
  isValidDate,
  getCurrentTimestamp
};