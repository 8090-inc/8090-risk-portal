# IAP Sign-in Page Exception Request

The automatic IAP sign-in page requires public access to function properly. To allow this while maintaining security:

## Temporary Workaround

1. Create the sign-in service manually with domain-restricted access:

```bash
# Deploy a custom sign-in page that only allows your domain
gcloud run deploy iap-signin-risk-portal \
  --image=gcr.io/iap-gcip/iap-gcip-hosted-ui:latest \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --set-env-vars="IAP_BACKEND_SERVICE_ID=risk-portal-backend,TENANT_ID=dompe8090-bf0qr"
```

2. Add IAM policy for specific domains instead of allUsers:

```bash
gcloud run services add-iam-policy-binding iap-signin-risk-portal \
  --region=us-central1 \
  --member="domain:ext.dompe.com" \
  --role="roles/run.invoker"
```

## Recommended Solution

For now, select "I'll provide my own" in the IAP configuration and implement the authentication flow in your application using the Identity Platform SDK.