/**
 * Tests for ID generation utilities
 */

const assert = require('assert');
const {
  generateRiskId,
  isValidControlId,
  validateControlId,
  generateControlId,
  CONTROL_ID_PATTERN
} = require('../utils/idGenerator.cjs');

describe('ID Generation Tests', () => {
  
  describe('generateRiskId', () => {
    it('should generate correct risk ID format', () => {
      assert.strictEqual(
        generateRiskId('Sensitive Information Leakage'),
        'RISK-SENSITIVE-INFORMATION-LEAKAGE'
      );
      
      assert.strictEqual(
        generateRiskId('AI Bias & Discrimination'),
        'RISK-AI-BIAS-DISCRIMINATION'
      );
      
      assert.strictEqual(
        generateRiskId('Hackers Abuse In-House GenAI Solutions'),
        'RISK-HACKERS-ABUSE-IN-HOUSE-GENAI-SOLUTIONS'
      );
    });
    
    it('should handle special characters', () => {
      assert.strictEqual(
        generateRiskId('Risk @ 100% - Test!'),
        'RISK-RISK-100-TEST'
      );
    });
    
    it('should handle extra spaces', () => {
      assert.strictEqual(
        generateRiskId('  Multiple   Spaces   Risk  '),
        'RISK-MULTIPLE-SPACES-RISK'
      );
    });
    
    it('should throw error for invalid input', () => {
      assert.throws(() => generateRiskId(''), Error);
      assert.throws(() => generateRiskId(null), Error);
      assert.throws(() => generateRiskId(undefined), Error);
      assert.throws(() => generateRiskId(123), Error);
    });
    
    it('should throw error for non-alphanumeric input', () => {
      assert.throws(() => generateRiskId('!!!'), Error);
      assert.throws(() => generateRiskId('---'), Error);
    });
  });
  
  describe('isValidControlId', () => {
    it('should validate correct control IDs', () => {
      assert.strictEqual(isValidControlId('ACC-01'), true);
      assert.strictEqual(isValidControlId('SEC-99'), true);
      assert.strictEqual(isValidControlId('LOG-00'), true);
      assert.strictEqual(isValidControlId('GOV-42'), true);
      assert.strictEqual(isValidControlId('TEST-01'), true);
    });
    
    it('should reject invalid control IDs', () => {
      assert.strictEqual(isValidControlId('CTRL-01'), false);
      assert.strictEqual(isValidControlId('ACC-001'), false);
      assert.strictEqual(isValidControlId('ACC01'), false);
      assert.strictEqual(isValidControlId('ACC-1'), false);
      assert.strictEqual(isValidControlId('acc-01'), false);
      assert.strictEqual(isValidControlId('ACC-XX'), false);
      assert.strictEqual(isValidControlId(''), false);
    });
  });
  
  describe('validateControlId', () => {
    it('should pass for valid control IDs', () => {
      assert.doesNotThrow(() => validateControlId('ACC-01'));
      assert.doesNotThrow(() => validateControlId('SEC-99'));
      assert.doesNotThrow(() => validateControlId('TEST-00'));
    });
    
    it('should throw for invalid control IDs', () => {
      assert.throws(() => validateControlId('INVALID-01'), Error);
      assert.throws(() => validateControlId('ACC-XXX'), Error);
      assert.throws(() => validateControlId(''), Error);
      assert.throws(() => validateControlId(null), Error);
    });
  });
  
  describe('generateControlId', () => {
    it('should generate next control ID', () => {
      const existingControls = [
        { mitigationID: 'ACC-01' },
        { mitigationID: 'ACC-02' },
        { mitigationID: 'ACC-05' }
      ];
      
      assert.strictEqual(generateControlId('ACC', existingControls), 'ACC-06');
    });
    
    it('should start from 01 if no existing controls', () => {
      assert.strictEqual(generateControlId('SEC', []), 'SEC-01');
    });
    
    it('should handle mixed categories', () => {
      const existingControls = [
        { mitigationID: 'ACC-01' },
        { mitigationID: 'SEC-03' },
        { mitigationID: 'ACC-02' }
      ];
      
      assert.strictEqual(generateControlId('ACC', existingControls), 'ACC-03');
      assert.strictEqual(generateControlId('SEC', existingControls), 'SEC-04');
      assert.strictEqual(generateControlId('LOG', existingControls), 'LOG-01');
    });
    
    it('should throw for invalid category', () => {
      assert.throws(() => generateControlId('INVALID', []), Error);
    });
    
    it('should throw when exceeding 99', () => {
      const existingControls = [{ mitigationID: 'TEST-99' }];
      assert.throws(() => generateControlId('TEST', existingControls), Error);
    });
  });
  
  describe('CONTROL_ID_PATTERN', () => {
    it('should match valid patterns', () => {
      assert.strictEqual(CONTROL_ID_PATTERN.test('ACC-01'), true);
      assert.strictEqual(CONTROL_ID_PATTERN.test('SEC-00'), true);
      assert.strictEqual(CONTROL_ID_PATTERN.test('LOG-99'), true);
      assert.strictEqual(CONTROL_ID_PATTERN.test('GOV-50'), true);
      assert.strictEqual(CONTROL_ID_PATTERN.test('TEST-01'), true);
    });
    
    it('should not match invalid patterns', () => {
      assert.strictEqual(CONTROL_ID_PATTERN.test('ABC-01'), false);
      assert.strictEqual(CONTROL_ID_PATTERN.test('ACC-100'), false);
      assert.strictEqual(CONTROL_ID_PATTERN.test('ACC-1'), false);
      assert.strictEqual(CONTROL_ID_PATTERN.test('acc-01'), false);
    });
  });
});

// Run tests if this file is executed directly
if (require.main === module) {
  console.log('Running ID Generator Tests...\n');
  
  const tests = {
    'generateRiskId': () => {
      console.log('✓ Risk ID generation tests passed');
    },
    'isValidControlId': () => {
      console.log('✓ Control ID validation tests passed');
    },
    'validateControlId': () => {
      console.log('✓ Control ID validation with errors tests passed');
    },
    'generateControlId': () => {
      console.log('✓ Control ID generation tests passed');
    },
    'CONTROL_ID_PATTERN': () => {
      console.log('✓ Control ID pattern tests passed');
    }
  };
  
  try {
    // Run the describe blocks
    global.describe = (name, fn) => {
      console.log(`\n${name}:`);
      fn();
    };
    
    global.it = (name, fn) => {
      try {
        fn();
      } catch (error) {
        console.error(`  ✗ ${name}`);
        console.error(`    ${error.message}`);
        process.exit(1);
      }
    };
    
    // Load and run the test file
    delete require.cache[require.resolve(__filename)];
    require(__filename);
    
    console.log('\n✅ All ID generator tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}