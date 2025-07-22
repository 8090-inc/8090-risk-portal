# Security Best Practices

This document outlines security best practices for the 8090 AI Risk Portal deployment and maintenance.

## 1. Service Account Security

### Principle of Least Privilege

**DO:**
- Grant only necessary permissions
- Use separate service accounts for different purposes
- Regularly audit service account usage

**DON'T:**
- Use owner or editor roles
- Share service account keys
- Commit keys to version control

### Service Account Key Management

```bash
# Rotate service account keys quarterly
gcloud iam service-accounts keys create new-key.json \
  --iam-account=290017403746-compute@developer.gserviceaccount.com

# Delete old keys after rotation
gcloud iam service-accounts keys delete KEY_ID \
  --iam-account=290017403746-compute@developer.gserviceaccount.com
```

### Required Permissions Only

Current service account needs:
- `roles/drive.file` - Access specific Drive files
- `roles/logging.logWriter` - Write application logs
- No additional permissions required

## 2. Environment Variable Security

### Production Environment Variables

**Never expose:**
- `GOOGLE_SERVICE_ACCOUNT_KEY` - Service account credentials
- API keys or secrets
- Database passwords
- OAuth client secrets

### Secure Storage

```bash
# Use Google Secret Manager
gcloud secrets create service-account-key \
  --data-file=service-account-key.json

# Reference in Cloud Run
gcloud run services update risk-portal \
  --set-secrets=GOOGLE_SERVICE_ACCOUNT_KEY=service-account-key:latest
```

### Environment Validation

```javascript
// Validate required environment variables on startup
const requiredEnvVars = [
  'GOOGLE_SERVICE_ACCOUNT_KEY',
  'GOOGLE_DRIVE_FILE_ID',
  'NODE_ENV'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});
```

## 3. API Security

### Authentication Enforcement

```javascript
// Always require authentication for API routes
router.use(authenticate);

// Never create public endpoints for sensitive data
router.get('/api/public/risks'); // ❌ BAD

router.get('/api/v1/risks', authenticate, (req, res) => {
  // ✅ GOOD - Protected by authentication
});
```

### Input Validation

```javascript
// Validate all user inputs
const validateRisk = (req, res, next) => {
  const { risk, riskCategory } = req.body;
  
  if (!risk || risk.length > 500) {
    return res.status(400).json({ error: 'Invalid risk description' });
  }
  
  if (!VALID_CATEGORIES.includes(riskCategory)) {
    return res.status(400).json({ error: 'Invalid risk category' });
  }
  
  next();
};
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);
```

### CORS Configuration

```javascript
// Restrictive CORS policy
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://dompe.airiskportal.com',
      'https://dompe-dev-439304.web.app'
    ];
    
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('Not allowed by CORS'));
    }
    
    return callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200
}));
```

## 4. Data Protection

### Encryption at Rest

- Google Drive handles encryption automatically
- For local storage, use encrypted volumes
- Never store sensitive data in plain text

### Encryption in Transit

- Always use HTTPS in production
- Enforce SSL/TLS for all connections
- Use strong cipher suites

### Data Minimization

```javascript
// Only return necessary fields
const sanitizeUser = (user) => ({
  email: user.email,
  role: user.role
  // Don't include: internalId, permissions, etc.
});
```

### Audit Logging

```javascript
// Log all data modifications
const auditLog = (action, user, data) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    action,
    user: user.email,
    data: { id: data.id }, // Don't log sensitive content
    ip: req.ip
  }));
};
```

## 5. Deployment Security

### Cloud Run Configuration

```bash
# Deploy with security best practices
gcloud run deploy risk-portal \
  --image gcr.io/dompe-dev-439304/risk-portal:latest \
  --platform managed \
  --region us-central1 \
  --no-allow-unauthenticated \  # Force IAP authentication
  --service-account=290017403746-compute@developer.gserviceaccount.com \
  --max-instances=10 \  # Prevent resource exhaustion
  --min-instances=1 \    # Ensure availability
  --cpu=1 \
  --memory=512Mi \
  --timeout=300
```

### Container Security

```dockerfile
# Use specific version tags
FROM node:18-alpine3.18  # ✅ GOOD

FROM node:latest  # ❌ BAD - Unpredictable

# Run as non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Copy only necessary files
COPY --chown=nodejs:nodejs . .
```

### Network Security

- Use VPC Service Controls for additional protection
- Implement Cloud Armor for DDoS protection
- Enable Cloud Security Scanner

## 6. Access Control

### IAP User Management

```bash
# Add user with expiration
gcloud iap web add-iam-policy-binding \
  --member=user:contractor@example.com \
  --role=roles/iap.httpsResourceAccessor \
  --condition="expression=request.time < timestamp('2024-12-31T00:00:00Z'),title=Contractor Access,description=Temporary access for contractor"
```

### Role-Based Access

```javascript
// Implement granular permissions
const authorize = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userPermissions = getRolePermissions(req.user.role);
    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
};

// Use in routes
router.delete('/api/v1/risks/:id', 
  authenticate, 
  authorize('risks.delete'), 
  deleteRisk
);
```

## 7. Security Monitoring

### Enable Audit Logs

```bash
# Enable Cloud Audit Logs
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member=serviceAccount:service-PROJECT_NUMBER@container-engine-robot.iam.gserviceaccount.com \
  --role=roles/logging.logWriter
```

### Set Up Alerts

Create alerts for:
- Multiple failed authentication attempts
- Unusual API usage patterns
- Service account key access
- Configuration changes

### Regular Security Scans

```bash
# Scan container images
gcloud container images scan IMAGE_URL

# Check for vulnerabilities
npm audit
npm audit fix
```

## 8. Incident Response

### Preparation

1. Document all system components
2. Maintain contact list for security team
3. Create runbooks for common scenarios
4. Regular backup of configurations

### Detection

Monitor for:
- Unexpected IAP access changes
- Unusual API traffic patterns
- Service account anomalies
- Data exfiltration attempts

### Response Steps

1. **Contain:** Isolate affected components
2. **Assess:** Determine scope of incident
3. **Notify:** Inform security team and stakeholders
4. **Remediate:** Fix vulnerabilities
5. **Document:** Create incident report
6. **Review:** Update procedures based on lessons learned

### Recovery

- Restore from known good backups
- Rotate all credentials
- Review and update access lists
- Implement additional monitoring

## 9. Compliance

### Data Privacy

- Implement data retention policies
- Provide data export capabilities
- Support right to deletion requests
- Maintain processing records

### Security Standards

Follow industry standards:
- OWASP Top 10 mitigation
- CIS Security Controls
- NIST Cybersecurity Framework
- ISO 27001 where applicable

## 10. Security Checklist

### Before Each Deployment

- [ ] No secrets in code
- [ ] Dependencies updated (`npm audit`)
- [ ] Environment variables configured
- [ ] CORS properly restricted
- [ ] Authentication required on all endpoints
- [ ] Input validation implemented
- [ ] Error messages don't leak information
- [ ] Logging doesn't contain sensitive data
- [ ] Container runs as non-root
- [ ] Resource limits configured

### Monthly Review

- [ ] Audit IAP access list
- [ ] Review service account permissions
- [ ] Check for unused API keys
- [ ] Review security alerts
- [ ] Update dependencies
- [ ] Review audit logs
- [ ] Test incident response procedures

### Quarterly Review

- [ ] Rotate service account keys
- [ ] Security training for team
- [ ] Penetration testing
- [ ] Review and update security policies
- [ ] Compliance audit