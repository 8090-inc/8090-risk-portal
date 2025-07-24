# Scripts Directory

This directory contains utility scripts for the 8090 AI Risk Portal project.

## Available Scripts

### update-agreed-mitigations.cjs

Updates the agreed mitigation field for specific risks based on the provided diff requirements.

**Purpose**: Updates four specific risks with enhanced agreed mitigation text:
- Sensitive Information Leakage
- Copyright Infringements  
- Hackers Abuse In-House GenAI Solutions
- Unauthorized Information Access via LLMs

**Usage**:

```bash
# Dry run (preview changes without applying them)
node scripts/update-agreed-mitigations.cjs

# Or explicitly enable dry run
DRY_RUN=true node scripts/update-agreed-mitigations.cjs

# Apply actual changes
DRY_RUN=false node scripts/update-agreed-mitigations.cjs

# Use different API endpoint (default: http://localhost:8080)
API_BASE_URL=https://your-api-endpoint.com node scripts/update-agreed-mitigations.cjs
```

**Environment Variables**:
- `DRY_RUN` (default: `true`) - When `true`, shows what would be changed without making actual updates
- `API_BASE_URL` (default: `http://localhost:8080`) - Base URL for the risk API

**Prerequisites**:
- Backend server must be running on the specified API URL
- Node.js and npm packages installed (`axios` is required)

**Output**: The script provides detailed logging showing:
- Which risks were found/not found
- Current vs new agreed mitigation text
- Success/failure status for each update
- Summary statistics

### Other Scripts

#### check-drive-auth.cjs
Checks Google Drive authentication and service account access.

#### deploy-to-gcp.sh
Deployment script for Google Cloud Platform.

#### configure-iap-external.sh
Configures Identity-Aware Proxy for external access.

#### grant-iap-access.sh
Grants IAP access to specific users or groups.

#### inspect_excel_detailed.py
Python script for detailed Excel file inspection and validation.

#### list-drive-files.cjs
Lists files in the configured Google Drive folder.

## Development Guidelines

### Creating New Scripts

1. **File naming**: Use kebab-case with appropriate extension (`.cjs` for Node.js, `.py` for Python, `.sh` for shell)

2. **Documentation**: Include header comments explaining:
   - Purpose of the script
   - Required environment variables
   - Usage examples
   - Prerequisites

3. **Error handling**: Include proper error handling and meaningful error messages

4. **Logging**: Use clear, structured logging with prefixes (✅, ❌, 🔍, etc.)

5. **Dry run mode**: For scripts that modify data, implement a dry run mode

6. **Environment variables**: Use environment variables for configuration, provide sensible defaults

### Example Script Template

```javascript
#!/usr/bin/env node

/**
 * Script Name: your-script-name.cjs
 * Purpose: Brief description of what this script does
 * Usage: node scripts/your-script-name.cjs
 */

const DRY_RUN = process.env.DRY_RUN === 'true';

async function main() {
  console.log('🚀 Starting script...');
  
  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE: No actual changes will be made');
  }
  
  // Your script logic here
  
  console.log('✅ Script completed successfully');
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { main };
```

## Security Notes

- Scripts that access Google Drive use service account authentication
- Never commit API keys or credentials to the repository
- Use environment variables for sensitive configuration
- Test scripts in dry run mode before applying changes
- Always backup data before running scripts that modify production data

## Troubleshooting

### Common Issues

1. **"Cannot find module 'axios'"**: Run `npm install` to install dependencies

2. **API connection errors**: Ensure the backend server is running and accessible

3. **Authentication errors**: Check service account credentials and permissions

4. **Risk not found errors**: Verify risk names match exactly as they appear in the Excel file

5. **Permission denied**: Ensure the service account has write access to the Google Drive file

### Getting Help

- Check the script's built-in help by running it in dry run mode first
- Review the detailed logging output for specific error messages
- Verify all prerequisites are met (backend running, credentials configured, etc.)
- Check the main project documentation for API endpoint details
