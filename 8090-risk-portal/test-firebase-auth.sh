#!/bin/bash

# Test Firebase authentication and get ID token

API_KEY="AIzaSyC4EUspTmYLmd468f9819cCHjo85pcu4_I"
EMAIL="rohit.kelapure@ext.dompe.com"
PASSWORD="kelapure"

echo "Testing Firebase authentication for $EMAIL..."

# Sign in with email and password
response=$(curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${EMAIL}\",
    \"password\": \"${PASSWORD}\",
    \"returnSecureToken\": true,
    \"tenantId\": \"dompe8090-bf0qr\"
  }")

# Check if authentication was successful
if echo "$response" | grep -q "idToken"; then
  ID_TOKEN=$(echo "$response" | jq -r '.idToken')
  REFRESH_TOKEN=$(echo "$response" | jq -r '.refreshToken')
  LOCAL_ID=$(echo "$response" | jq -r '.localId')
  
  echo "✓ Authentication successful!"
  echo "  User ID: $LOCAL_ID"
  echo "  ID Token: ${ID_TOKEN:0:50}..."
  echo ""
  
  # Save tokens for further testing
  echo "$ID_TOKEN" > /tmp/firebase_id_token.txt
  echo "$REFRESH_TOKEN" > /tmp/firebase_refresh_token.txt
  
  # Verify the ID token
  echo "Verifying ID token..."
  verify_response=$(curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"idToken\": \"${ID_TOKEN}\"}")
  
  if echo "$verify_response" | grep -q "users"; then
    echo "✓ ID token is valid"
    echo "$verify_response" | jq -r '.users[0] | "  Email: \(.email)\n  Display Name: \(.displayName)"'
  else
    echo "✗ Failed to verify ID token"
    echo "$verify_response" | jq .
  fi
  
else
  echo "✗ Authentication failed"
  echo "$response" | jq .
fi