// Run this in the browser console when on /risks or /controls page

function checkFiltersImplementation() {
    console.log('=== Checking Collapsible Filters Implementation ===');
    
    // Check if sidebar exists
    const sidebar = document.querySelector('aside');
    console.log('1. Sidebar found:', !!sidebar);
    
    // Check for "Search & Filters" text
    const hasSearchText = document.body.innerText.includes('Search & Filters') || 
                         document.body.innerText.includes('SEARCH & FILTERS');
    console.log('2. "Search & Filters" text found:', hasSearchText);
    
    // Check for collapse button
    const collapseButton = document.querySelector('[aria-label*="filters"]') ||
                          document.querySelector('button:has(svg.lucide-chevron-left)') ||
                          document.querySelector('button:has(svg.lucide-chevron-right)');
    console.log('3. Collapse button found:', !!collapseButton);
    
    // Check for search input
    const searchInput = document.querySelector('input[placeholder*="Search"]') ||
                       document.querySelector('input[type="search"]');
    console.log('4. Search input found:', !!searchInput);
    
    // Check if on correct page
    const isCorrectPage = window.location.pathname.includes('/risks') || 
                         window.location.pathname.includes('/controls');
    console.log('5. On risks or controls page:', isCorrectPage);
    
    // Check if sidebar is expanded
    const sidebarWidth = sidebar ? sidebar.offsetWidth : 0;
    const isExpanded = sidebarWidth > 100;
    console.log('6. Sidebar is expanded:', isExpanded, `(width: ${sidebarWidth}px)`);
    
    console.log('\n=== Summary ===');
    if (!isCorrectPage) {
        console.log('❌ You need to be on /risks or /controls page');
    } else if (!isExpanded) {
        console.log('❌ Sidebar is collapsed. Click the expand button to see filters.');
    } else if (hasSearchText) {
        console.log('✅ Filters section is implemented and should be visible!');
        console.log('Look for "SEARCH & FILTERS" below the navigation menu.');
    } else {
        console.log('⚠️ Filters might be hidden. Try refreshing the page.');
    }
}

// Auto-run the check
checkFiltersImplementation();