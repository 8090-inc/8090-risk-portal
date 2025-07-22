/**
 * Simple test runner for ID generation tests
 */

const assert = require('assert');
const {
  generateRiskId,
  isValidControlId,
  validateControlId,
  generateControlId,
  CONTROL_ID_PATTERN
} = require('../utils/idGenerator.cjs');

console.log('Running ID Generator Tests...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
    failed++;
  }
}

console.log('Risk ID Generation:');
test('generates correct format for simple names', () => {
  assert.strictEqual(
    generateRiskId('Sensitive Information Leakage'),
    'RISK-SENSITIVE-INFORMATION-LEAKAGE'
  );
});

test('generates correct format for complex names', () => {
  assert.strictEqual(
    generateRiskId('AI Bias & Discrimination'),
    'RISK-AI-BIAS-DISCRIMINATION'
  );
});

test('handles special characters', () => {
  assert.strictEqual(
    generateRiskId('Risk @ 100% - Test!'),
    'RISK-RISK-100-TEST'
  );
});

test('throws error for empty input', () => {
  assert.throws(() => generateRiskId(''), Error);
});

console.log('\nControl ID Validation:');
test('validates correct control IDs', () => {
  assert.strictEqual(isValidControlId('ACC-01'), true);
  assert.strictEqual(isValidControlId('SEC-99'), true);
  assert.strictEqual(isValidControlId('TEST-01'), true);
});

test('rejects invalid control IDs', () => {
  assert.strictEqual(isValidControlId('CTRL-01'), false);
  assert.strictEqual(isValidControlId('ACC-001'), false);
  assert.strictEqual(isValidControlId('acc-01'), false);
});

console.log('\nControl ID Generation:');
test('generates next ID correctly', () => {
  const existing = [
    { mitigationID: 'ACC-01' },
    { mitigationID: 'ACC-02' },
    { mitigationID: 'ACC-05' }
  ];
  assert.strictEqual(generateControlId('ACC', existing), 'ACC-06');
});

test('starts from 01 with no existing', () => {
  assert.strictEqual(generateControlId('SEC', []), 'SEC-01');
});

test('throws for invalid category', () => {
  assert.throws(() => generateControlId('INVALID', []), Error);
});

console.log('\n' + '='.repeat(50));
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log('='.repeat(50));

if (failed > 0) {
  console.error('\n❌ Some tests failed!');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed!');
}