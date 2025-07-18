#!/bin/bash

# Import users with @dompe.com domain to Identity Platform tenant

TENANT_ID="dompe8090-bf0qr"
PROJECT_ID="dompe-dev-439304"
ACCESS_TOKEN=$(gcloud auth print-access-token)

# Base URL for Identity Platform API
BASE_URL="https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/tenants/${TENANT_ID}"

echo "Importing users to tenant ${TENANT_ID}..."

# Function to create a user
create_user() {
    local email="$1"
    local password="$2"
    local displayName="$3"
    
    echo -n "Creating user: ${email}... "
    
    response=$(curl -s -X POST "${BASE_URL}/accounts" \
        -H "Authorization: Bearer ${ACCESS_TOKEN}" \
        -H "X-Goog-User-Project: ${PROJECT_ID}" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"${email}\",
            \"password\": \"${password}\",
            \"displayName\": \"${displayName}\",
            \"emailVerified\": true,
            \"disabled\": false
        }")
    
    if echo "$response" | grep -q "localId"; then
        local_id=$(echo "$response" | grep -o '"localId":"[^"]*"' | cut -d'"' -f4)
        echo "✓ Created (ID: ${local_id})"
    elif echo "$response" | grep -q "EMAIL_EXISTS"; then
        echo "⚠ Already exists"
    else
        echo "✗ Failed"
        echo "  Error: $response"
    fi
}

# Create users
create_user "user.one@dompe.com" "password123" "User One"
create_user "user.two@dompe.com" "password123" "User Two"
create_user "admin@dompe.com" "password123" "Admin User"
create_user "test.user@dompe.com" "password123" "Test User"

echo ""
echo "User import complete!"