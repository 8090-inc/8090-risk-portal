# IAP Setup Instructions

## Current Status

✅ Load Balancer created with IP: 34.102.196.90
✅ IAP enabled on the backend service
✅ Authorized users configured:
   - rohit@8090.inc
   - alex@8090.inc
   - jonathan@8090.inc

## Next Steps

### 1. Configure OAuth Consent Screen

1. Go to https://console.cloud.google.com/apis/credentials/consent
2. Select "Internal" (for 8090.inc users only)
3. Fill in:
   - App name: Risk Portal
   - User support email: rohit@8090.inc
   - Authorized domains: 8090.inc
   - Developer contact: rohit@8090.inc

### 2. Create OAuth 2.0 Client ID for IAP

1. Go to https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Name: "IAP-Risk-Portal"
5. Add Authorized redirect URIs:
   - https://iap.googleapis.com/v1/oauth/clientIds/YOUR_CLIENT_ID:handleRedirect

### 3. Configure IAP

```bash
# After creating OAuth credentials, configure IAP:
gcloud iap web enable --resource-type=backend-services \
  --oauth2-client-id=YOUR_CLIENT_ID \
  --oauth2-client-secret=YOUR_CLIENT_SECRET \
  --service=risk-portal-frontend-backend
```

### 4. Set up Custom Domain (Optional)

Add a DNS A record:
- Host: risk-portal
- Type: A
- Value: 34.102.196.90

### 5. Update Frontend Environment

The frontend needs to handle IAP authentication headers. Update the API calls to include:
- `X-Goog-Authenticated-User-Email`: User's email
- `X-Goog-IAP-JWT-Assertion`: JWT token from IAP

## Testing

Once configured, access your application at:
- https://34.102.196.90 (will show certificate warning)
- https://risk-portal.8090.inc (after DNS setup)

Only authorized users (@8090.inc) will be able to access the application.