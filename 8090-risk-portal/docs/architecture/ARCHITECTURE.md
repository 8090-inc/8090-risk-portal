# 8090 Risk Portal - Deployment Architecture

## ASCII Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   Google Cloud Platform                                   │
│                                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │                              External User Access                                │    │
│  └─────────────────────────────────┬───────────────────────────────────────────────┘    │
│                                    │                                                      │
│                                    ▼                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │                         Cloud Load Balancer (L7)                                │    │
│  │                          IP: 34.102.196.90                                      │    │
│  │                     Domain: dompe.airiskportal.com                              │    │
│  │                     SSL Certificate: dompe-airiskportal-cert-v2                 │    │
│  └─────────────────────────────────┬───────────────────────────────────────────────┘    │
│                                    │                                                      │
│                                    ▼                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │                      Identity-Aware Proxy (IAP)                                 │    │
│  │                                                                                 │    │
│  │  • Enforces authentication before access                                       │    │
│  │  • Redirects unauthenticated users to Firebase Auth                           │    │
│  │  • Adds X-Goog-Authenticated-User headers                                     │    │
│  └────────────────┬────────────────────────────────────┬──────────────────────────┘    │
│                   │                                    │                                 │
│         Authenticated                          Unauthenticated                           │
│              Users                                  Users                                │
│                   │                                    │                                 │
│                   ▼                                    ▼                                 │
│  ┌────────────────────────────┐      ┌─────────────────────────────────────────┐       │
│  │      Cloud Run Service     │      │        Firebase Hosting                  │       │
│  │    risk-portal (Backend)   │      │    dompe-dev-439304.web.app            │       │
│  │                            │      │                                         │       │
│  │  • Node.js Express Server  │      │  • Hosts auth.html                     │       │
│  │  • Serves React SPA        │      │  • FirebaseUI + gcip-iap               │       │
│  │  • API Endpoints           │      │  • Handles GCIP authentication         │       │
│  │  • Port: 8080              │      │                                         │       │
│  └────────────┬───────────────┘      └────────────┬────────────────────────────┘       │
│               │                                    │                                     │
│               │                                    ▼                                     │
│               │                     ┌──────────────────────────────────┐                │
│               │                     │   Google Cloud Identity          │                │
│               │                     │      Platform (GCIP)            │                │
│               │                     │                                 │                │
│               │                     │  • Tenant: dompe8090-bf0qr      │                │
│               │                     │  • Email/Password Auth          │                │
│               │                     │  • User Management              │                │
│               │                     └──────────────────────────────────┘                │
│               │                                                                          │
│               ▼                                                                          │
│  ┌────────────────────────────┐                                                         │
│  │      Cloud Firestore       │                                                         │
│  │        (Database)          │                                                         │
│  │                            │                                                         │
│  │  • Risks Collection        │                                                         │
│  │  • Controls Collection     │                                                         │
│  │  • Users Collection        │                                                         │
│  └────────────────────────────┘                                                         │
│                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌─────────┐         ┌─────────┐         ┌─────────┐         ┌──────────┐         ┌─────────┐
│  User   │         │   Load  │         │   IAP   │         │ Firebase │         │  Cloud  │
│         │         │Balancer │         │         │         │ Hosting  │         │   Run   │
└────┬────┘         └────┬────┘         └────┬────┘         └────┬─────┘         └────┬────┘
     │                   │                   │                   │                    │
     │  1. Access        │                   │                   │                    │
     │  dompe.ai...      │                   │                   │                    │
     │──────────────────>│                   │                   │                    │
     │                   │                   │                   │                    │
     │                   │  2. Forward       │                   │                    │
     │                   │──────────────────>│                   │                    │
     │                   │                   │                   │                    │
     │                   │                   │  3. Check Auth   │                    │
     │                   │                   │  (No Session)    │                    │
     │                   │                   │                   │                    │
     │                   │  4. Redirect to   │                   │                    │
     │<──────────────────────────────────────│  Firebase Auth   │                    │
     │                   │                   │                   │                    │
     │  5. Load Auth Page                    │                   │                    │
     │───────────────────────────────────────────────────────────>│                    │
     │                   │                   │                   │                    │
     │                   │                   │                   │  6. FirebaseUI     │
     │                   │                   │                   │  + GCIP Auth      │
     │                   │                   │                   │                    │
     │  7. Login Success │                   │                   │                    │
     │<───────────────────────────────────────────────────────────│                    │
     │                   │                   │                   │                    │
     │  8. Return to IAP │                   │                   │                    │
     │──────────────────>│──────────────────>│                   │                    │
     │                   │                   │                   │                    │
     │                   │                   │  9. Verify       │                    │
     │                   │                   │  GCIP Token      │                    │
     │                   │                   │                   │                    │
     │                   │                   │  10. Create      │                    │
     │                   │                   │  IAP Session     │                    │
     │                   │                   │                   │                    │
     │                   │  11. Forward to   │                   │                    │
     │                   │  Cloud Run        │───────────────────────────────────────>│
     │                   │                   │  + IAP Headers   │                    │
     │                   │                   │                   │                    │
     │  12. React App    │                   │                   │                    │
     │<────────────────────────────────────────────────────────────────────────────────│
     │                   │                   │                   │                    │
```

## Key Components

### 1. **Cloud Load Balancer**
- Public IP: 34.102.196.90
- Domain: dompe.airiskportal.com
- SSL Certificate: dompe-airiskportal-cert-v2
- Routes traffic to backend services

### 2. **Identity-Aware Proxy (IAP)**
- Enforces authentication before allowing access
- Configured with GCIP for external identities
- Adds authentication headers to requests

### 3. **Firebase Hosting**
- Hosts the authentication page (auth.html)
- Uses FirebaseUI with gcip-iap module
- Handles the GCIP authentication flow

### 4. **Cloud Run Service**
- Runs the Node.js/Express backend
- Serves the React SPA
- Provides API endpoints
- Reads IAP headers for user identification

### 5. **Google Cloud Identity Platform (GCIP)**
- Manages user identities
- Tenant: dompe8090-bf0qr
- Supports email/password authentication

### 6. **Cloud Firestore**
- NoSQL database
- Stores risks, controls, and user data
- Accessed by the Cloud Run backend