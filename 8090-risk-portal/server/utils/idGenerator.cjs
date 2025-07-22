/**
 * ID generation utilities for risks and controls
 */

/**
 * Generate risk ID from risk name
 * "Sensitive Information Leakage" -> "RISK-SENSITIVE-INFORMATION-LEAKAGE"
 * @param {string} riskName - The risk name
 * @returns {string} The generated risk ID
 */
function generateRiskId(riskName) {
  if (!riskName || typeof riskName !== 'string') {
    throw new Error('Risk name is required for ID generation');
  }
  
  const sanitized = riskName
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .toUpperCase();
  
  if (!sanitized) {
    throw new Error('Risk name must contain at least one alphanumeric character');
  }
  
  return `RISK-${sanitized}`;
}

/**
 * Control ID pattern for validation
 */
const CONTROL_ID_PATTERN = /^(ACC|SEC|LOG|GOV|TEST)-\d{2}$/;

/**
 * Validate control ID format
 * @param {string} id - The control ID to validate
 * @returns {boolean} True if valid
 */
function isValidControlId(id) {
  return CONTROL_ID_PATTERN.test(id);
}

/**
 * Validate control ID and throw error if invalid
 * @param {string} id - The control ID to validate
 * @throws {Error} If ID is invalid
 */
function validateControlId(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Control ID is required');
  }
  
  if (!isValidControlId(id)) {
    throw new Error(`Control ID "${id}" must match pattern: ACC-01, SEC-02, LOG-03, GOV-04, TEST-99`);
  }
}

/**
 * Generate a new control ID for a given category
 * @param {string} category - The control category (ACC, SEC, LOG, GOV, TEST)
 * @param {Array} existingControls - Array of existing controls to find next number
 * @returns {string} The generated control ID
 */
function generateControlId(category, existingControls = []) {
  const validCategories = ['ACC', 'SEC', 'LOG', 'GOV', 'TEST'];
  
  if (!validCategories.includes(category)) {
    throw new Error(`Invalid control category. Must be one of: ${validCategories.join(', ')}`);
  }
  
  // Find the highest number for this category
  let maxNumber = 0;
  existingControls.forEach(control => {
    if (control.mitigationID && control.mitigationID.startsWith(category + '-')) {
      const match = control.mitigationID.match(/^[A-Z]+-(\d{2})$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    }
  });
  
  // Generate next number
  const nextNumber = maxNumber + 1;
  if (nextNumber > 99) {
    throw new Error(`No more available IDs for category ${category}`);
  }
  
  return `${category}-${nextNumber.toString().padStart(2, '0')}`;
}

module.exports = {
  generateRiskId,
  isValidControlId,
  validateControlId,
  generateControlId,
  CONTROL_ID_PATTERN
};