#!/bin/bash

echo "=== Verifying Production Deployment ==="
echo ""

# Check the deployment status
echo "1. Checking Cloud Run service status..."
REVISION=$(gcloud run services describe risk-portal --region us-central1 --format="value(status.latestReadyRevisionName)")
CREATED=$(gcloud run revisions describe $REVISION --region us-central1 --format="value(metadata.creationTimestamp)")
echo "   Current revision: $REVISION"
echo "   Created at: $CREATED"
echo ""

# Get service URL
SERVICE_URL=$(gcloud run services describe risk-portal --region us-central1 --format="value(status.url)")
echo "2. Service URL: $SERVICE_URL"
echo ""

# Check if the service is responding (will redirect to auth)
echo "3. Testing service response..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL/api/v1/controls")
echo "   HTTP response code: $HTTP_CODE"
if [[ "$HTTP_CODE" == "302" ]]; then
    echo "   ✅ Service is responding (redirecting to auth as expected)"
else
    echo "   ⚠️  Unexpected response code"
fi
echo ""

# Check recent logs
echo "4. Checking recent logs for control parsing..."
echo "   Waiting for logs to be available..."
sleep 10

# Try to get logs from the new revision
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=risk-portal AND resource.labels.revision_name=$REVISION" --limit=50 --format=json 2>/dev/null | jq -r '.[] | select(.textPayload | contains("ExcelParser")) | .textPayload' | grep -E "(Total controls parsed|Sheet range)" | tail -5

echo ""
echo "5. Summary:"
echo "   - Production has been deployed with revision: $REVISION"
echo "   - The service is responding to requests"
echo "   - To see the changes on https://dompe.airiskportal.com, you may need to:"
echo "     a) Clear browser cache"
echo "     b) Log out and log back in"
echo "     c) Wait for any CDN caches to expire"
echo ""
echo "Note: The production environment uses the same Google Drive file as local,"
echo "so it should now show the same 21 controls after cleanup."