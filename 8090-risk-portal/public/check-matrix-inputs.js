// Script to check if input elements exist in the Risk Matrix view
// Run this in the browser console when on the /matrix page

console.log('Checking for Risk Matrix inputs...');

// Check for number inputs
const numberInputs = document.querySelectorAll('input[type="number"]');
console.log(`Found ${numberInputs.length} number inputs`);

if (numberInputs.length > 0) {
    console.log('First few inputs:');
    Array.from(numberInputs).slice(0, 5).forEach((input, index) => {
        console.log(`Input ${index + 1}:`, {
            value: input.value,
            className: input.className,
            visible: input.offsetParent !== null,
            dimensions: `${input.offsetWidth}x${input.offsetHeight}`,
            parent: input.parentElement?.className
        });
    });
} else {
    console.log('No number inputs found!');
}

// Check for table cells with risk data
const tableCells = document.querySelectorAll('td');
console.log(`\nFound ${tableCells.length} table cells`);

// Look for cells that might contain L/I data
const potentialScoreCells = Array.from(tableCells).filter(td => {
    const text = td.textContent?.trim();
    return text === '1' || text === '2' || text === '3' || text === '4' || text === '5';
});

console.log(`Found ${potentialScoreCells.length} cells with score values (1-5)`);

// Check the Zustand store directly
if (window.__ZUSTAND_DEVTOOLS__) {
    try {
        const state = window.__ZUSTAND_DEVTOOLS__.store.getState();
        const risks = state.risks || [];
        console.log('\nZustand store check:');
        console.log(`Total risks in store: ${risks.length}`);
        if (risks.length > 0) {
            console.log('First risk scoring:', {
                name: risks[0].riskName,
                initialL: risks[0].initialScoring?.likelihood,
                initialI: risks[0].initialScoring?.impact,
                residualL: risks[0].residualScoring?.likelihood,
                residualI: risks[0].residualScoring?.impact
            });
        }
    } catch (e) {
        console.log('Could not access Zustand store:', e.message);
    }
}

// Check for any elements with the CompactNumberInput classes
const compactInputs = document.querySelectorAll('.w-8.h-6');
console.log(`\nFound ${compactInputs.length} elements with CompactNumberInput classes`);

// Final check - look for the specific table structure
const matrixTable = document.querySelector('table');
if (matrixTable) {
    const firstDataRow = matrixTable.querySelector('tbody tr');
    if (firstDataRow) {
        const cells = firstDataRow.querySelectorAll('td');
        console.log('\nFirst data row analysis:');
        Array.from(cells).forEach((cell, index) => {
            const input = cell.querySelector('input');
            if (input) {
                console.log(`Cell ${index}: Contains input with value="${input.value}"`);
            }
        });
    }
}