# IAP Setup Options for 8090 Risk Portal

## Current Situation
- Cloud Run service is private (no --allow-unauthenticated)
- Load Balancer returns 403 Forbidden
- You want your app's login flow to be primary

## Option 1: Remove IAP and Use Alternative Access Methods

### A. VPN Access
```bash
# Set up Cloud VPN for secure private access
# Users connect via VPN, then access http://34.102.196.90
```

### B. Cloud Identity-Aware Proxy with Passthrough
Configure IAP to only verify that users are from your organization domain, then let your app handle auth:

```bash
# Configure IAP for domain-wide access
gcloud projects add-iam-policy-binding dompe-dev-439304 \
  --member='domain:8090.inc' \
  --role='roles/iap.httpsResourceAccessor'
```

## Option 2: Make Cloud Run Public with App-Level Security

```bash
# Update Cloud Run to allow unauthenticated access
gcloud run services add-iam-policy-binding risk-portal \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/run.invoker"

# Your app handles all authentication
```

## Option 3: Use a Different Architecture

### API Gateway + Cloud Run
```bash
# Deploy API Gateway in front of private Cloud Run
# API Gateway handles authentication
# Your app validates tokens
```

## Recommended Approach

Given your requirements:
1. Keep Cloud Run private
2. Use your login flow as primary
3. Organization policy restrictions

**Best Option: Use Cloud Endpoints or API Gateway**

This allows:
- Cloud Run stays private
- Public endpoint through API Gateway
- Your login flow remains primary
- No IAP complexity
- Complies with organization policies

Would you like me to implement this approach?