#!/bin/bash

# Set variables
PROJECT_ID="dompe-dev-439304"
TENANT_ID="dompe8090-bf0qr"
API_KEY="YOUR_API_KEY" # You'll need to get this from Firebase Console

# Function to create a user
create_user() {
  local email=$1
  local password=$2
  local displayName=$3
  
  echo "Creating user: $email"
  
  curl -X POST \
    "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}" \
    -H 'Content-Type: application/json' \
    -d "{
      \"email\": \"$email\",
      \"password\": \"$password\",
      \"displayName\": \"$displayName\",
      \"tenantId\": \"$TENANT_ID\",
      \"returnSecureToken\": true
    }"
  
  echo -e "\n"
}

# Create users
create_user "alexander.downey@ext.dompe.com" "downey" "Alexander Downey"
create_user "jonathan.yu@ext.dompe.com" "yu" "Jonathan Yu"
create_user "micah.taylor@ext.dompe.com" "taylor" "Micah Taylor"

echo "User creation completed!"