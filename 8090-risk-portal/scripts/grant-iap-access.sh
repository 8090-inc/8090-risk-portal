#!/bin/bash

# Grant IAP-secured Web App User role to team members
PROJECT_ID="dompe-dev-439304"
BACKEND_SERVICE="risk-portal-backend"

echo "Granting IAP access to team members..."

# List of users to grant access
users=(
  "alexander.downey@ext.dompe.com"
  "jonathan.yu@ext.dompe.com"
  "micah.taylor@ext.dompe.com"
  "rohit.kelapure@ext.dompe.com"
)

# Grant IAP-secured Web App User role to each user
for user in "${users[@]}"; do
  echo "Granting access to: $user"
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="user:$user" \
    --role="roles/iap.httpsResourceAccessor" \
    --condition=None
done

echo -e "\nIAP access granted to all team members!"
echo -e "\nTo verify IAM bindings:"
echo "gcloud projects get-iam-policy $PROJECT_ID --flatten=\"bindings[].members\" --filter=\"bindings.role:roles/iap.httpsResourceAccessor\""