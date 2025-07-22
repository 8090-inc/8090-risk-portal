# Authentication Architecture

This document describes the complete authentication architecture for the 8090 AI Risk Portal, including IAP (Identity-Aware Proxy) and GCIP (Google Cloud Identity Platform) integration.

## Overview

The application uses a multi-layered authentication approach:
1. **Google Cloud IAP** - Primary authentication and access control
2. **Google Cloud Identity Platform (GCIP)** - User identity management
3. **Express Middleware** - Backend authentication and authorization
4. **Frontend Auth Store** - Client-side authentication state management

## Authentication Flow

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────────┐
│   Browser   │      │ Load Balancer│      │     IAP     │      │  Cloud Run   │
│             │      │ 34.102.196.90│      │             │      │  risk-portal │
└──────┬──────┘      └──────┬───────┘      └──────┬──────┘      └──────┬───────┘
       │                     │                     │                     │
       │ 1. Request          │                     │                     │
       │ dompe.airiskportal.com                    │                     │
       ├────────────────────>│                     │                     │
       │                     │                     │                     │
       │                     │ 2. Forward to IAP  │                     │
       │                     ├────────────────────>│                     │
       │                     │                     │                     │
       │                     │                     │ 3. Check Auth      │
       │                     │                     │ Cookie             │
       │                     │                     │                     │
       │                     │ 4. No Cookie/Invalid                     │
       │                     │ Redirect to GCIP    │                     │
       │<────────────────────┼─────────────────────┤                     │
       │                     │                     │                     │
       │ 5. Load auth.html   │                     │                     │
       ├────────────────────────────────────────────────────────────────>│
       │                     │                     │                     │
       │ 6. GCIP/Firebase    │                     │                     │
       │ Authentication      │                     │                     │
       │                     │                     │                     │
       │ 7. Token Exchange   │                     │                     │
       │ ?gcp-iap-mode=GCIP_AUTHENTICATING         │                     │
       ├────────────────────>├────────────────────>│                     │
       │                     │                     │                     │
       │                     │ 8. Set IAP Cookie  │                     │
       │<────────────────────┼─────────────────────┤                     │
       │                     │                     │                     │
       │ 9. Redirect to App  │                     │                     │
       ├────────────────────>├────────────────────>├────────────────────>│
       │                     │                     │                     │
       │                     │                     │ 10. Add Headers:   │
       │                     │                     │ X-Goog-Authenticated-User-Email
       │                     │                     │ X-Goog-IAP-JWT-Assertion
       │                     │                     │                     │
       │ 11. Response        │                     │                     │
       │<────────────────────┼─────────────────────┼─────────────────────┤
       │                     │                     │                     │
```

## Backend Authentication

### 1. IAP Header Processing

IAP injects the following headers into requests:
- `X-Goog-Authenticated-User-Email`: Format `accounts.google.com:user@domain.com`
- `X-Goog-Authenticated-User-Id`: Format `accounts.google.com:1234567890`
- `X-Goog-IAP-JWT-Assertion`: JWT token for verification (optional)

### 2. Authentication Middleware (`server/middleware/auth.cjs`)

```javascript
const authenticate = (req, res, next) => {
  // Extract IAP headers
  const iapEmail = req.headers['x-goog-authenticated-user-email'];
  const iapUserId = req.headers['x-goog-authenticated-user-id'];
  
  if (iapEmail) {
    // Parse email from IAP format
    const email = iapEmail.replace('accounts.google.com:', '');
    const userId = iapUserId ? iapUserId.replace('accounts.google.com:', '') : null;
    
    // Create user object
    req.user = {
      email: email,
      id: userId || email.split('@')[0],
      name: email.split('@')[0],
      role: determineRole(email)
    };
  }
  
  // Development mode bypass
  if (process.env.NODE_ENV === 'development' && !iapEmail) {
    req.user = {
      email: 'dev.user@dompe.com',
      id: 'dev-user',
      name: 'dev.user',
      role: 'admin'
    };
  }
  
  next();
};
```

### 3. Role Assignment

Roles are assigned based on email domain:
- `@dompe.com` → `admin` (full access)
- `@8090.inc` → `admin` (full access)
- Others → `viewer` (read-only access)

### 4. API Protection

All API routes under `/api/v1` are protected:
```javascript
// In server/api/v1/index.cjs
router.use(authenticate); // Apply to all v1 routes
```

## Frontend Authentication

### 1. Auth Store (`src/store/authStore.ts`)

The frontend uses Zustand for authentication state management:

```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => void;
}
```

### 2. Authentication Check

On app load, the frontend calls `/api/auth/me` to verify authentication:

```typescript
const checkAuth = async () => {
  const response = await fetch('/api/auth/me');
  const data = await response.json();
  
  if (data.authenticated && data.user) {
    set({
      isAuthenticated: true,
      user: data.user,
      loading: false
    });
  }
};
```

### 3. Logout Flow

Logout redirects to IAP signout:
```typescript
const logout = () => {
  window.location.href = '/?gcp-iap-mode=GCIP_SIGNOUT';
};
```

## GCIP Configuration

### 1. Identity Platform Setup

- **Project**: dompe-dev-439304
- **Tenant**: dompe8090-bf0qr
- **Providers**: Email/Password authentication
- **Custom domain**: dompe-dev-439304.web.app

### 2. Firebase Auth Configuration (`public/auth.js`)

```javascript
const config = {
  apiKey: "AIzaSyD7kcZP61UW5W8-PEDrXL_kPNeI8VHvvmM",
  authDomain: "dompe-dev-439304.firebaseapp.com",
  signInOptions: [{
    provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
    requireDisplayName: false
  }],
  tenantId: 'dompe8090-bf0qr'
};
```

### 3. Token Exchange

After successful GCIP authentication:
1. Firebase Auth issues an ID token
2. Browser redirects to `/?gcp-iap-mode=GCIP_AUTHENTICATING`
3. IAP validates the token and creates a session
4. User is redirected back to the application

## Security Considerations

### 1. Production Requirements

- IAP must be enabled on the load balancer
- Backend service must NOT have `--allow-unauthenticated` flag
- CORS must be properly configured
- Service account must have minimal required permissions

### 2. Local Development

In development mode:
- IAP headers are not present
- Auth middleware provides a test user
- Frontend always receives authenticated response
- No actual authentication occurs

### 3. Environment Variables

Required for production:
- `GOOGLE_SERVICE_ACCOUNT_KEY`: Service account JSON
- `GOOGLE_DRIVE_FILE_ID`: Excel file ID
- `NODE_ENV`: Must be 'production' for IAP validation
- `PORT`: Cloud Run port (default 8080)

## Testing Authentication

### 1. Verify IAP Headers

```bash
# Check if IAP headers are present
curl -H "X-Goog-Authenticated-User-Email: accounts.google.com:test@dompe.com" \
     http://localhost:8080/api/auth/me
```

### 2. Test Role Assignment

Different email domains should receive appropriate roles:
- `user@dompe.com` → admin
- `user@8090.inc` → admin  
- `user@external.com` → viewer

### 3. Verify API Protection

Unauthenticated requests should fail:
```bash
# Should return 401 in production
curl http://localhost:8080/api/v1/risks
```

## Troubleshooting

See [AUTH-TROUBLESHOOTING.md](./AUTH-TROUBLESHOOTING.md) for common issues and solutions.