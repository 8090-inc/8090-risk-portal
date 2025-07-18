#!/bin/bash

# List users in Identity Platform tenant using Firebase Admin SDK REST API

TENANT_ID="dompe8090-bf0qr"
PROJECT_ID="dompe-dev-439304"
ACCESS_TOKEN=$(gcloud auth print-access-token)

echo "Checking users in tenant ${TENANT_ID}..."
echo ""

# Use the accounts:query endpoint to list all users
response=$(curl -s -X POST "https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/tenants/${TENANT_ID}/accounts:query" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "X-Goog-User-Project: ${PROJECT_ID}" \
    -H "Content-Type: application/json" \
    -d '{
        "returnUserInfo": true,
        "expression": []
    }')

# Check if we got an error
if echo "$response" | grep -q '"error"'; then
    echo "Error listing users:"
    echo "$response" | jq .
else
    # Parse and display users
    echo "$response" | jq -r '.userInfo[]? | "Email: \(.email // "N/A") | Display Name: \(.displayName // "N/A") | ID: \(.localId // "N/A")"'
    
    # Count users
    user_count=$(echo "$response" | jq '.userInfo | length' 2>/dev/null || echo "0")
    echo ""
    echo "Total users in tenant: ${user_count}"
fi