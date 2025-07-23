#!/usr/bin/env node

/**
 * Wrapper script to ensure all scripts use service account authentication
 * Usage: node scripts/run-with-service-account.cjs <script-path> [args...]
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get script path from arguments
const scriptPath = process.argv[2];
if (!scriptPath) {
  console.error('Usage: node run-with-service-account.cjs <script-path> [args...]');
  console.error('Example: node run-with-service-account.cjs ./scripts/cleanup.cjs');
  process.exit(1);
}

// Determine service account path
const serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH || 
  path.join(__dirname, '../service-account-key.json');

// Verify service account file exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Service account file not found: ${serviceAccountPath}`);
  console.error('\nPlease ensure one of the following:');
  console.error('1. service-account-key.json exists in the project root');
  console.error('2. SERVICE_ACCOUNT_PATH environment variable is set');
  console.error('\nTo get the service account key:');
  console.error('- Download from Google Cloud Console');
  console.error('- Or ask your team lead');
  process.exit(1);
}

console.log(`✅ Using service account: ${serviceAccountPath}`);

// Set up environment to force service account usage
const env = {
  ...process.env,
  GOOGLE_APPLICATION_CREDENTIALS: serviceAccountPath,
  // Ensure we're not using any cached user credentials
  CLOUDSDK_AUTH_ACCESS_TOKEN: undefined,
  GOOGLE_OAUTH_ACCESS_TOKEN: undefined
};

// Remove user credential environment variables
delete env.CLOUDSDK_AUTH_ACCESS_TOKEN;
delete env.GOOGLE_OAUTH_ACCESS_TOKEN;

// Pass remaining arguments to the script
const scriptArgs = process.argv.slice(3);

console.log(`Running: node ${scriptPath} ${scriptArgs.join(' ')}`);
console.log('---');

// Run the script with service account environment
const child = spawn('node', [scriptPath, ...scriptArgs], {
  env: env,
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('error', (error) => {
  console.error(`❌ Failed to run script: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`\n❌ Script terminated by signal: ${signal}`);
    process.exit(1);
  }
  process.exit(code || 0);
});