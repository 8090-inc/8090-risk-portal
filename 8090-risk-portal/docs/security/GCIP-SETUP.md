# GCIP (Google Cloud Identity Platform) Setup Guide

This guide provides detailed instructions for setting up Google Cloud Identity Platform for the 8090 AI Risk Portal.

## Overview

GCIP provides the authentication UI and user management for the application, working in conjunction with IAP for access control.

## Current Configuration

- **Project**: dompe-dev-439304
- **Tenant ID**: dompe8090-bf0qr
- **Auth Domain**: dompe-dev-439304.firebaseapp.com
- **Custom Auth URL**: https://dompe-dev-439304.web.app/auth.html

## Step 1: Enable Identity Platform

### 1.1 Enable Required APIs

```bash
# Enable Identity Platform API
gcloud services enable identitytoolkit.googleapis.com

# Enable Firebase Hosting (for auth pages)
gcloud services enable firebasehosting.googleapis.com
```

### 1.2 Initialize Identity Platform

```bash
# Set project
gcloud config set project dompe-dev-439304

# Initialize Identity Platform
gcloud identity-platform initialize
```

## Step 2: Create and Configure Tenant

### 2.1 Create Tenant

```bash
# Create a new tenant for Dompé
gcloud identity-platform tenants create dompe8090 \
  --display-name="Dompé farmaceutici S.p.A." \
  --allow-password-signup \
  --enable-email-link-signin=false \
  --enable-anonymous-users=false
```

### 2.2 Configure Tenant Settings

1. Go to [Identity Platform Console](https://console.cloud.google.com/customer-identity/tenants)
2. Select tenant `dompe8090-bf0qr`
3. Configure settings:
   - Display name: "Dompé AI Risk Portal"
   - Support email: support@dompe.com
   - Support URL: https://dompe.airiskportal.com/support

### 2.3 Set Password Policy

```javascript
// In Firebase Console or via API
{
  "passwordPolicy": {
    "minimumLength": 8,
    "requireUppercase": true,
    "requireLowercase": true,
    "requireNumeric": true,
    "requireNonAlphanumeric": false
  }
}
```

## Step 3: Configure Authentication Providers

### 3.1 Enable Email/Password Authentication

1. In Identity Platform, select your tenant
2. Go to "Providers" tab
3. Enable "Email/Password"
4. Configure:
   - Email verification: Not required (internal users)
   - Password reset: Enabled
   - Email link sign-in: Disabled

### 3.2 Configure Email Templates

1. Go to "Templates" tab
2. Customize email templates:

**Password Reset Email:**
```html
Subject: Reset your 8090 AI Risk Portal password

Hello,

You requested to reset your password for the 8090 AI Risk Portal.

Click here to reset your password: ${link}

If you didn't request this, please ignore this email.

Best regards,
Dompé IT Team
```

## Step 4: Set Up Firebase Hosting

### 4.1 Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 4.2 Initialize Firebase

```bash
cd 8090-risk-portal
firebase init hosting

# Select:
# - Project: dompe-dev-439304
# - Public directory: public
# - Single-page app: No
# - GitHub Actions: No
```

### 4.3 Configure firebase.json

```json
{
  "hosting": {
    "public": "public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [],
    "headers": [
      {
        "source": "**/*.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=3600"
          }
        ]
      }
    ]
  }
}
```

## Step 5: Implement Authentication UI

### 5.1 Create auth.html

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>8090 AI Risk Portal - Sign In</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/ui/6.1.0/firebase-ui-auth.js"></script>
  <link type="text/css" rel="stylesheet" href="https://www.gstatic.com/firebasejs/ui/6.1.0/firebase-ui-auth.css" />
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0;
      background: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .auth-container {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }
    .logo {
      text-align: center;
      margin-bottom: 2rem;
    }
    .logo h1 {
      color: #1E3A8A;
      font-size: 1.5rem;
      margin: 0;
    }
    .error-message {
      color: #dc3545;
      text-align: center;
      margin: 1rem 0;
    }
  </style>
</head>
<body>
  <div class="auth-container">
    <div class="logo">
      <h1>8090 AI Risk Portal</h1>
      <p>Dompé farmaceutici S.p.A.</p>
    </div>
    <div id="firebaseui-auth-container"></div>
    <div id="error-message" class="error-message"></div>
  </div>
  <script src="auth.js"></script>
</body>
</html>
```

### 5.2 Create auth.js

```javascript
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7kcZP61UW5W8-PEDrXL_kPNeI8VHvvmM",
  authDomain: "dompe-dev-439304.firebaseapp.com",
  projectId: "dompe-dev-439304"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get auth instance with tenant
const auth = firebase.auth();
auth.tenantId = 'dompe8090-bf0qr';

// Initialize FirebaseUI
const ui = new firebaseui.auth.AuthUI(auth);

// FirebaseUI configuration
const uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      // Handle successful sign-in
      console.log('Sign-in successful:', authResult.user.email);
      
      // Get the original URL from sessionStorage or default to home
      const originalUrl = sessionStorage.getItem('auth_redirect_url') || '/';
      sessionStorage.removeItem('auth_redirect_url');
      
      // Redirect with IAP authentication mode
      window.location.href = originalUrl + '?gcp-iap-mode=GCIP_AUTHENTICATING';
      return false;
    },
    signInFailure: function(error) {
      console.error('Sign-in failed:', error);
      document.getElementById('error-message').textContent = 
        'Authentication failed. Please try again.';
      return Promise.resolve();
    }
  },
  signInFlow: 'popup',
  signInOptions: [
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      requireDisplayName: false,
      signInMethod: 'password'
    }
  ],
  tosUrl: 'https://dompe.com/terms',
  privacyPolicyUrl: 'https://dompe.com/privacy',
  credentialHelper: firebaseui.auth.CredentialHelper.NONE
};

// Start FirebaseUI
ui.start('#firebaseui-auth-container', uiConfig);

// Store the original URL if redirected from IAP
const urlParams = new URLSearchParams(window.location.search);
const redirectUrl = urlParams.get('redirect_url');
if (redirectUrl) {
  sessionStorage.setItem('auth_redirect_url', redirectUrl);
}
```

## Step 6: Deploy Authentication Pages

### 6.1 Deploy to Firebase Hosting

```bash
# Deploy auth pages
firebase deploy --only hosting

# Output should show:
# Hosting URL: https://dompe-dev-439304.web.app
```

### 6.2 Verify Deployment

```bash
# Test auth page is accessible
curl https://dompe-dev-439304.web.app/auth.html
```

## Step 7: Configure IAP Integration

### 7.1 Link GCIP to IAP

1. Go to [IAP Console](https://console.cloud.google.com/security/iap)
2. Select your backend service
3. Click "Edit" 
4. Under "Sign-in page", select "I'll provide my own"
5. Enter: `https://dompe-dev-439304.web.app/auth.html`

### 7.2 Configure Redirect URIs

In Firebase Console:
1. Go to Authentication > Settings
2. Add authorized domains:
   - `dompe-dev-439304.web.app`
   - `dompe-dev-439304.firebaseapp.com`
   - `dompe.airiskportal.com`

## Step 8: User Management

### 8.1 Add Initial Users

```javascript
// Via Admin SDK or Firebase Console
const admin = require('firebase-admin');

admin.initializeApp();

// Create user
admin.auth().createUser({
  email: 'admin@dompe.com',
  password: 'TempPassword123!',
  displayName: 'Admin User',
  emailVerified: true
})
.then((userRecord) => {
  console.log('Successfully created user:', userRecord.uid);
})
.catch((error) => {
  console.error('Error creating user:', error);
});
```

### 8.2 Bulk User Import

```bash
# Create users.csv
echo "email,password,displayName
user1@dompe.com,TempPass123!,User One
user2@dompe.com,TempPass123!,User Two" > users.csv

# Import users
firebase auth:import users.csv \
  --tenant-id=dompe8090-bf0qr \
  --hash-algo=HMAC_SHA256 \
  --hash-key=your-hash-key
```

## Step 9: Testing

### 9.1 Test Authentication Flow

1. **Direct GCIP Test:**
```javascript
// Test authentication directly
firebase.auth().signInWithEmailAndPassword('test@dompe.com', 'password')
  .then((result) => {
    console.log('Auth successful:', result.user);
  })
  .catch((error) => {
    console.error('Auth failed:', error);
  });
```

2. **Full IAP Flow Test:**
- Clear all cookies
- Navigate to https://dompe.airiskportal.com
- Should redirect to auth page
- Sign in with test credentials
- Should redirect back to application

### 9.2 Verify Token Exchange

```javascript
// In browser console after auth
firebase.auth().currentUser.getIdToken()
  .then((token) => {
    console.log('ID Token:', token);
    // Decode at jwt.io to verify claims
  });
```

## Step 10: Monitoring and Maintenance

### 10.1 Monitor Authentication

```bash
# View authentication logs
gcloud logging read "resource.labels.service_name=identitytoolkit.googleapis.com" \
  --limit=50 \
  --format=json
```

### 10.2 Usage Metrics

1. Go to Firebase Console > Authentication > Usage
2. Monitor:
   - Daily active users
   - Authentication methods used
   - Failed authentication attempts

### 10.3 Regular Maintenance

**Weekly:**
- Check authentication logs for anomalies
- Review failed login attempts
- Monitor user growth

**Monthly:**
- Review and remove inactive users
- Update email templates if needed
- Check for security advisories

**Quarterly:**
- Audit user list
- Update password policies
- Review authentication providers

## Troubleshooting

### Common Issues

1. **"Auth/tenant-id-mismatch" Error**
```javascript
// Ensure tenant ID is set before auth operations
auth.tenantId = 'dompe8090-bf0qr';
```

2. **"Permission Denied" on Firebase Hosting**
```bash
# Grant hosting admin role
gcloud projects add-iam-policy-binding dompe-dev-439304 \
  --member=user:your-email@domain.com \
  --role=roles/firebasehosting.admin
```

3. **Users Can't Sign In**
- Check user exists in correct tenant
- Verify password meets policy requirements
- Check if email verification is required
- Review authentication logs

### Debug Mode

Enable debug logging:
```javascript
// In auth.js
firebase.auth().settings.appVerificationDisabledForTesting = true;
window.localStorage.setItem('firebase:debug:enabled', 'true');
```

## Security Considerations

1. **API Key Security:**
   - Restrict API key to specific domains
   - Enable only required APIs
   - Monitor usage in Google Cloud Console

2. **User Data Protection:**
   - Enable audit logs
   - Implement proper session management
   - Use secure password policies

3. **Regular Security Reviews:**
   - Audit authentication logs
   - Review user permissions
   - Update dependencies
   - Check for security advisories