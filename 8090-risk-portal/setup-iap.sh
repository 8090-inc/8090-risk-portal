#!/bin/bash

# Enable required APIs
echo "Enabling required APIs..."
gcloud services enable iap.googleapis.com
gcloud services enable compute.googleapis.com

# Create a backend service for the frontend
echo "Creating backend service for frontend..."
gcloud compute backend-services create risk-portal-frontend-backend \
  --global \
  --load-balancing-scheme=EXTERNAL \
  --protocol=HTTPS

# Create a NEG (Network Endpoint Group) for Cloud Run
echo "Creating NEG for Cloud Run frontend..."
gcloud compute network-endpoint-groups create risk-portal-frontend-neg \
  --region=us-central1 \
  --network-endpoint-type=serverless \
  --cloud-run-service=ai-risk-portal-frontend

# Add the NEG to the backend service
echo "Adding NEG to backend service..."
gcloud compute backend-services add-backend risk-portal-frontend-backend \
  --global \
  --network-endpoint-group=risk-portal-frontend-neg \
  --network-endpoint-group-region=us-central1

# Create URL map
echo "Creating URL map..."
gcloud compute url-maps create risk-portal-url-map \
  --default-service=risk-portal-frontend-backend

# Create HTTPS proxy
echo "Creating HTTPS proxy..."
gcloud compute target-https-proxies create risk-portal-https-proxy \
  --url-map=risk-portal-url-map

# Reserve a static IP
echo "Reserving static IP..."
gcloud compute addresses create risk-portal-ip \
  --global

# Get the IP address
IP_ADDRESS=$(gcloud compute addresses describe risk-portal-ip --global --format="value(address)")
echo "Reserved IP: $IP_ADDRESS"

# Create forwarding rule
echo "Creating forwarding rule..."
gcloud compute forwarding-rules create risk-portal-https-rule \
  --global \
  --address=risk-portal-ip \
  --target-https-proxy=risk-portal-https-proxy \
  --ports=443

# Enable IAP
echo "Enabling IAP..."
gcloud compute backend-services update risk-portal-frontend-backend \
  --global \
  --iap=enabled

# Add IAM policy for the allowed users
echo "Adding IAM policies..."
for user in rohit@8090.inc alex@8090.inc jonathan@8090.inc; do
  gcloud projects add-iam-policy-binding dompe-dev-439304 \
    --member="user:$user" \
    --role="roles/iap.httpsResourceAccessor"
done

echo "Setup complete!"
echo "Access your application at: https://$IP_ADDRESS"
echo "Note: You'll need to set up a custom domain and SSL certificate for HTTPS to work properly."