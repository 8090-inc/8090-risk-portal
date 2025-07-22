#!/usr/bin/env node

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api/v1';
const CONTROL_ID = 'LOG-03';
const CORRECT_CATEGORY = 'Audit & Traceability';

async function fixControlCategory() {
  try {
    console.log(`Fixing category for control ${CONTROL_ID}...`);
    
    // First, get the current control data
    const getResponse = await axios.get(`${API_BASE_URL}/controls/${CONTROL_ID}`);
    const currentControl = getResponse.data.data;
    
    console.log(`Current category: ${currentControl.category}`);
    console.log(`Target category: ${CORRECT_CATEGORY}`);
    
    // Update the control with the correct category
    const updateData = {
      ...currentControl,
      category: CORRECT_CATEGORY
    };
    
    const updateResponse = await axios.put(`${API_BASE_URL}/controls/${CONTROL_ID}`, updateData);
    
    if (updateResponse.data.success) {
      console.log(`✓ Successfully updated ${CONTROL_ID} category to "${CORRECT_CATEGORY}"`);
      
      // Verify the update
      const verifyResponse = await axios.get(`${API_BASE_URL}/controls/${CONTROL_ID}`);
      const updatedControl = verifyResponse.data.data;
      console.log(`Verified category: ${updatedControl.category}`);
    } else {
      console.error(`✗ Failed to update ${CONTROL_ID}:`, updateResponse.data.error);
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data?.error || error.message);
    process.exit(1);
  }
}

// Run the fix
fixControlCategory().catch(console.error);