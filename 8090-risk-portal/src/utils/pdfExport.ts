import type { Risk, Control } from '../types';

export const exportRisksToPDF = async (risks: Risk[], controls: Control[]) => {
  // Create a simple HTML report
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>AI Risk Portal Report - ${new Date().toLocaleDateString()}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          color: #333;
        }
        h1, h2, h3 {
          color: #0066CC;
        }
        h1 {
          border-bottom: 3px solid #0066CC;
          padding-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .critical { color: #DC3545; font-weight: bold; }
        .high { color: #FD7E14; font-weight: bold; }
        .medium { color: #FFC107; }
        .low { color: #28A745; }
        .summary {
          background-color: #e9ecef;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <h1>AI Risk Portal Report</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      
      <div class="summary">
        <h2>Executive Summary</h2>
        <p><strong>Total Risks:</strong> ${risks.length}</p>
        <p><strong>Total Controls:</strong> ${controls.length}</p>
        <p><strong>Critical Risks:</strong> ${risks.filter(r => r.residualScoring.riskLevelCategory === 'Critical').length}</p>
        <p><strong>High Risks:</strong> ${risks.filter(r => r.residualScoring.riskLevelCategory === 'High').length}</p>
        <p><strong>Implemented Controls:</strong> ${controls.filter(c => c.implementationStatus === 'Implemented').length}</p>
      </div>

      <h2>Risk Register</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Risk</th>
            <th>Category</th>
            <th>Initial Risk</th>
            <th>Residual Risk</th>
            <th>Owner</th>
            <th>Controls</th>
          </tr>
        </thead>
        <tbody>
          ${risks.map(risk => `
            <tr>
              <td>${risk.id}</td>
              <td>${risk.risk}</td>
              <td>${risk.riskCategory}</td>
              <td class="${risk.initialScoring.riskLevelCategory.toLowerCase()}">${risk.initialScoring.riskLevelCategory}</td>
              <td class="${risk.residualScoring.riskLevelCategory.toLowerCase()}">${risk.residualScoring.riskLevelCategory}</td>
              <td>${risk.proposedOversightOwnership}</td>
              <td>${risk.relatedControlIds.length}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>Control Register</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Description</th>
            <th>Category</th>
            <th>Status</th>
            <th>Effectiveness</th>
            <th>Compliance</th>
          </tr>
        </thead>
        <tbody>
          ${controls.map(control => `
            <tr>
              <td>${control.mitigationID}</td>
              <td>${control.mitigationDescription}</td>
              <td>${control.category}</td>
              <td>${control.implementationStatus}</td>
              <td>${control.effectiveness}</td>
              <td>${Math.round((control.complianceScore || 0) * 100)}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>8090 AI Risk Portal | Dompé farmaceutici S.p.A.</p>
        <p>This report contains confidential information and should be handled accordingly.</p>
      </div>
    </body>
    </html>
  `;

  // Create a blob and download
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Open in new tab for printing
  const printWindow = window.open(url, '_blank');
  
  // Wait for window to load then trigger print dialog
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};