#!/bin/bash

echo "=== Testing Complete Authentication Flow ==="
echo ""

# 1. Test Cloud Run service directly
echo "1. Testing Cloud Run service directly:"
SERVICE_URL="https://risk-portal-290017403746.us-central1.run.app"
TOKEN=$(gcloud auth print-identity-token)

echo "   a. Testing health endpoint:"
health_response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -H "Authorization: Bearer $TOKEN" "$SERVICE_URL/health")
health_code=$(echo "$health_response" | grep "HTTP_CODE:" | cut -d':' -f2)
health_body=$(echo "$health_response" | sed '/HTTP_CODE:/d')

if [ "$health_code" = "200" ]; then
  echo "      ✓ Health endpoint working"
  echo "      Response: $health_body"
else
  echo "      ✗ Health endpoint failed (HTTP $health_code)"
  echo "      Response: $health_body"
fi

echo ""
echo "   b. Testing API endpoint:"
api_response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -H "Authorization: Bearer $TOKEN" "$SERVICE_URL/api/auth/me")
api_code=$(echo "$api_response" | grep "HTTP_CODE:" | cut -d':' -f2)
api_body=$(echo "$api_response" | sed '/HTTP_CODE:/d')

if [ "$api_code" = "200" ] || [ "$api_code" = "401" ]; then
  echo "      ✓ API endpoint working"
  echo "      Response: $api_body"
else
  echo "      ✗ API endpoint failed (HTTP $api_code)"
fi

echo ""
echo "   c. Testing React app:"
react_response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -H "Authorization: Bearer $TOKEN" "$SERVICE_URL/" | head -20)
if echo "$react_response" | grep -q "<div id=\"root\">"; then
  echo "      ✓ React app is being served"
else
  echo "      ✗ React app not found"
  echo "$react_response"
fi

echo ""
echo "2. Testing Load Balancer with IAP:"
LB_URL="https://34.102.196.90"

echo "   a. Testing redirect:"
redirect_response=$(curl -s -k -w "\nHTTP_CODE:%{http_code}" "$LB_URL/" | tail -1)
if [ "$redirect_response" = "HTTP_CODE:302" ]; then
  echo "      ✓ IAP redirect working"
else
  echo "      ✗ IAP redirect failed (HTTP $redirect_response)"
fi

echo ""
echo "3. Testing Firebase Hosting:"
firebase_response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "https://dompe-dev-439304.web.app/auth.html" | tail -1)
if [ "$firebase_response" = "HTTP_CODE:200" ]; then
  echo "      ✓ Firebase hosting working"
else
  echo "      ✗ Firebase hosting failed (HTTP $firebase_response)"
fi

echo ""
echo "=== Summary ==="
echo "Cloud Run URL: $SERVICE_URL"
echo "Load Balancer URL: $LB_URL"
echo "Firebase Hosting: https://dompe-dev-439304.web.app"