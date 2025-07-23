# Guide: Preventing Scripts from Using User Credentials

## Problem Overview
Google's authentication libraries automatically search for credentials in multiple locations, which can lead to scripts inadvertently using user credentials instead of service accounts. This causes "invalid_rapt" errors when user sessions expire.

## Credential Discovery Order
Google auth libraries check for credentials in this order:
1. `GOOGLE_APPLICATION_CREDENTIALS` environment variable
2. gcloud credentials at `~/.config/gcloud/application_default_credentials.json`
3. Google Cloud metadata server (for GCE/Cloud Run)
4. Other locations depending on the library

## Solutions to Force Service Account Usage

### 1. Explicitly Specify Service Account in Code
Always pass the service account key file explicitly:

```javascript
const { google } = require('googleapis');

// ✅ CORRECT: Explicit service account
const auth = new google.auth.GoogleAuth({
  keyFile: './path/to/service-account-key.json',
  scopes: ['https://www.googleapis.com/auth/drive']
});

// ❌ WRONG: Relies on default credential discovery
const auth = new google.auth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/drive']
});
```

### 2. Use Environment Variable
Set the environment variable before running scripts:

```bash
# In the script itself
process.env.GOOGLE_APPLICATION_CREDENTIALS = './path/to/service-account-key.json';

# Or when running the script
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json node script.js
```

### 3. Remove User Credentials
Clear any cached user credentials:

```bash
# Remove application default credentials
rm -rf ~/.config/gcloud/application_default_credentials.json

# Unset any auth-related environment variables
unset GOOGLE_APPLICATION_CREDENTIALS
unset GCLOUD_PROJECT
```

### 4. Script Template with Forced Service Account
Create a standard template for all scripts:

```javascript
// scripts/script-template.cjs
const path = require('path');
const { google } = require('googleapis');

// Force service account usage
const SERVICE_ACCOUNT_PATH = process.env.SERVICE_ACCOUNT_PATH || 
  path.join(__dirname, '../service-account-key.json');

// Verify service account file exists
const fs = require('fs');
if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(`Service account file not found: ${SERVICE_ACCOUNT_PATH}`);
  console.error('Please ensure service-account-key.json exists or set SERVICE_ACCOUNT_PATH');
  process.exit(1);
}

// Create auth with explicit service account
const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_PATH,
  scopes: ['https://www.googleapis.com/auth/drive']
});

// Verify we're using service account
auth.getClient().then(client => {
  if (client.email && client.email.includes('gserviceaccount.com')) {
    console.log(`✅ Using service account: ${client.email}`);
  } else {
    console.error('❌ Not using service account! Check configuration.');
    process.exit(1);
  }
});

module.exports = { auth };
```

### 5. Package.json Script Entries
Add script entries that enforce service account usage:

```json
{
  "scripts": {
    "script:cleanup": "GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json node scripts/cleanup.cjs",
    "script:maintenance": "GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json node scripts/maintenance.cjs"
  }
}
```

### 6. Create a Wrapper Script
Create a wrapper that ensures service account usage:

```javascript
// scripts/run-with-service-account.cjs
const { spawn } = require('child_process');
const path = require('path');

const scriptPath = process.argv[2];
if (!scriptPath) {
  console.error('Usage: node run-with-service-account.cjs <script-path>');
  process.exit(1);
}

// Set service account path
const serviceAccountPath = path.join(__dirname, '../service-account-key.json');
process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountPath;

// Clear any user auth
delete process.env.CLOUDSDK_AUTH_ACCESS_TOKEN;

// Run the script
const child = spawn('node', [scriptPath], {
  env: process.env,
  stdio: 'inherit'
});

child.on('exit', (code) => {
  process.exit(code);
});
```

## Best Practices

### 1. Never Use gcloud auth application-default login
This command creates user credentials that scripts will pick up:
```bash
# ❌ NEVER DO THIS on servers or for scripts
gcloud auth application-default login
```

### 2. Use Service Account JSON Files
Store service account keys securely:
```
project-root/
├── service-account-key.json  # Git-ignored
├── .env                      # Contains SERVICE_ACCOUNT_PATH
└── scripts/
    └── use-service-account.cjs
```

### 3. Add Validation to Scripts
Always validate that service account is being used:

```javascript
async function validateServiceAccount(auth) {
  const client = await auth.getClient();
  
  if (!client.email || !client.email.includes('gserviceaccount.com')) {
    throw new Error('Not using service account! Aborting to prevent auth errors.');
  }
  
  console.log(`Using service account: ${client.email}`);
  return true;
}
```

### 4. Document in README
Add clear instructions for developers:

```markdown
## Running Scripts

All scripts MUST use service account authentication:

1. Ensure `service-account-key.json` exists (get from team lead)
2. Run scripts using: `npm run script:name`
3. Never use `gcloud auth application-default login`
```

### 5. Add Pre-commit Hook
Prevent accidental credential commits:

```bash
#!/bin/sh
# .git/hooks/pre-commit

# Check for credential files
if git diff --cached --name-only | grep -E "(credentials|key)\.json"; then
  echo "❌ Attempting to commit credential files!"
  echo "Remove them with: git reset HEAD <file>"
  exit 1
fi
```

## Debugging Authentication Issues

### Check Current Credentials
```javascript
const auth = new google.auth.GoogleAuth();
const client = await auth.getClient();
console.log('Auth type:', client.constructor.name);
console.log('Email:', client.email || 'Not available');
```

### Force Service Account Verification
```javascript
if (client.constructor.name !== 'JWT' && client.constructor.name !== 'GoogleAuth') {
  throw new Error('Invalid auth type. Expected service account.');
}
```

## Summary Checklist
- [ ] Remove `~/.config/gcloud/application_default_credentials.json`
- [ ] Always specify `keyFile` in GoogleAuth constructor
- [ ] Set `GOOGLE_APPLICATION_CREDENTIALS` when needed
- [ ] Validate service account usage in scripts
- [ ] Document authentication requirements
- [ ] Never commit credential files
- [ ] Use API endpoints instead of direct Drive access when possible