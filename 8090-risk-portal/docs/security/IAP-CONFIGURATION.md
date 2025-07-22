# IAP Configuration Guide

This guide provides step-by-step instructions for configuring Google Cloud Identity-Aware Proxy (IAP) for the 8090 AI Risk Portal.

## Prerequisites

- Google Cloud Project: `dompe-dev-439304`
- Domain: `dompe.airiskportal.com`
- Cloud Run service deployed: `risk-portal`
- SSL certificate configured
- OAuth consent screen configured

## Step 1: Create Backend Service

### 1.1 Reserve External IP Address

```bash
# Reserve a static IP for the load balancer
gcloud compute addresses create risk-portal-ip \
  --global \
  --ip-version IPV4

# Get the IP address (should be 34.102.196.90)
gcloud compute addresses describe risk-portal-ip --global
```

### 1.2 Create Network Endpoint Group (NEG)

```bash
# Create a serverless NEG for Cloud Run
gcloud compute network-endpoint-groups create risk-portal-neg \
  --region=us-central1 \
  --network-endpoint-type=serverless \
  --cloud-run-service=risk-portal
```

### 1.3 Create Backend Service

```bash
# Create backend service
gcloud compute backend-services create risk-portal-frontend-backend \
  --global \
  --load-balancing-scheme=EXTERNAL \
  --protocol=HTTPS

# Add the NEG to backend service
gcloud compute backend-services add-backend risk-portal-frontend-backend \
  --global \
  --network-endpoint-group=risk-portal-neg \
  --network-endpoint-group-region=us-central1
```

## Step 2: Configure Load Balancer

### 2.1 Create URL Map

```bash
# Create URL map
gcloud compute url-maps create risk-portal-lb \
  --default-service risk-portal-frontend-backend
```

### 2.2 Create SSL Certificate

```bash
# Create managed SSL certificate
gcloud compute ssl-certificates create risk-portal-cert \
  --domains=dompe.airiskportal.com \
  --global
```

### 2.3 Create HTTPS Proxy

```bash
# Create target HTTPS proxy
gcloud compute target-https-proxies create risk-portal-https-proxy \
  --url-map=risk-portal-lb \
  --ssl-certificates=risk-portal-cert \
  --global
```

### 2.4 Create Forwarding Rule

```bash
# Create forwarding rule
gcloud compute forwarding-rules create risk-portal-https-rule \
  --address=risk-portal-ip \
  --target-https-proxy=risk-portal-https-proxy \
  --ports=443 \
  --global
```

## Step 3: Enable IAP

### 3.1 Enable Required APIs

```bash
# Enable IAP API
gcloud services enable iap.googleapis.com

# Enable Identity Platform API (for GCIP)
gcloud services enable identitytoolkit.googleapis.com
```

### 3.2 Configure OAuth Consent Screen

1. Go to [APIs & Services > OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. Select "Internal" for user type
3. Fill in required fields:
   - App name: "8090 AI Risk Portal"
   - User support email: admin@dompe.com
   - Developer contact: tech@8090.inc
4. Add scopes:
   - `openid`
   - `email`
   - `profile`

### 3.3 Create OAuth Client

```bash
# Create OAuth 2.0 client for IAP
gcloud alpha iap oauth-clients create \
  --display-name="Risk Portal IAP Client" \
  --redirect-uris="https://dompe.airiskportal.com/_gcp_gatekeeper/authenticate"
```

### 3.4 Enable IAP on Backend Service

```bash
# Enable IAP
gcloud iap web enable \
  --resource-type=backend-services \
  --service=risk-portal-frontend-backend
```

## Step 4: Configure IAP Settings

### 4.1 Set IAP Authentication

Since organization policy blocks `allUsers`, use custom authentication:

```bash
# Configure IAP to use external identity provider
gcloud iap settings set \
  --resource-type=backend-services \
  --service=risk-portal-frontend-backend \
  --login-hint="Use your Dompé email address" \
  --gcip-tenant="dompe8090-bf0qr" \
  --authentication-redirect-url="https://dompe-dev-439304.web.app/auth.html"
```

### 4.2 Add Authorized Users

```bash
# Add individual users
gcloud iap web add-iam-policy-binding \
  --resource-type=backend-services \
  --service=risk-portal-frontend-backend \
  --member=user:rohit@8090.inc \
  --role=roles/iap.httpsResourceAccessor

gcloud iap web add-iam-policy-binding \
  --resource-type=backend-services \
  --service=risk-portal-frontend-backend \
  --member=user:alex@8090.inc \
  --role=roles/iap.httpsResourceAccessor

gcloud iap web add-iam-policy-binding \
  --resource-type=backend-services \
  --service=risk-portal-frontend-backend \
  --member=user:jonathan@8090.inc \
  --role=roles/iap.httpsResourceAccessor
```

### 4.3 Add Domain-wide Access (if allowed by org policy)

```bash
# Add domain-wide access
gcloud iap web add-iam-policy-binding \
  --resource-type=backend-services \
  --service=risk-portal-frontend-backend \
  --member=domain:dompe.com \
  --role=roles/iap.httpsResourceAccessor
```

## Step 5: Configure GCIP Integration

### 5.1 Link GCIP Tenant to IAP

1. Go to [Identity Platform](https://console.cloud.google.com/customer-identity)
2. Select tenant: `dompe8090-bf0qr`
3. Go to Settings > Integration
4. Enable "Identity-Aware Proxy integration"
5. Select the IAP resource

### 5.2 Configure Authentication Providers

1. In Identity Platform, go to Providers
2. Enable Email/Password provider
3. Configure password requirements:
   - Minimum length: 8 characters
   - Require uppercase: Yes
   - Require numeric: Yes

### 5.3 Deploy Authentication Page

The authentication page (`auth.html`) must be accessible:

```bash
# Ensure auth.html is served by Cloud Run
# In server.cjs:
app.get('/auth.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});
```

## Step 6: DNS Configuration

### 6.1 Update DNS Records

Add A record pointing to the load balancer IP:

```
Type: A
Name: dompe.airiskportal.com
Value: 34.102.196.90
TTL: 300
```

### 6.2 Verify SSL Certificate

Wait for SSL certificate to be provisioned (can take up to 60 minutes):

```bash
# Check certificate status
gcloud compute ssl-certificates describe risk-portal-cert --global
```

## Step 7: Testing

### 7.1 Test IAP Protection

```bash
# Should return 401 or redirect to auth
curl -I https://dompe.airiskportal.com/api/v1/risks
```

### 7.2 Test Authentication Flow

1. Open browser in incognito mode
2. Navigate to https://dompe.airiskportal.com
3. Should redirect to authentication page
4. Login with authorized email
5. Should redirect back to application

### 7.3 Verify Headers

```bash
# Test with authenticated session
curl -H "Cookie: GCP_IAAP_AUTH_TOKEN=..." \
  https://dompe.airiskportal.com/api/auth/me
```

## Step 8: Monitoring

### 8.1 Enable IAP Logs

```bash
# Enable audit logs for IAP
gcloud logging read "resource.type=iap_web" \
  --limit=50 \
  --format=json
```

### 8.2 Set Up Alerts

Create alerts for:
- Failed authentication attempts
- Changes to IAP configuration
- Unusual access patterns

## Troubleshooting

### Common Issues

1. **"Permission Denied" Error**
   - Verify user is in IAP access list
   - Check OAuth consent screen is configured
   - Ensure cookies are enabled

2. **Redirect Loop**
   - Check authentication URL is correct
   - Verify GCIP tenant ID matches
   - Clear browser cookies and retry

3. **SSL Certificate Not Working**
   - Wait up to 60 minutes for provisioning
   - Verify DNS is pointing to correct IP
   - Check certificate status in console

### Debug Commands

```bash
# Check IAP status
gcloud iap web get-iam-policy \
  --resource-type=backend-services \
  --service=risk-portal-frontend-backend

# View load balancer configuration
gcloud compute backend-services describe risk-portal-frontend-backend --global

# Check Cloud Run service
gcloud run services describe risk-portal --region=us-central1
```

## Maintenance

### Regular Tasks

1. **Monthly:**
   - Review IAP access list
   - Check authentication logs
   - Verify SSL certificate renewal

2. **Quarterly:**
   - Audit OAuth consent screen
   - Review GCIP configuration
   - Update authorized redirect URIs

3. **Annually:**
   - Full security audit
   - Update documentation
   - Review architecture

### Updating Configuration

When making changes:

1. Test in staging environment first
2. Document all changes
3. Have rollback plan ready
4. Monitor closely after changes
5. Update this documentation