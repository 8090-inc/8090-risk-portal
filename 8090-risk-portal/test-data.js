import data from './src/data/extracted-excel-data.json' assert { type: 'json' };

console.log('=== RISK MATRIX DATA TEST ===');
console.log('Total risks found:', data.riskMap.length);
console.log('');

console.log('=== FIRST 3 RISKS ===');
data.riskMap.slice(0, 3).forEach((risk, index) => {
  console.log(`${index + 1}. ${risk.riskCategory} - ${risk.risk}`);
  console.log(`   Description: ${risk.riskDescription.substring(0, 100)}...`);
  console.log(`   Initial: L=${risk.initialLikelihood}, I=${risk.initialImpact}, Level=${risk.riskLevelCategory}`);
  console.log(`   Residual: L=${risk.residualLikelihood}, I=${risk.residualImpact}, Level=${risk.residualRiskLevel}`);
  console.log('');
});

console.log('=== RISK BREAKDOWN ===');
const categories = {};
data.riskMap.forEach(risk => {
  categories[risk.riskLevelCategory] = (categories[risk.riskLevelCategory] || 0) + 1;
});
Object.entries(categories).forEach(([level, count]) => {
  console.log(`${level}: ${count}`);
});

console.log('');
console.log('=== COLUMN HEADERS THAT SHOULD APPEAR ===');
const sampleRisk = data.riskMap[0];
Object.keys(sampleRisk).forEach(key => {
  console.log(`- ${key}: ${sampleRisk[key]?.toString().substring(0, 50)}...`);
});