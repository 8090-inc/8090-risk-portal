import { TemplateData } from '../services/geminiService';
import { Risk } from '../types/risk.types';

export function extractTemplateData(risks: Risk[]): TemplateData {
  // Group risks by category
  const risksByCategory = risks.reduce((acc, risk) => {
    if (!acc[risk.riskCategory]) {
      acc[risk.riskCategory] = [];
    }
    acc[risk.riskCategory].push(risk);
    return acc;
  }, {} as Record<string, Risk[]>);

  // Count risks by level
  const criticalRisks = risks.filter(r => r.initialScoring.riskLevelCategory === 'Critical');
  const highRisks = risks.filter(r => r.initialScoring.riskLevelCategory === 'High');
  const mediumRisks = risks.filter(r => r.initialScoring.riskLevelCategory === 'Medium');
  const lowRisks = risks.filter(r => r.initialScoring.riskLevelCategory === 'Low');

  // Format risk distribution
  const riskDistribution = `Critical: ${criticalRisks.length}, High: ${highRisks.length}, Medium: ${mediumRisks.length}, Low: ${lowRisks.length}`;

  // Format critical risks list
  const criticalRisksList = criticalRisks
    .map(r => `• ${r.risk} (${r.riskCategory}): ${r.riskDescription.substring(0, 150)}...`)
    .join('\n');

  // Format high risks list
  const highRisksList = highRisks
    .map(r => `• ${r.risk} (${r.riskCategory}): ${r.riskDescription.substring(0, 150)}...`)
    .join('\n');

  // Format impact by category
  const impactByCategory = Object.entries(risksByCategory)
    .map(([category, categoryRisks]) => {
      const criticalCount = categoryRisks.filter(r => r.initialScoring.riskLevelCategory === 'Critical').length;
      const highCount = categoryRisks.filter(r => r.initialScoring.riskLevelCategory === 'High').length;
      return `• ${category}: ${categoryRisks.length} risks (${criticalCount} Critical, ${highCount} High)`;
    })
    .join('\n');

  // Format mitigation summary
  const mitigationSummary = criticalRisks
    .slice(0, 5) // Top 5 critical risks
    .map(r => `• ${r.risk}: ${r.agreedMitigation.substring(0, 200)}...`)
    .join('\n');

  return {
    companyName: 'Dompé farmaceutici S.p.A.',
    currentDate: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    totalRisks: risks.length,
    categoryCount: Object.keys(risksByCategory).length,
    categories: Object.keys(risksByCategory).join(', '),
    riskDistribution,
    criticalCount: criticalRisks.length,
    highCount: highRisks.length,
    criticalRisks: criticalRisksList || 'No critical risks identified',
    highRisks: highRisksList || 'No high risks identified',
    impactByCategory,
    mitigationSummary
  };
}

export function getTemplateVariables(): string[] {
  return [
    '{{companyName}}',
    '{{currentDate}}',
    '{{totalRisks}}',
    '{{categoryCount}}',
    '{{categories}}',
    '{{riskDistribution}}',
    '{{criticalCount}}',
    '{{highCount}}',
    '{{criticalRisks}}',
    '{{highRisks}}',
    '{{impactByCategory}}',
    '{{mitigationSummary}}'
  ];
}