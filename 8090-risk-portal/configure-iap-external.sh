#!/bin/bash

# Configure IAP with external identities
PROJECT_ID="dompe-dev-439304"
PROJECT_NUMBER="290017403746"
TENANT_ID="dompe8090-bf0qr"
BACKEND_SERVICE="risk-portal-backend"

echo "Configuring IAP with Identity Platform tenant..."

# First, we need to get or create OAuth client for IAP
echo "Checking OAuth configuration..."

# Update backend service with IAP configuration
# Note: This requires the OAuth client ID which is created when you enable IAP in console
echo "
To complete IAP configuration with external identities:

1. First enable IAP in the console for the backend service
2. Note the OAuth client ID that gets created
3. Then run this command with the OAuth client ID:

gcloud compute backend-services update $BACKEND_SERVICE \\
  --global \\
  --iap=enabled,oauth2-client-id=<OAUTH_CLIENT_ID>,oauth2-client-secret=<OAUTH_CLIENT_SECRET>

For external identities, additional configuration in the console is required.
"

# Show current backend service IAP status
echo "Current IAP configuration:"
gcloud compute backend-services describe $BACKEND_SERVICE --global --format="yaml(iap)"