// Test script to verify dashboard alignment fixes
// Run this in the browser console on the dashboard page

function testDashboardAlignment() {
  console.log('=== Dashboard Alignment Test Results ===\n');
  
  // Test 1: Check if matrix cells are square
  const matrixCells = document.querySelectorAll('.matrix-container .aspect-square');
  const cellDimensions = [];
  
  matrixCells.forEach((cell, index) => {
    const rect = cell.getBoundingClientRect();
    cellDimensions.push({
      width: rect.width,
      height: rect.height,
      isSquare: Math.abs(rect.width - rect.height) < 1
    });
  });
  
  const allSquare = cellDimensions.every(d => d.isSquare);
  console.log(`1. Matrix cells square: ${allSquare ? '✅' : '❌'}`);
  if (!allSquare) {
    console.log('   Non-square cells:', cellDimensions.filter(d => !d.isSquare));
  }
  
  // Test 2: Check gaps between cells
  const gridContainer = document.querySelector('.grid.grid-rows-5.grid-cols-5');
  const computedStyle = window.getComputedStyle(gridContainer);
  const gap = computedStyle.gap;
  console.log(`2. Grid gap: ${gap} ${gap === '2px' ? '✅' : '❌'}`);
  
  // Test 3: Check table content visibility
  const tableRows = document.querySelectorAll('tbody tr');
  let truncatedCount = 0;
  
  tableRows.forEach(row => {
    const cells = row.querySelectorAll('td');
    cells.forEach(cell => {
      const textElement = cell.querySelector('.truncate');
      if (textElement) {
        const isOverflowing = textElement.scrollWidth > textElement.clientWidth;
        if (isOverflowing) truncatedCount++;
      }
    });
  });
  
  console.log(`3. Table content truncation: ${truncatedCount} cells truncated ${truncatedCount === 0 ? '✅' : '⚠️'}`);
  
  // Test 4: Check grid proportions
  const riskLandscape = document.querySelector('.grid.grid-cols-\\[5fr\\,7fr\\]');
  if (riskLandscape) {
    console.log('4. Grid proportions updated: ✅');
  } else {
    console.log('4. Grid proportions: ❌ (still using old proportions)');
  }
  
  // Test 5: Check container queries
  const styleSheets = Array.from(document.styleSheets);
  const hasContainerQueries = styleSheets.some(sheet => {
    try {
      const rules = Array.from(sheet.cssRules || []);
      return rules.some(rule => rule.cssText && rule.cssText.includes('@container'));
    } catch (e) {
      return false;
    }
  });
  
  console.log(`5. Container queries implemented: ${hasContainerQueries ? '✅' : '❌'}`);
  
  // Test 6: Check responsive text sizing
  const matrixCellText = document.querySelector('.matrix-cell-text');
  if (matrixCellText) {
    const fontSize = window.getComputedStyle(matrixCellText).fontSize;
    console.log(`6. Matrix cell text size: ${fontSize}`);
  }
  
  console.log('\n=== Test Complete ===');
}

// Run the test
testDashboardAlignment();