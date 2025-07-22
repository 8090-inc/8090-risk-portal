// Debug version to check what's happening
import React from 'react';
import { useRiskStore } from '../store';

export const SimpleRiskMatrixDebug: React.FC = () => {
  const { risks, isLoading } = useRiskStore();
  
  React.useEffect(() => {
    console.log('SimpleRiskMatrixDebug - Risks loaded:', risks.length);
    if (risks.length > 0) {
      console.log('First risk:', risks[0]);
      console.log('Initial scoring:', risks[0].initialScoring);
      console.log('Residual scoring:', risks[0].residualScoring);
    }
  }, [risks]);
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Risk Matrix Debug</h1>
      <p>Total risks: {risks.length}</p>
      {risks.length > 0 && (
        <div>
          <h2>First Risk Details:</h2>
          <pre>{JSON.stringify(risks[0], null, 2)}</pre>
        </div>
      )}
      <table border={1}>
        <thead>
          <tr>
            <th>Risk</th>
            <th>Initial L</th>
            <th>Initial I</th>
            <th>Residual L</th>
            <th>Residual I</th>
          </tr>
        </thead>
        <tbody>
          {risks.slice(0, 5).map(risk => (
            <tr key={risk.id}>
              <td>{risk.riskName}</td>
              <td>{risk.initialScoring?.likelihood || 'MISSING'}</td>
              <td>{risk.initialScoring?.impact || 'MISSING'}</td>
              <td>{risk.residualScoring?.likelihood || 'MISSING'}</td>
              <td>{risk.residualScoring?.impact || 'MISSING'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};