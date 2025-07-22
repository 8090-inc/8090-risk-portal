/**
 * Show the actual test results with detailed output
 */

const assert = require('assert');
const {
  generateRiskId,
  isValidControlId,
  validateControlId,
  generateControlId,
  CONTROL_ID_PATTERN
} = require('../utils/idGenerator.cjs');

console.log('=== SHOWING ACTUAL TEST RESULTS ===\n');

let testNumber = 0;

function runTest(description, fn) {
  testNumber++;
  console.log(`\nTest ${testNumber}: ${description}`);
  console.log('-'.repeat(60));
  
  try {
    const result = fn();
    console.log('✅ PASSED');
    if (result) {
      console.log('Result:', result);
    }
  } catch (error) {
    console.log('❌ FAILED');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
  }
}

console.log('RISK ID GENERATION TESTS:');
console.log('='.repeat(80));

runTest('Generate risk ID from "Sensitive Information Leakage"', () => {
  const input = 'Sensitive Information Leakage';
  const result = generateRiskId(input);
  console.log(`Input: "${input}"`);
  console.log(`Output: "${result}"`);
  console.log(`Expected: "RISK-SENSITIVE-INFORMATION-LEAKAGE"`);
  assert.strictEqual(result, 'RISK-SENSITIVE-INFORMATION-LEAKAGE');
  return result;
});

runTest('Generate risk ID from "AI Bias & Discrimination"', () => {
  const input = 'AI Bias & Discrimination';
  const result = generateRiskId(input);
  console.log(`Input: "${input}"`);
  console.log(`Output: "${result}"`);
  console.log(`Expected: "RISK-AI-BIAS-DISCRIMINATION"`);
  assert.strictEqual(result, 'RISK-AI-BIAS-DISCRIMINATION');
  return result;
});

runTest('Generate risk ID with special characters', () => {
  const input = 'Risk @ 100% - Test!';
  const result = generateRiskId(input);
  console.log(`Input: "${input}"`);
  console.log(`Output: "${result}"`);
  console.log(`Expected: "RISK-RISK-100-TEST"`);
  assert.strictEqual(result, 'RISK-RISK-100-TEST');
  return result;
});

runTest('Generate risk ID with empty string (should fail)', () => {
  const input = '';
  console.log(`Input: "${input}"`);
  console.log('Expected: Should throw error');
  assert.throws(() => generateRiskId(input), Error);
  console.log('Correctly threw error for empty input');
});

console.log('\n\nCONTROL ID VALIDATION TESTS:');
console.log('='.repeat(80));

runTest('Validate control ID "ACC-01"', () => {
  const input = 'ACC-01';
  const result = isValidControlId(input);
  console.log(`Input: "${input}"`);
  console.log(`Result: ${result}`);
  console.log(`Expected: true`);
  assert.strictEqual(result, true);
  return result;
});

runTest('Validate control ID "CTRL-01" (invalid prefix)', () => {
  const input = 'CTRL-01';
  const result = isValidControlId(input);
  console.log(`Input: "${input}"`);
  console.log(`Result: ${result}`);
  console.log(`Expected: false`);
  assert.strictEqual(result, false);
  return result;
});

runTest('Validate control ID "ACC-001" (too many digits)', () => {
  const input = 'ACC-001';
  const result = isValidControlId(input);
  console.log(`Input: "${input}"`);
  console.log(`Result: ${result}`);
  console.log(`Expected: false`);
  assert.strictEqual(result, false);
  return result;
});

console.log('\n\nCONTROL ID GENERATION TESTS:');
console.log('='.repeat(80));

runTest('Generate next control ID for ACC category', () => {
  const category = 'ACC';
  const existing = [
    { mitigationID: 'ACC-01' },
    { mitigationID: 'ACC-02' },
    { mitigationID: 'ACC-05' }
  ];
  const result = generateControlId(category, existing);
  console.log(`Category: "${category}"`);
  console.log(`Existing controls:`, existing.map(c => c.mitigationID));
  console.log(`Generated: "${result}"`);
  console.log(`Expected: "ACC-06"`);
  assert.strictEqual(result, 'ACC-06');
  return result;
});

runTest('Generate first control ID for new category', () => {
  const category = 'LOG';
  const existing = [];
  const result = generateControlId(category, existing);
  console.log(`Category: "${category}"`);
  console.log(`Existing controls: none`);
  console.log(`Generated: "${result}"`);
  console.log(`Expected: "LOG-01"`);
  assert.strictEqual(result, 'LOG-01');
  return result;
});

console.log('\n\nSUMMARY:');
console.log('='.repeat(80));
console.log('These tests ONLY validate the ID generation utilities.');
console.log('They do NOT test:');
console.log('- API endpoints (not implemented yet)');
console.log('- Database operations (not implemented yet)');
console.log('- Risk/Control CRUD operations (not implemented yet)');
console.log('- Relationship management (not implemented yet)');
console.log('\nThe test Excel file contains real data but we have NOT tested');
console.log('any operations on that data yet. That comes in Phase 2 and beyond.');