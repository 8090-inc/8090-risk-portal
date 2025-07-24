# 8090 AI Risk Portal

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-Ready-blue.svg)](https://cloud.google.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-v2.8-brightgreen.svg)](https://github.com/8090-inc/8090-risk-portal/releases)

An enterprise-grade AI-powered risk assessment and management platform built for Dompe Farmaceutici S.p.A. This platform leverages Google Cloud services and AI to streamline risk management processes, generate comprehensive reports, and provide real-time collaboration capabilities.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Google Cloud Platform                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐     ┌──────────────┐     ┌────────────────┐              │
│  │   Browser   │────▶│Load Balancer │────▶│Identity-Aware  │              │
│  │             │     │(SSL/HTTPS)   │     │Proxy (IAP)     │              │
│  └─────────────┘     └──────────────┘     └────────┬───────┘              │
│                                                     │                       │
│                                                     ▼                       │
│  ┌────────────────────────────────────────────────────────────┐           │
│  │                    Identity Platform (GCIP)                 │           │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │           │
│  │  │Google Auth   │  │  IAP Headers │  │  Tenant:        │ │           │
│  │  │              │  │              │  │dompe8090-bf0qr  │ │           │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘ │           │
│  └────────────────────────────────────────────────────────────┘           │
│                                     │                                       │
│                                     ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐             │
│  │                        Cloud Run                          │             │
│  │  ┌─────────────────┐        ┌──────────────────┐        │             │
│  │  │   React App     │        │  Express Server   │        │             │
│  │  │  (Static Files) │◀──────▶│   (API Backend)   │        │             │
│  │  └─────────────────┘        └────────┬─────────┘        │             │
│  └───────────────────────────────────────────┼─────────────────┘             │
│                                          │                                 │
│                     ┌────────────────────┴────────────────┐               │
│                     ▼                                     ▼               │
│  ┌──────────────────────┐                    ┌─────────────────┐         │
│  │   Cloud Firestore    │                    │   Gemini API    │         │
│  │   (Database)         │                    │   (AI Reports)  │         │
│  └──────────────────────┘                    └─────────────────┘         │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

## 🚀 Live Demo

**Production URL:** [https://risk-portal-290017403746.us-central1.run.app](https://risk-portal-290017403746.us-central1.run.app)

*Note: Access requires Google IAP authentication with authorized domain (@dompe.com or @ext.dompe.com)*

## ✨ Features

- **🎯 Risk Management**
  - Create, read, update, and delete risk assessments
  - Automatic risk scoring based on likelihood and impact
  - Risk categorization and tagging
  - Historical tracking and audit trails

- **🛡️ Control Management**
  - Link controls to specific risks
  - Track control effectiveness
  - Implementation status monitoring
  - Control testing schedules

- **📊 Interactive Risk Matrix**
  - Visual 5x5 risk heat map
  - Drag-and-drop risk positioning
  - Real-time updates across users
  - Color-coded risk levels

- **🤖 AI-Powered Reports**
  - Automated report generation using Google Gemini API
  - Customizable report templates
  - Export to multiple formats (PDF, DOCX, XLSX)
  - Executive summaries and detailed analysis

- **👥 User Management**
  - Google IAP integration for secure access
  - Multi-tenant support via GCIP
  - Role-based access control
  - SSO with corporate credentials

- **📱 Responsive Design**
  - Mobile-friendly interface
  - Progressive Web App (PWA) capabilities
  - Offline support with sync

## 🛠️ Technology Stack

### Frontend
- **React 19.1.0** - UI framework
- **TypeScript 5.8.3** - Type safety
- **Tailwind CSS 4.1** - Utility-first CSS
- **Zustand 5.0** - State management
- **React Router 6.30** - Navigation
- **Chart.js 4.5** - Data visualization
- **AG-Grid 34.0** - Advanced data grids

### Backend
- **Node.js 20+** - Runtime environment
- **Express 4.21** - Web framework
- **Google Cloud Firestore** - NoSQL database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### Infrastructure
- **Google Cloud Run** - Container hosting
- **Identity-Aware Proxy (IAP)** - Access control
- **Google Cloud Identity Platform** - User authentication
- **Google Cloud Run** - Static assets + API hosting
- **Google Load Balancer** - Traffic distribution

### AI/ML
- **Google Gemini API** - Report generation
- **Natural Language Processing** - Risk analysis

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 20+ and npm installed
- Google Cloud Project with billing enabled
- Firebase project linked to GCP
- Domain name with SSL certificate
- Access to Google Cloud Console

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/8090-inc/8090-risk-portal.git
cd 8090-risk-portal/8090-risk-portal
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Environment Setup

Create a `.env` file based on the example:

```bash
cp .env.example .env
```

Required environment variables:
```env
# API Keys
VITE_GEMINI_API_KEY=your-gemini-api-key

# App Configuration
VITE_API_RATE_LIMIT=10
VITE_APP_VERSION=1.0.0

# Firebase Configuration (for local development)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### 4. Local Development

Start the development server:

```bash
# Start frontend
npm run dev

# In another terminal, start backend
npm run dev:server
```

Access the application at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`

### 5. Testing

```bash
# Run unit tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## 🌐 Deployment Guide

### 1. Google Cloud Setup

```bash
# Set your project ID
export PROJECT_ID=your-project-id
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  iap.googleapis.com \
  identitytoolkit.googleapis.com \
  firestore.googleapis.com
```

### 2. Identity Platform Configuration

1. Create a new tenant in Identity Platform
2. Configure allowed domains
3. Set up authentication providers
4. Note your tenant ID for configuration

### 3. Build and Deploy

```bash
# Build Docker image for Linux/AMD64 platform
docker build --platform linux/amd64 -t gcr.io/$PROJECT_ID/risk-portal:latest .

# Configure Docker authentication
gcloud auth configure-docker

# Push to Container Registry
docker push gcr.io/$PROJECT_ID/risk-portal:latest

# Deploy to Cloud Run
gcloud run deploy risk-portal \
  --image gcr.io/$PROJECT_ID/risk-portal:latest \
  --platform managed \
  --region us-central1
```

### 4. Configure IAP

1. Create OAuth 2.0 credentials
2. Configure IAP for your Cloud Run service
3. Add authorized users/groups
4. Set up custom domain with SSL

### 5. Production URL

Once deployed and IAP is configured, your application will be available at:
```
https://risk-portal-<PROJECT_NUMBER>.us-central1.run.app
```

Example production URL: https://risk-portal-290017403746.us-central1.run.app

## 🔧 Configuration

### IAP Settings

Configure IAP in `iap_settings.yaml`:

```yaml
iap:
  client_id: your-oauth-client-id
  client_secret: your-oauth-client-secret
  allowed_domains:
    - dompe.com
    - ext.dompe.com
```

### GCIP Configuration

Set up tenant in `gcip_settings.json`:

```json
{
  "tenant": {
    "name": "dompe8090-bf0qr",
    "displayName": "Dompe Risk Portal",
    "allowPasswordSignup": true,
    "enableEmailLinkSignin": false
  }
}
```

## 📚 Documentation

### Project Documentation Structure

- **[docs/](docs/)** - High-level project documentation
  - [Planning](docs/planning/) - Strategic plans and roadmaps
  - [Analysis](docs/analysis/) - Competitive analysis and comparisons
  - [Infrastructure](docs/infrastructure/) - GCP and infrastructure details

- **[8090-risk-portal/docs/](8090-risk-portal/docs/)** - Application-specific documentation
  - [Bugs](8090-risk-portal/docs/bugs/) - Bug reports and fixes
  - [Features](8090-risk-portal/docs/features/) - Feature specifications
  - [Development](8090-risk-portal/docs/dev/) - Developer guides and learnings

## 📚 API Documentation

### Authentication

All API endpoints require IAP authentication headers. These are automatically injected by Google Cloud IAP:

```http
GET /api/auth/me
X-Goog-Authenticated-User-Email: securetoken.google.com/project/tenant:user@dompe.com
X-Goog-Authenticated-User-Id: securetoken.google.com/project/tenant:123456
```

The authentication system automatically extracts user information from these headers and converts email formats (e.g., `firstname.lastname` → "Firstname Lastname").

### Risk Management

```http
# Get all risks
GET /api/risks

# Get specific risk
GET /api/risks/:id

# Create risk
POST /api/risks
Content-Type: application/json
{
  "title": "Risk Title",
  "description": "Risk Description",
  "likelihood": 3,
  "impact": 4
}

# Update risk
PUT /api/risks/:id

# Delete risk
DELETE /api/risks/:id
```

### Report Generation

```http
POST /api/reports/generate
Content-Type: application/json
{
  "type": "executive-summary",
  "riskIds": ["risk1", "risk2"],
  "format": "pdf"
}
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write unit tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors & Acknowledgments

- **8090 Inc** - Initial development and architecture
- **Dompe Farmaceutici S.p.A.** - Business requirements and domain expertise
- **Google Cloud** - Infrastructure and AI services

### Special Thanks

- Google Cloud Identity Platform team for authentication guidance
- Firebase team for excellent documentation
- React and TypeScript communities

## 🔄 Recent Updates (v2.8)

- ✅ Fixed IAP authentication header parsing for `securetoken.google.com` format
- ✅ Improved user name extraction from email addresses
- ✅ Resolved UseCase Risk Management filtering bugs
- ✅ Major project cleanup and file reorganization
- ✅ Enhanced documentation and bug reporting
- ✅ Successfully deployed to Google Cloud Run with IAP

## 📞 Support

For support, please contact:
- Technical Issues: [Create an issue](https://github.com/8090-inc/8090-risk-portal/issues)
- Business Inquiries: contact@8090.inc

---

Built with ❤️ by [8090 Inc](https://8090.inc) for Dompe Farmaceutici S.p.A.