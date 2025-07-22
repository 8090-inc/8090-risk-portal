#!/bin/bash
# Google Cloud Deployment Script for 8090 Risk Portal

set -e  # Exit on error

echo "🚀 Starting deployment to Google Cloud Run..."

# Step 1: Build the application (already done)
echo "✅ Step 1: Application already built"

# Step 2: Build Docker image
echo "📦 Step 2: Building Docker image..."
docker build --platform linux/amd64 -t gcr.io/dompe-dev-439304/risk-portal:latest .

# Step 3: Push to Google Container Registry
echo "⬆️  Step 3: Pushing image to GCR..."
docker push gcr.io/dompe-dev-439304/risk-portal:latest

# Step 4: Deploy to Cloud Run
echo "☁️  Step 4: Deploying to Cloud Run..."
gcloud run deploy risk-portal \
  --image gcr.io/dompe-dev-439304/risk-portal:latest \
  --region us-central1 \
  --port 8080 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,GOOGLE_DRIVE_FILE_ID=1OzrkAUQTWY7VUNrX-_akCWIuU2ALR3sm" \
  --project dompe-dev-439304

echo "✅ Deployment complete!"
echo ""
echo "📋 Post-deployment checklist:"
echo "   - Check service at: https://console.cloud.google.com/run/detail/us-central1/risk-portal/metrics?project=dompe-dev-439304"
echo "   - Test application at: https://dompe.airiskportal.com"
echo "   - Monitor logs at: https://console.cloud.google.com/logs?project=dompe-dev-439304"