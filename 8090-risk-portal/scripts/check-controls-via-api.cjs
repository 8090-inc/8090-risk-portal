const fetch = require('node-fetch');

async function checkControls() {
  try {
    // Get controls from the running server
    const response = await fetch('http://localhost:8080/api/v1/controls');
    const result = await response.json();
    
    const controls = result.data;
    
    console.log('\nTotal controls found:', controls.length);
    console.log('\nEstimated Excel row numbers (assuming controls are in order):');
    console.log('===========================================================');
    
    // Group controls by category to match Excel structure
    const groupedControls = {};
    controls.forEach(control => {
      if (!groupedControls[control.category]) {
        groupedControls[control.category] = [];
      }
      groupedControls[control.category].push(control);
    });
    
    // Sort categories in expected order
    const categoryOrder = ['Accuracy & Judgment', 'Security & Data Privacy', 'Audit & Traceability', 'Governance & Compliance'];
    
    let currentRow = 2; // Excel data starts at row 2 (row 1 is header)
    
    categoryOrder.forEach(category => {
      const categoryControls = groupedControls[category] || [];
      console.log(`\n${category}:`);
      console.log('-'.repeat(50));
      
      // Sort controls by ID within category
      categoryControls.sort((a, b) => a.mitigationID.localeCompare(b.mitigationID));
      
      categoryControls.forEach(control => {
        console.log(`Row ${currentRow}: ${control.mitigationID}`);
        console.log(`      ${control.mitigationDescription.substring(0, 70)}...`);
        currentRow++;
      });
    });
    
    // Check for our specific new controls
    console.log('\n\nChecking for the 8 controls we added:');
    console.log('=====================================');
    const newControlIds = [
      'ACC-04',  // Should be new
      'SEC-06',  // Should be new
      'SEC-07',  // Should be new
      'SEC-08',  // Should be new
      'SEC-09',  // Should be new
      'SEC-10',  // Should be new
      'LOG-03',  // Existing but category fixed
      'LOG-04',  // Should be new
      'GOV-04'   // Should be new
    ];
    
    let foundCount = 0;
    const foundControls = [];
    const notFoundControls = [];
    
    newControlIds.forEach(id => {
      const control = controls.find(c => c.mitigationID === id);
      if (control) {
        foundControls.push(`✓ ${id} - ${control.category}`);
        foundCount++;
      } else {
        notFoundControls.push(`✗ ${id} - NOT FOUND`);
      }
    });
    
    foundControls.forEach(msg => console.log(msg));
    notFoundControls.forEach(msg => console.log(msg));
    
    console.log(`\nSummary: ${foundCount} out of 8 controls found`);
    
    // List controls that are NOT in the original 12
    const originalControlIds = ['ACC-01', 'ACC-02', 'ACC-03', 'SEC-01', 'SEC-02', 'SEC-03', 'SEC-04', 'SEC-05', 'LOG-01', 'LOG-02', 'GOV-01', 'GOV-02', 'GOV-03'];
    const newControls = controls.filter(c => !originalControlIds.includes(c.mitigationID));
    
    console.log('\n\nControls that were ADDED (not in original 12):');
    console.log('===========================================');
    newControls.forEach(control => {
      console.log(`${control.mitigationID} - ${control.category}`);
      console.log(`  Created: ${control.createdAt}`);
    });
    
    console.log('\n\nAll control IDs in the system:');
    console.log('==============================');
    console.log(controls.map(c => c.mitigationID).sort().join(', '));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkControls();