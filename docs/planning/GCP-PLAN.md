# Google Cloud Platform Deployment Plan
## 8090 Risk Portal - Version 2.0.0

**Last Updated:** 2025-01-16  
**Document Version:** 1.0  
**Target Environment:** Google Cloud Platform  
**Application:** 8090 Dompe AI Risk Portal

---

## Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              GOOGLE CLOUD PLATFORM                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │   Cloud Run     │    │   Cloud Run     │    │   Cloud SQL     │        │
│  │   (Frontend)    │    │   (Backend)     │    │  (PostgreSQL)   │        │
│  │                 │    │                 │    │                 │        │
│  │  React/Vite SPA │◄───┤  Express API    │◄───┤  - users        │        │
│  │  - Static Build │    │  - Auth Service │    │  - sessions     │        │
│  │  - Auto HTTPS   │    │  - JWT Tokens   │    │  - audit_logs   │        │
│  │  - Custom Domain│    │  - Risk/Control │    │  - risks        │        │
│  └─────────────────┘    │    Management   │    │  - controls     │        │
│           ▲              └─────────────────┘    └─────────────────┘        │
│           │                       ▲                       ▲                │
│           │                       │                       │                │
│           │                       ▼                       │                │
│           │              ┌─────────────────┐              │                │
│           │              │ Secret Manager  │              │                │
│           │              │                 │              │                │
│           │              │ - DB Credentials│              │                │
│           │              │ - JWT Keys      │              │                │
│           │              │ - Gemini API    │              │                │
│           │              │ - Session Keys  │              │                │
│           │              └─────────────────┘              │                │
│           │                                               │                │
│           │              ┌─────────────────┐              │                │
│           │              │ Cloud Storage   │              │                │
│           │              │                 │              │                │
│           │              │ - Static Assets │              │                │
│           │              │ - File Uploads  │              │                │
│           │              │ - Report Files  │              │                │
│           │              └─────────────────┘              │                │
│           │                                               │                │
│           │              ┌─────────────────┐              │                │
│           │              │ Cloud Monitoring│              │                │
│           │              │ & Logging       │              │                │
│           │              │                 │              │                │
│           │              │ - Application   │              │                │
│           │              │   Metrics       │              │                │
│           │              │ - Error Tracking│              │                │
│           │              │ - Audit Logs    │              │                │
│           │              └─────────────────┘              │                │
│           │                                               │                │
│           │              ┌─────────────────┐              │                │
│           │              │      IAM        │              │                │
│           │              │                 │              │                │
│           │              │ - Service       │              │                │
│           │              │   Accounts      │              │                │
│           │              │ - Role-based    │              │                │
│           │              │   Access        │              │                │
│           │              └─────────────────┘              │                │
│           │                                               │                │
│           │                                               │                │
│    ┌─────────────────────────────────────────────────────┴────────────────┐│
│    │                        INTERNET                                      ││
│    │                                                                      ││
│    │    ┌─────────────┐                                                   ││
│    │    │    Users    │                                                   ││
│    │    │             │                                                   ││
│    │    │ - Admin     │                                                   ││
│    │    │ - Manager   │                                                   ││
│    │    │ - Viewer    │                                                   ││
│    │    └─────────────┘                                                   ││
│    └──────────────────────────────────────────────────────────────────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          LOCAL DEVELOPMENT                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │  Developer      │    │   Git Repo      │    │  Build Scripts  │        │
│  │  Workstation    │    │                 │    │                 │        │
│  │                 │    │ - Source Code   │    │ - npm run build │        │
│  │ - Code Changes  │───►│ - Dockerfile    │───►│ - Docker Build  │        │
│  │ - Testing       │    │ - cloudbuild.yml│    │ - gcloud deploy │        │
│  │ - Local Preview │    │ - Config Files  │    │                 │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│                                                          │                  │
└──────────────────────────────────────────────────────────┼─────────────────┘
                                                          │
                                                          ▼
┌─────────────────────────────────────────────────────────┼─────────────────┐
│                        GOOGLE CLOUD                     │                 │
├─────────────────────────────────────────────────────────┼─────────────────┤
│                                                          │                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────▼─────────┐      │
│  │  Cloud Build    │    │ Container       │    │  Cloud Run        │      │
│  │                 │    │ Registry        │    │                   │      │
│  │ - Build Frontend│───►│                 │───►│ - Deploy Frontend │      │
│  │ - Build Backend │    │ - Frontend Image│    │ - Deploy Backend  │      │
│  │ - Run Tests     │    │ - Backend Image │    │ - Health Checks   │      │
│  │ - Security Scan │    │ - Versioning    │    │ - Rolling Updates │      │
│  └─────────────────┘    └─────────────────┘    └───────────────────┘      │
│           ▲                                                                │
│           │                                                                │
│           │ Manual Trigger                                                 │
│           │ (gcloud builds submit)                                         │
│           │                                                                │
│  ┌─────────────────┐                                                       │
│  │ Local Trigger   │                                                       │
│  │                 │                                                       │
│  │ - Manual Deploy │                                                       │
│  │ - Version Tags  │                                                       │
│  │ - Environment   │                                                       │
│  │   Selection     │                                                       │
│  └─────────────────┘                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Design

### PostgreSQL Schema

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'viewer')),
    department VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Password history table
CREATE TABLE password_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Risks table (migrate existing structure)
CREATE TABLE risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_id VARCHAR(50) UNIQUE NOT NULL,
    risk TEXT NOT NULL,
    risk_category VARCHAR(255),
    risk_sub_category VARCHAR(255),
    impact_description TEXT,
    likelihood_description TEXT,
    risk_level_category VARCHAR(50),
    risk_level DECIMAL(5,2),
    likelihood INTEGER,
    impact INTEGER,
    proposed_oversight_ownership TEXT[],
    agreed_workable_mitigations TEXT,
    mitigation_effectiveness VARCHAR(50),
    notes TEXT,
    related_control_ids TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Controls table (migrate existing structure)
CREATE TABLE controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    control_id VARCHAR(50) UNIQUE NOT NULL,
    control_description TEXT NOT NULL,
    implementation_status VARCHAR(100),
    regulatory_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_risks_category ON risks(risk_category);
CREATE INDEX idx_risks_level ON risks(risk_level_category);
CREATE INDEX idx_controls_status ON controls(implementation_status);
```

---

## Implementation Phases

### Phase 1: Database Setup
**Duration:** 2-3 days  
**Prerequisites:** GCP Project setup, billing enabled

#### GCP-TASK-001: Create Cloud SQL PostgreSQL Instance
**Status:** ❌ BLOCKED - Organization Policy  
**Priority:** High  
**Estimated Time:** 4 hours
**Alternative:** ✅ Using Firestore instead

**Description:**
~~Set up a managed PostgreSQL instance on Google Cloud SQL with proper configuration for the 8090 Risk Portal.~~

**Issue:** Cloud SQL API is restricted by organization policy for rohit@8090.inc account.

**Resolution:** Using Firestore (NoSQL) as alternative database solution.

**Completed Actions:**
- ✅ Enabled Firestore API
- ✅ Created Firestore database in us-central1
- ✅ Modified backend to use Firestore instead of PostgreSQL
- ✅ Created Firestore integration (server/db/firestore.js)
- Automated backups: Not required
- Connection security: HTTPS only

**Implementation Steps:**
1. Create Cloud SQL instance via gcloud CLI
2. Configure database flags for performance
3. Set up automated backups
4. Configure maintenance window
5. Enable SSL/TLS connections

**Acceptance Criteria:**
- [ ] Cloud SQL instance running PostgreSQL 15+
- [ ] Private IP networking configured
- [ ] SSL certificates generated
- [ ] Automated backups enabled
- [ ] Connection from local development successful

**Dependencies:** None

**Status Updates:**
- [ ] Started: 
- [ ] Completed: 
- [ ] Tested: 
- [ ] Notes: 

---

#### GCP-TASK-002: Create Database Schema
**Status:** ⏳ TODO  
**Priority:** High  
**Estimated Time:** 3 hours

**Description:**
Create the complete database schema including all tables, indexes, and constraints for the application.

**Technical Requirements:**
- Execute SQL schema creation scripts
- Create proper indexes for performance
- Set up foreign key constraints
- Configure table-level security

**Implementation Steps:**
1. Connect to Cloud SQL instance
2. Create database 'risk_portal'
3. Execute table creation scripts
4. Create indexes for performance
5. Verify schema structure

**Acceptance Criteria:**
- [ ] All tables created with proper structure
- [ ] Indexes created for performance
- [ ] Foreign key constraints working
- [ ] Schema documentation updated

**Dependencies:** GCP-TASK-001

**Status Updates:**
- [ ] Started: 
- [ ] Completed: 
- [ ] Tested: 
- [ ] Notes: 

---

#### GCP-TASK-003: Set Up Database Connection Security
**Status:** ⏳ TODO  
**Priority:** High  
**Estimated Time:** 2 hours

**Description:**
Configure secure database connections using SSL certificates and connection pooling.

**Technical Requirements:**
- SSL certificate configuration
- Connection pooling setup
- Database user creation with limited privileges
- Network security rules

**Implementation Steps:**
1. Download SSL certificates
2. Create database users with specific roles
3. Configure connection pooling
4. Test secure connections
5. Document connection strings

**Acceptance Criteria:**
- [ ] SSL connections working
- [ ] Database users created with proper roles
- [ ] Connection pooling configured
- [ ] Network security validated

**Dependencies:** GCP-TASK-002

**Status Updates:**
- [ ] Started: 
- [ ] Completed: 
- [ ] Tested: 
- [ ] Notes: 

---

#### GCP-TASK-004: Migrate Mock Data to PostgreSQL
**Status:** ⏳ TODO  
**Priority:** Medium  
**Estimated Time:** 4 hours

**Description:**
Migrate existing risk and control data from the mock storage to PostgreSQL database.

**Technical Requirements:**
- Data migration scripts
- Data validation and cleanup
- Preserve existing relationships
- Handle data type conversions

**Implementation Steps:**
1. Export data from current mock storage
2. Transform data to match PostgreSQL schema
3. Import risks and controls data
4. Verify data integrity
5. Test application connectivity

**Acceptance Criteria:**
- [ ] All 32 risks migrated successfully
- [ ] All 18 controls migrated successfully
- [ ] Data relationships preserved
- [ ] Application reads data correctly

**Dependencies:** GCP-TASK-003

**Status Updates:**
- [ ] Started: 
- [ ] Completed: 
- [ ] Tested: 
- [ ] Notes: 

---

#### GCP-TASK-005: Configure Automated Backups and Monitoring
**Status:** ⏳ TODO  
**Priority:** Medium  
**Estimated Time:** 2 hours

**Description:**
Set up automated backups, point-in-time recovery, and database monitoring.

**Technical Requirements:**
- Automated daily backups
- Point-in-time recovery capability
- Database performance monitoring
- Alerting for critical metrics

**Implementation Steps:**
1. Configure backup schedules
2. Test backup restoration
3. Set up monitoring dashboards
4. Configure alerting rules
5. Document backup procedures

**Acceptance Criteria:**
- [ ] Automated backups running daily
- [ ] Point-in-time recovery tested
- [ ] Monitoring dashboards configured
- [ ] Alerting rules active

**Dependencies:** GCP-TASK-004

**Status Updates:**
- [ ] Started: 
- [ ] Completed: 
- [ ] Tested: 
- [ ] Notes: 

---

### Phase 2: Backend API Migration
**Duration:** 3-4 days  
**Prerequisites:** Phase 1 completed

#### GCP-TASK-006: Replace Mock JWT with Production Implementation
**Status:** ⏳ TODO  
**Priority:** High  
**Estimated Time:** 5 hours

**Description:**
Replace the mock JWT implementation with a production-ready JWT system using proper cryptographic keys.

**Technical Requirements:**
- Use jsonwebtoken library
- RSA key pair generation
- Token expiration handling
- Refresh token mechanism
- Secure key storage

**Implementation Steps:**
1. Install jsonwebtoken dependencies
2. Generate RSA key pairs
3. Update JWT creation and validation
4. Implement refresh token logic
5. Update authentication middleware

**Acceptance Criteria:**
- [ ] Production JWT implementation working
- [ ] RSA keys generated and stored securely
- [ ] Token refresh mechanism functional
- [ ] Authentication middleware updated
- [ ] All existing auth flows working

**Dependencies:** GCP-TASK-005

**Status Updates:**
- [ ] Started: 
- [ ] Completed: 
- [ ] Tested: 
- [ ] Notes: 

---

#### GCP-TASK-007: Update Authentication Service for PostgreSQL
**Status:** ⏳ TODO  
**Priority:** High  
**Estimated Time:** 6 hours

**Description:**
Migrate the authentication service from mock storage to PostgreSQL with proper password hashing and session management.

**Technical Requirements:**
- PostgreSQL connection integration
- bcrypt for password hashing
- Session management with database
- User CRUD operations
- Password history tracking

**Implementation Steps:**
1. Install bcrypt and database connection libraries
2. Update user authentication methods
3. Implement session management
4. Add password history tracking
5. Test all authentication flows

**Acceptance Criteria:**
- [ ] Authentication service using PostgreSQL
- [ ] bcrypt password hashing implemented
- [ ] Session management working
- [ ] Password history tracking active
- [ ] All auth endpoints functional

**Dependencies:** GCP-TASK-006

**Status Updates:**
- [ ] Started: 
- [ ] Completed: 
- [ ] Tested: 
- [ ] Notes: 

---

#### GCP-TASK-008: Implement Audit Logging
**Status:** ⏳ TODO  
**Priority:** Medium  
**Estimated Time:** 3 hours

**Description:**
Implement comprehensive audit logging for all user actions and system events.

**Technical Requirements:**
- Database audit log table
- Automatic logging for all user actions
- IP address and user agent tracking
- Structured log format
- Log retention policies

**Implementation Steps:**
1. Create audit logging middleware
2. Implement automatic action logging
3. Add IP and user agent tracking
4. Test audit log generation
5. Configure log retention

**Acceptance Criteria:**
- [ ] Audit logging middleware active
- [ ] All user actions logged
- [ ] IP and user agent captured
- [ ] Log entries properly structured
- [ ] Retention policies configured

**Dependencies:** GCP-TASK-007

**Status Updates:**
- [ ] Started: 
- [ ] Completed: 
- [ ] Tested: 
- [ ] Notes: 

---

#### GCP-TASK-009: Set Up Secret Manager Integration
**Status:** ⏳ TODO  
**Priority:** High  
**Estimated Time:** 4 hours

**Description:**
Integrate Google Cloud Secret Manager for secure storage of sensitive configuration data.

**Technical Requirements:**
- Secret Manager client library
- Database credentials storage
- JWT signing keys storage
- Gemini API key storage
- Environment-specific secrets

**Implementation Steps:**
1. Install Secret Manager client library
2. Create secrets for database credentials
3. Store JWT signing keys
4. Migrate API keys to Secret Manager
5. Update application to use Secret Manager

**Acceptance Criteria:**
- [ ] Secret Manager client configured
- [ ] Database credentials stored securely
- [ ] JWT keys stored in Secret Manager
- [ ] API keys migrated to Secret Manager
- [ ] Application reads secrets correctly

**Dependencies:** GCP-TASK-008

**Status Updates:**
- [ ] Started: 
- [ ] Completed: 
- [ ] Tested: 
- [ ] Notes: 

---

### Phase 3: Containerization
**Duration:** 2-3 days  
**Prerequisites:** Phase 2 completed

#### GCP-TASK-010: Create Frontend Dockerfile
**Status:** ⏳ TODO  
**Priority:** High  
**Estimated Time:** 3 hours

**Description:**
Create a production-ready Dockerfile for the React frontend with multi-stage builds and optimization.

**Technical Requirements:**
- Multi-stage build process
- Node.js build stage
- Nginx serving stage
- Static asset optimization
- Security best practices

**Implementation Steps:**
1. Create multi-stage Dockerfile
2. Configure build stage with Node.js
3. Set up Nginx serving stage
4. Optimize static assets
5. Test container locally

**Acceptance Criteria:**
- [ ] Multi-stage Dockerfile created
- [ ] Build process optimized
- [ ] Nginx configuration working
- [ ] Static assets served correctly
- [ ] Container runs locally

**Dependencies:** GCP-TASK-009

**Status Updates:**
- [ ] Started: 
- [ ] Completed: 
- [ ] Tested: 
- [ ] Notes: 

---

#### GCP-TASK-011: Create Backend Dockerfile
**Status:** ⏳ TODO  
**Priority:** High  
**Estimated Time:** 3 hours

**Description:**
Create a production-ready Dockerfile for the Node.js/Express backend with security and performance optimizations.

**Technical Requirements:**
- Node.js runtime optimization
- Security hardening
- Health check endpoints
- Environment configuration
- Dependency optimization

**Implementation Steps:**
1. Create Node.js Dockerfile
2. Implement security hardening
3. Add health check endpoints
4. Configure environment variables
5. Test container locally

**Acceptance Criteria:**
- [ ] Node.js Dockerfile created
- [ ] Security hardening implemented
- [ ] Health checks working
- [ ] Environment configuration complete
- [ ] Container runs locally

**Dependencies:** GCP-TASK-010

**Status Updates:**
- [ ] Started: 
- [ ] Completed: 
- [ ] Tested: 
- [ ] Notes: 

---

#### GCP-TASK-012: Create Cloud Build Configuration
**Status:** ⏳ TODO  
**Priority:** High  
**Estimated Time:** 4 hours

**Description:**
Create Cloud Build configuration for automated building and deployment of both frontend and backend containers.

**Technical Requirements:**
- cloudbuild.yaml configuration
- Multi-step build process
- Container Registry integration
- Environment-specific builds
- Build optimization

**Implementation Steps:**
1. Create cloudbuild.yaml file
2. Configure build steps for frontend
3. Configure build steps for backend
4. Set up Container Registry pushing
5. Test build process locally

**Acceptance Criteria:**
- [ ] cloudbuild.yaml created
- [ ] Frontend build steps working
- [ ] Backend build steps working
- [ ] Container Registry integration active
- [ ] Build process tested

**Dependencies:** GCP-TASK-011

**Status Updates:**
- [ ] Started: 
- [ ] Completed: 
- [ ] Tested: 
- [ ] Notes: 

---

### Phase 4: Cloud Run Deployment
**Duration:** 2-3 days  
**Prerequisites:** Phase 3 completed

#### GCP-TASK-013: Deploy Frontend to Cloud Run
**Status:** ⏳ TODO  
**Priority:** High  
**Estimated Time:** 4 hours

**Description:**
Deploy the frontend container to Cloud Run with proper configuration for serving the React application.

**Technical Requirements:**
- Cloud Run service configuration
- Custom domain setup
- SSL certificate configuration
- Environment variables
- Scaling configuration

**Implementation Steps:**
1. Deploy frontend container to Cloud Run
2. Configure service settings
3. Set up custom domain
4. Configure SSL certificates
5. Test frontend accessibility

**Acceptance Criteria:**
- [ ] Frontend deployed to Cloud Run
- [ ] Custom domain configured
- [ ] SSL certificates working
- [ ] Environment variables set
- [ ] Application accessible via HTTPS

**Dependencies:** GCP-TASK-012

**Status Updates:**
- [ ] Started: 
- [ ] Completed: 
- [ ] Tested: 
- [ ] Notes: 

---

#### GCP-TASK-014: Deploy Backend to Cloud Run
**Status:** ⏳ TODO  
**Priority:** High  
**Estimated Time:** 4 hours

**Description:**
Deploy the backend API container to Cloud Run with proper configuration for the Express server.

**Technical Requirements:**
- Cloud Run service configuration
- Database connection configuration
- Secret Manager integration
- Health check endpoints
- Scaling and concurrency settings

**Implementation Steps:**
1. Deploy backend container to Cloud Run
2. Configure database connections
3. Set up Secret Manager access
4. Configure health checks
5. Test API endpoints

**Acceptance Criteria:**
- [ ] Backend deployed to Cloud Run
- [ ] Database connections working
- [ ] Secret Manager integration active
- [ ] Health checks responding
- [ ] API endpoints accessible

**Dependencies:** GCP-TASK-013

**Status Updates:**
- [ ] Started: 
- [ ] Completed: 
- [ ] Tested: 
- [ ] Notes: 

---

#### GCP-TASK-015: Configure Service-to-Service Communication
**Status:** ⏳ TODO  
**Priority:** Medium  
**Estimated Time:** 3 hours

**Description:**
Configure secure communication between frontend and backend services with proper authentication.

**Technical Requirements:**
- Service account configuration
- IAM role assignments
- Network security rules
- CORS configuration
- Authentication headers

**Implementation Steps:**
1. Create service accounts
2. Configure IAM roles
3. Set up network security
4. Configure CORS policies
5. Test service communication

**Acceptance Criteria:**
- [ ] Service accounts created
- [ ] IAM roles configured
- [ ] Network security active
- [ ] CORS policies working
- [ ] Services communicating securely

**Dependencies:** GCP-TASK-014

**Status Updates:**
- [ ] Started: 
- [ ] Completed: 
- [ ] Tested: 
- [ ] Notes: 

---

#### GCP-TASK-016: Set Up Load Balancing and SSL
**Status:** ⏳ TODO  
**Priority:** Medium  
**Estimated Time:** 3 hours

**Description:**
Configure load balancing and SSL termination for production traffic handling.

**Technical Requirements:**
- Cloud Load Balancer configuration
- SSL certificate management
- Backend service configuration
- Health checks
- Traffic routing rules

**Implementation Steps:**
1. Create load balancer
2. Configure SSL certificates
3. Set up backend services
4. Configure health checks
5. Test traffic routing

**Acceptance Criteria:**
- [ ] Load balancer configured
- [ ] SSL certificates installed
- [ ] Backend services connected
- [ ] Health checks working
- [ ] Traffic routing correctly

**Dependencies:** GCP-TASK-015

**Status Updates:**
- [ ] Started: 
- [ ] Completed: 
- [ ] Tested: 
- [ ] Notes: 

---

### Phase 5: Monitoring & Security
**Duration:** 1-2 days  
**Prerequisites:** Phase 4 completed

#### GCP-TASK-017: Set Up Cloud Monitoring
**Status:** ⏳ TODO  
**Priority:** Medium  
**Estimated Time:** 4 hours

**Description:**
Configure comprehensive monitoring for all application components with dashboards and alerts.

**Technical Requirements:**
- Cloud Monitoring dashboards
- Custom metrics collection
- Application performance monitoring
- Resource utilization tracking
- Alert policies

**Implementation Steps:**
1. Create monitoring dashboards
2. Set up custom metrics
3. Configure application monitoring
4. Set up resource tracking
5. Create alert policies

**Acceptance Criteria:**
- [ ] Monitoring dashboards created
- [ ] Custom metrics collecting
- [ ] Application monitoring active
- [ ] Resource tracking working
- [ ] Alert policies configured

**Dependencies:** GCP-TASK-016

**Status Updates:**
- [ ] Started: 
- [ ] Completed: 
- [ ] Tested: 
- [ ] Notes: 

---

#### GCP-TASK-018: Configure Cloud Logging
**Status:** ⏳ TODO  
**Priority:** Medium  
**Estimated Time:** 3 hours

**Description:**
Set up structured logging for all application components with proper log aggregation and analysis.

**Technical Requirements:**
- Structured logging format
- Log aggregation configuration
- Log analysis queries
- Log retention policies
- Error tracking

**Implementation Steps:**
1. Configure structured logging
2. Set up log aggregation
3. Create log analysis queries
4. Configure retention policies
5. Set up error tracking

**Acceptance Criteria:**
- [ ] Structured logging implemented
- [ ] Log aggregation working
- [ ] Analysis queries created
- [ ] Retention policies set
- [ ] Error tracking active

**Dependencies:** GCP-TASK-017

**Status Updates:**
- [ ] Started: 
- [ ] Completed: 
- [ ] Tested: 
- [ ] Notes: 

---

#### GCP-TASK-019: Security Hardening and IAM
**Status:** ⏳ TODO  
**Priority:** High  
**Estimated Time:** 4 hours

**Description:**
Implement final security hardening measures and configure proper IAM policies for production deployment.

**Technical Requirements:**
- IAM policy optimization
- Security scanning
- Vulnerability assessment
- Access control validation
- Security best practices

**Implementation Steps:**
1. Optimize IAM policies
2. Run security scans
3. Conduct vulnerability assessment
4. Validate access controls
5. Implement security best practices

**Acceptance Criteria:**
- [ ] IAM policies optimized
- [ ] Security scans passed
- [ ] Vulnerabilities addressed
- [ ] Access controls validated
- [ ] Security best practices implemented

**Dependencies:** GCP-TASK-018

**Status Updates:**
- [ ] Started: 
- [ ] Completed: 
- [ ] Tested: 
- [ ] Notes: 

---

## Project Summary

### Total Tasks: 19
### Total Estimated Time: 64 hours
### Total Phases: 5

### Phase Progress:
- **Phase 1:** 0/5 tasks completed (0%)
- **Phase 2:** 0/4 tasks completed (0%)
- **Phase 3:** 0/3 tasks completed (0%)
- **Phase 4:** 0/4 tasks completed (0%)
- **Phase 5:** 0/3 tasks completed (0%)

### Overall Progress: 0/19 tasks completed (0%)

---

## Deployment Commands Reference

### Local Development
```bash
# Build frontend
npm run build

# Test containers locally
docker build -t frontend-local .
docker build -t backend-local .

# Run containers locally
docker run -p 3000:3000 frontend-local
docker run -p 8080:8080 backend-local
```

### Cloud Deployment
```bash
# Build and deploy via Cloud Build
gcloud builds submit --config cloudbuild.yaml

# Deploy to Cloud Run
gcloud run deploy frontend --image gcr.io/PROJECT_ID/frontend
gcloud run deploy backend --image gcr.io/PROJECT_ID/backend

# Update secrets
gcloud secrets versions add DB_PASSWORD --data-file=password.txt
```

### Database Management
```bash
# Connect to Cloud SQL
gcloud sql connect INSTANCE_NAME --user=postgres

# Create database backup
gcloud sql backups create --instance=INSTANCE_NAME

# Import data
gcloud sql import sql INSTANCE_NAME gs://BUCKET/dump.sql
```

---

## Environment Configuration

### Required Environment Variables

#### Frontend (Cloud Run)
```
VITE_API_URL=https://api.risk-portal.dompe.com
VITE_GEMINI_API_KEY=secret:gemini-api-key
VITE_APP_VERSION=2.0.0
```

#### Backend (Cloud Run)
```
DATABASE_URL=secret:database-url
JWT_SECRET=secret:jwt-secret
JWT_REFRESH_SECRET=secret:jwt-refresh-secret
GEMINI_API_KEY=secret:gemini-api-key
NODE_ENV=production
```

### Required GCP Services
- Cloud SQL
- Cloud Run
- Cloud Build
- Container Registry
- Secret Manager
- Cloud Monitoring
- Cloud Logging
- IAM

---

## Success Criteria

### Technical Success Criteria
- [ ] All 19 tasks completed successfully
- [ ] Application deployed and accessible via HTTPS
- [ ] Database fully migrated and operational
- [ ] Authentication system working in production
- [ ] Monitoring and logging fully configured
- [ ] Security hardening implemented
- [ ] Performance benchmarks met

### Business Success Criteria
- [ ] All user roles (Admin, Manager, Viewer) functional
- [ ] All 32 risks and 18 controls accessible
- [ ] Report generation working
- [ ] User management features operational
- [ ] Audit logging capturing all activities
- [ ] System can handle expected user load

---

**Document maintained by:** Claude Code Assistant  
**Next review date:** Upon completion of each phase  
**Contact:** Development Team

---

## Task Tracking Summary

### Pre-Deployment Setup (Completed)
- ✅ **Google Cloud CLI Configuration**
  - Created configuration: dompe-dev
  - Set project: dompe-dev-439304
  - Set region: us-central1
  - Users: rohit@8090.inc, alex@8090.inc, jonathan@8090.inc

- ✅ **API Enablement**
  - Cloud Run API
  - Cloud Build API
  - Secret Manager API
  - Storage API
  - Compute Engine API
  - Artifact Registry API
  - Firestore API
  - ❌ Cloud SQL API (Blocked by org policy)

- ✅ **Infrastructure Created**
  - Firestore database (us-central1)
  - Artifact Registry repository: risk-portal
  - Service Account: risk-portal-sa@dompe-dev-439304.iam.gserviceaccount.com
  - IAM Roles granted: datastore.user, secretmanager.secretAccessor

- ✅ **Application Modifications**
  - Backend modified to use Firestore instead of PostgreSQL
  - Created server/db/firestore.js
  - Created Express server structure
  - Created authentication routes
  - Updated Dockerfiles for both frontend and backend

### Next Steps (Pending Approval)
1. **Create Secrets in Secret Manager**
   - JWT secret
   - Session secret
   - Gemini API key (if available)

2. **Build and Deploy**
   - Build Docker images
   - Push to Artifact Registry
   - Deploy to Cloud Run

3. **Configure Domain** (if available)
   - Set up custom domain
   - Configure SSL/HTTPS

**Current Status:** Ready to proceed with secret creation and deployment
**Blockers:** None
**Notes:** Using Firestore instead of Cloud SQL due to organization policy restrictions