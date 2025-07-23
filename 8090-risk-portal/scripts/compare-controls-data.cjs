#!/usr/bin/env node

/**
 * Script to compare controls data between environments
 */

const fetch = require('node-fetch');

async function compareControls() {
  console.log('=== Comparing Controls Data ===\n');
  
  try {
    // 1. Get local data
    console.log('1. Fetching local controls data...');
    const localResponse = await fetch('http://localhost:8080/api/v1/controls?limit=1000');
    const localData = await localResponse.json();
    
    console.log(`   - Local API response status: ${localResponse.status}`);
    console.log(`   - Controls returned: ${localData.data?.length || 0}`);
    console.log(`   - Total available: ${localData.meta?.total || 'unknown'}`);
    
    if (localData.data && localData.data.length > 0) {
      console.log(`   - First control: ${localData.data[0].mitigationID} (${localData.data[0].category})`);
      console.log(`   - Last control: ${localData.data[localData.data.length-1].mitigationID} (${localData.data[localData.data.length-1].category})`);
      
      // Check categories
      const categories = [...new Set(localData.data.map(c => c.category))];
      console.log(`   - Categories: ${categories.join(', ')}`);
    }
    
    // 2. Analyze pagination behavior
    console.log('\n2. Testing pagination behavior...');
    
    // Test default limit
    const defaultResponse = await fetch('http://localhost:8080/api/v1/controls');
    const defaultData = await defaultResponse.json();
    console.log(`   - Default limit returns: ${defaultData.data?.length || 0} controls`);
    console.log(`   - Meta info: page=${defaultData.meta?.page}, limit=${defaultData.meta?.limit}, total=${defaultData.meta?.total}, totalPages=${defaultData.meta?.totalPages}`);
    
    // Test explicit limit=20
    const limit20Response = await fetch('http://localhost:8080/api/v1/controls?limit=20');
    const limit20Data = await limit20Response.json();
    console.log(`   - Limit=20 returns: ${limit20Data.data?.length || 0} controls`);
    
    // Test limit=50
    const limit50Response = await fetch('http://localhost:8080/api/v1/controls?limit=50');
    const limit50Data = await limit50Response.json();
    console.log(`   - Limit=50 returns: ${limit50Data.data?.length || 0} controls`);
    
    // 3. Compare frontend expectations
    console.log('\n3. Frontend expectations:');
    console.log('   - Frontend requests: /api/v1/controls?limit=1000');
    console.log('   - Frontend expects all controls in one request');
    console.log(`   - Actual controls in DB: ${localData.data?.length || 0}`);
    
    // 4. Production behavior analysis
    console.log('\n4. Production API behavior:');
    console.log('   - Production redirects API calls to auth.html (IAP authentication)');
    console.log('   - This suggests the production frontend must handle authentication differently');
    console.log('   - The production backend might have different data or configuration');
    
    // 5. Potential issues
    console.log('\n5. Potential issues causing differences:');
    console.log('   a) Production backend has different data (different Google Sheet?)');
    console.log('   b) Production backend has different code (older version?)');
    console.log('   c) Frontend code differs between environments');
    console.log('   d) Caching issues on production');
    
    // 6. Show control IDs for comparison
    console.log('\n6. All local control IDs:');
    if (localData.data) {
      console.log(`   ${localData.data.map(c => c.mitigationID).sort().join(', ')}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

compareControls();