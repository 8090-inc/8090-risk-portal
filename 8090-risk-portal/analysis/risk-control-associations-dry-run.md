# Risk-Control Associations Analysis (DRY RUN)

## Overview
This document presents a comprehensive mapping of existing IT controls to AI risks in the 8090 AI Risk Portal system. Each association is based on regulatory compliance requirements and risk mitigation effectiveness.

## Current State
- **Risks**: 16 identified risks across 6 categories
- **Controls**: 22 IT controls across 4 categories  
- **Current Risk-Control Associations**: None exist in the system

## Proposed Risk-Control Mappings

### 1. BEHAVIORAL RISKS

#### Risk: Accuracy (ID: RISK-ACCURACY)
**Initial Risk Level**: 20 (Critical) → **Residual**: 6 (Medium)

**Recommended Controls:**
- **ACC-01** - Human-in-the-Loop (HITL) Verification with 21 CFR 11-compliant e-signature
  - *Rationale*: Directly addresses accuracy concerns by requiring human verification of AI outputs before GxP decisions
  - *Compliance*: 21 CFR 11.10(a), EU Annex 11.1, GDPR Art. 22
- **ACC-03** - RAG Architecture with validated, version-controlled corpus
  - *Rationale*: Prevents hallucinations by grounding AI responses in approved documents only
  - *Compliance*: 21 CFR 11.10(a), EU Annex 11.4
- **LOG-02** - Precise citations to source GxP documents
  - *Rationale*: Enables verification and traceability of AI-generated content
  - *Compliance*: 21 CFR 11.10(b), EU AI Act Art. 13

#### Risk: Biased Outputs (ID: RISK-BIASED-OUTPUTS)
**Initial Risk Level**: 12 (High) → **Residual**: 6 (Medium)

**Recommended Controls:**
- **ACC-01** - Human-in-the-Loop (HITL) Verification
  - *Rationale*: Human reviewers can identify and correct biased content before use
  - *Compliance*: GDPR Art. 22, EU AI Act Art. 14
- **ACC-02** - Training on AI limitations and critical thinking
  - *Rationale*: Educates users to recognize and mitigate bias in AI outputs
  - *Compliance*: EU AI Act Art. 14(5)
- **SEC-05** - Adversarial testing (Red Teaming)
  - *Rationale*: Proactively identifies bias patterns and edge cases
  - *Compliance*: EU AI Act Art. 15, Art. 9(6)
- **GOV-04** - Acceptable Use Policy (AUP)
  - *Rationale*: Prohibits use in high-risk HR decisions where bias is most harmful
  - *Compliance*: EU AI Act Annex III.21

#### Risk: Outdated Information (ID: RISK-OUTDATED-INFORMATION)
**Initial Risk Level**: 12 (High) → **Residual**: 2 (Low)

**Recommended Controls:**
- **ACC-03** - RAG Architecture with version-controlled corpus
  - *Rationale*: Ensures AI only uses current, approved document versions
  - *Compliance*: 21 CFR 11.10(a), EU Annex 11.4
- **LOG-02** - Precise citations with version information
  - *Rationale*: Enables users to verify information currency
  - *Compliance*: 21 CFR 11.10(b)
- **GOV-03** - Continuous Validation framework
  - *Rationale*: Regular updates and validation of knowledge base
  - *Compliance*: EU AI Act Art. 9(2)

#### Risk: Scope Violations (ID: RISK-SCOPE-VIOLATIONS)
**Initial Risk Level**: 12 (High) → **Residual**: 4 (Low)

**Recommended Controls:**
- **ACC-03** - RAG Architecture with strict context grounding
  - *Rationale*: Limits AI responses to approved document corpus only
  - *Compliance*: 21 CFR 11.10(a)
- **SEC-05** - Red Teaming for scope violation testing
  - *Rationale*: Identifies prompts that cause out-of-scope responses
  - *Compliance*: EU AI Act Art. 15
- **GOV-04** - AUP defining permitted use cases
  - *Rationale*: Clearly defines and enforces system boundaries
  - *Compliance*: EU AI Act Art. 14

#### Risk: Availability (ID: RISK-AVAILABILITY)
**Initial Risk Level**: 16 (Critical) → **Residual**: 6 (Medium)

**Recommended Controls:**
- **SEC-01** - Infrastructure isolation with WAF
  - *Rationale*: Provides high-availability architecture across multiple zones
  - *Compliance*: 21 CFR 11.10(d), EU Annex 11.12
- **GOV-02** - Vendor contracts with SLA requirements
  - *Rationale*: Ensures uptime commitments and penalties for downtime
  - *Compliance*: EU Annex 11.3
- **GOV-03** - Continuous Validation with monitoring
  - *Rationale*: Detects performance issues before they impact availability
  - *Compliance*: EU AI Act Art. 9(2)

#### Risk: Limited Vendor Liabilities (ID: RISK-LIMITED-VENDOR-LIABILITIES)
**Initial Risk Level**: 9 (Medium) → **Residual**: 6 (Medium)

**Recommended Controls:**
- **GOV-02** - Vendor contracts with IP indemnification
  - *Rationale*: Directly addresses liability limitations through contractual terms
  - *Compliance*: GDPR Art. 28, EU AI Act Art. 28
- **ACC-01** - Independent validation of vendor outputs
  - *Rationale*: Reduces reliance on vendor guarantees through internal verification
  - *Compliance*: 21 CFR 11.10(a)
- **GOV-03** - Continuous Validation framework
  - *Rationale*: Independent testing protocols to verify AI reliability
  - *Compliance*: EU AI Act Art. 9(2)

### 2. TRANSPARENCY RISKS

#### Risk: Lack of Explainability (ID: RISK-LACK-OF-EXPLAINABILITY)
**Initial Risk Level**: 12 (High) → **Residual**: 4 (Low)

**Recommended Controls:**
- **LOG-02** - Precise citations to source documents
  - *Rationale*: Provides transparency through source traceability even if AI process is opaque
  - *Compliance*: EU AI Act Art. 13, GDPR Art. 15
- **ACC-02** - User training on system capabilities and limitations
  - *Rationale*: Educates users on what the system does and doesn't do
  - *Compliance*: EU AI Act Art. 14(5)
- **LOG-01** - Comprehensive audit logging
  - *Rationale*: Maintains record of all interactions for review and analysis
  - *Compliance*: 21 CFR 11.10(e), EU AI Act Art. 12

#### Risk: Failure to Disclose AI (ID: RISK-FAILURE-TO-DISCLOSE-AI)
**Initial Risk Level**: 9 (Medium) → **Residual**: 4 (Low)

**Recommended Controls:**
- **GOV-04** - AUP with disclosure requirements
  - *Rationale*: Mandates clear disclosure of AI involvement
  - *Compliance*: EU AI Act Art. 13
- **ACC-02** - Training on disclosure obligations
  - *Rationale*: Ensures users understand when and how to disclose AI usage
  - *Compliance*: EU AI Act Art. 14(5)
- **LOG-01** - Audit trail of AI usage
  - *Rationale*: Maintains record for compliance verification
  - *Compliance*: EU AI Act Art. 12

### 3. SECURITY AND DATA RISKS

#### Risk: Sensitive Information Leakage (ID: RISK-SENSITIVE-INFORMATION-LEAKAGE)
**Initial Risk Level**: 20 (Critical) → **Residual**: 8 (Medium)

**Recommended Controls:**
- **SEC-04** - Data Loss Prevention (DLP) scanning
  - *Rationale*: Directly prevents sensitive data exposure in prompts/responses
  - *Compliance*: GDPR Art. 25, 21 CFR 11.10(c)
- **SEC-03** - Encryption at rest and in transit
  - *Rationale*: Protects data during processing and storage
  - *Compliance*: GDPR Art. 32(1)(a), HIPAA § 164.312(e)(1)
- **SEC-02** - Role-based access controls (RBAC)
  - *Rationale*: Limits access to sensitive information based on need-to-know
  - *Compliance*: 21 CFR 11.10(d), GDPR Art. 32(1)(b)
- **LOG-01** - Immutable logging of all interactions
  - *Rationale*: Maintains audit trail for security incident investigation
  - *Compliance*: 21 CFR 11.10(e), HIPAA § 164.312(b)

#### Risk: Copyright Infringements (ID: RISK-COPYRIGHT-INFRINGEMENTS)
**Initial Risk Level**: 16 (Critical) → **Residual**: 9 (Medium)

**Recommended Controls:**
- **ACC-04** - Plagiarism detection and originality review
  - *Rationale*: Identifies potential copyright violations in AI outputs
  - *Compliance*: Copyright law compliance
- **ACC-03** - RAG with controlled corpus
  - *Rationale*: Limits AI to pre-approved, licensed content
  - *Compliance*: 21 CFR 11.10(a)
- **GOV-02** - Vendor IP indemnification clauses
  - *Rationale*: Transfers some copyright liability to vendors
  - *Compliance*: Contract law

#### Risk: Hackers Abuse GenAI Solutions (ID: RISK-HACKERS-ABUSE-GENAI)
**Initial Risk Level**: 16 (Critical) → **Residual**: 8 (Medium)

**Recommended Controls:**
- **SEC-01** - Infrastructure isolation with WAF
  - *Rationale*: Provides primary defense against external attacks
  - *Compliance*: 21 CFR 11.10(d), NIST 800-53 SC-7
- **SEC-06** - Secure Application Gateway/WAF
  - *Rationale*: Additional layer of protection against web-based attacks
  - *Compliance*: NIST 800-53 SC-7
- **SEC-05** - Red Teaming and penetration testing
  - *Rationale*: Proactively identifies security vulnerabilities
  - *Compliance*: EU AI Act Art. 15, NIST 800-53 CA-8
- **LOG-01** - Comprehensive security logging
  - *Rationale*: Enables detection and investigation of security incidents
  - *Compliance*: 21 CFR 11.10(e), NIST 800-53 AU-2

#### Risk: Unauthorized Information Access (ID: RISK-UNAUTHORIZED-ACCESS)
**Initial Risk Level**: 20 (Critical) → **Residual**: 8 (Medium)

**Recommended Controls:**
- **SEC-02** - Strict RBAC with least privilege
  - *Rationale*: Primary control for preventing unauthorized access
  - *Compliance*: 21 CFR 11.10(d), NIST 800-53 AC-2
- **SEC-09** - Attribute-Based Access Control (ABAC)
  - *Rationale*: Fine-grained access control based on multiple attributes
  - *Compliance*: NIST 800-53 AC-2
- **SEC-01** - Network isolation and segmentation
  - *Rationale*: Limits lateral movement in case of compromise
  - *Compliance*: NIST 800-53 SC-7
- **LOG-01** - Access logging and monitoring
  - *Rationale*: Detects and investigates unauthorized access attempts
  - *Compliance*: 21 CFR 11.10(e), HIPAA § 164.312(b)

### 4. OTHER RISKS

#### Risk: Failing to Keep Up With Regulations (ID: RISK-REGULATORY-COMPLIANCE)
**Initial Risk Level**: 12 (High) → **Residual**: 6 (Medium)

**Recommended Controls:**
- **GOV-01** - AI Governance Committee with regulatory intelligence
  - *Rationale*: Proactively monitors and adapts to regulatory changes
  - *Compliance*: EU AI Act Art. 9, GDPR Art. 24
- **GOV-03** - Continuous Validation framework
  - *Rationale*: Ensures ongoing compliance through regular assessments
  - *Compliance*: EU AI Act Art. 9(2), 21 CFR 11.10(a)
- **ACC-02** - Regular training updates on regulatory changes
  - *Rationale*: Keeps staff informed of evolving compliance requirements
  - *Compliance*: EU AI Act Art. 14(5)

#### Risk: Employees Abusing GenAI (ID: RISK-EMPLOYEE-ABUSE)
**Initial Risk Level**: 12 (High) → **Residual**: 6 (Medium)

**Recommended Controls:**
- **GOV-04** - Comprehensive Acceptable Use Policy
  - *Rationale*: Defines prohibited uses and consequences for violations
  - *Compliance*: Corporate governance best practices
- **LOG-01** - User activity monitoring and logging
  - *Rationale*: Detects policy violations and inappropriate usage
  - *Compliance*: 21 CFR 11.10(e)
- **ACC-02** - Training on appropriate AI usage
  - *Rationale*: Educates employees on proper and improper uses
  - *Compliance*: EU AI Act Art. 14(5)
- **SEC-02** - Access controls to limit system capabilities
  - *Rationale*: Prevents access to functionality beyond user's role
  - *Compliance*: NIST 800-53 AC-6

#### Risk: Sustainability/Energy Waste (ID: RISK-SUSTAINABILITY)
**Initial Risk Level**: 6 (Medium) → **Residual**: 4 (Low)

**Recommended Controls:**
- **GOV-01** - AI Governance with sustainability oversight
  - *Rationale*: Incorporates environmental considerations into AI governance
  - *Compliance*: ESG reporting requirements
- **GOV-03** - Continuous monitoring of resource usage
  - *Rationale*: Tracks and optimizes AI system energy consumption
  - *Compliance*: Environmental management standards

### 5. AI HUMAN IMPACT RISKS

#### Risk: Psychological Harm (ID: RISK-PSYCHOLOGICAL-HARM)
**Initial Risk Level**: 6 (Medium) → **Residual**: 1 (Low)

**Recommended Controls:**
- **GOV-04** - AUP prohibiting performance evaluation uses
  - *Rationale*: Prevents AI use in contexts that could cause psychological harm
  - *Compliance*: EU AI Act high-risk categories
- **ACC-02** - Training on ethical AI use
  - *Rationale*: Educates users on responsible AI deployment
  - *Compliance*: Ethics and governance best practices

#### Risk: Discrimination Risk (ID: RISK-DISCRIMINATION)
**Initial Risk Level**: 1 (Low) → **Residual**: 1 (Low)

**Recommended Controls:**
- **GOV-04** - AUP explicitly prohibiting HR-related uses
  - *Rationale*: Prevents AI use in discriminatory contexts
  - *Compliance*: EU AI Act Annex III.21, employment law
- **ACC-02** - Training on bias awareness and prevention
  - *Rationale*: Educates users on discrimination risks
  - *Compliance*: EU AI Act Art. 14(5)

#### Risk: Consent & Transparency Gaps (ID: RISK-CONSENT-TRANSPARENCY)
**Initial Risk Level**: 4 (Low) → **Residual**: 1 (Low)

**Recommended Controls:**
- **ACC-02** - Comprehensive user training on data usage
  - *Rationale*: Ensures users understand how their data is processed
  - *Compliance*: GDPR transparency principles
- **LOG-01** - Transparent logging of user interactions
  - *Rationale*: Maintains clear record of data processing activities
  - *Compliance*: GDPR Art. 30, EU AI Act Art. 12
- **GOV-04** - Clear consent mechanisms in AUP
  - *Rationale*: Obtains proper consent for data processing
  - *Compliance*: GDPR Art. 6, Art. 7

## Implementation Summary

### Control Usage Distribution:
- **ACC-01**: 4 risks (Accuracy, Biased Outputs, Limited Vendor Liabilities, Psychological Harm)
- **ACC-02**: 7 risks (All behavioral risks + regulatory + employee abuse + discrimination + consent)
- **ACC-03**: 4 risks (Accuracy, Outdated Information, Scope Violations, Copyright)
- **ACC-04**: 1 risk (Copyright)
- **SEC-01**: 4 risks (Availability, Hackers Abuse, Unauthorized Access, Infrastructure)
- **SEC-02**: 3 risks (Sensitive Information, Unauthorized Access, Employee Abuse)
- **SEC-03**: 1 risk (Sensitive Information)
- **SEC-04**: 1 risk (Sensitive Information)
- **SEC-05**: 3 risks (Biased Outputs, Scope Violations, Hackers Abuse)
- **SEC-06**: 1 risk (Hackers Abuse)
- **SEC-09**: 1 risk (Unauthorized Access)
- **LOG-01**: 6 risks (Accuracy, Explainability, Disclosure, Sensitive Info, Hackers, Employee Abuse, Consent)
- **LOG-02**: 3 risks (Accuracy, Outdated Information, Explainability)
- **GOV-01**: 2 risks (Regulatory Compliance, Sustainability)
- **GOV-02**: 2 risks (Availability, Limited Vendor Liabilities)
- **GOV-03**: 4 risks (Outdated Information, Availability, Limited Vendor Liabilities, Regulatory)
- **GOV-04**: 6 risks (Biased Outputs, Scope Violations, Disclosure, Employee Abuse, Psychological, Discrimination, Consent)

### Most Critical Associations (Risk Level 16-25):
1. **Sensitive Information Leakage** → SEC-04 (DLP), SEC-03 (Encryption), SEC-02 (RBAC), LOG-01 (Logging)
2. **Accuracy** → ACC-01 (HITL), ACC-03 (RAG), LOG-02 (Citations)
3. **Unauthorized Access** → SEC-02 (RBAC), SEC-09 (ABAC), SEC-01 (Isolation), LOG-01 (Logging)
4. **Hackers Abuse** → SEC-01 (WAF), SEC-06 (Gateway), SEC-05 (Red Team), LOG-01 (Logging)
5. **Copyright Infringement** → ACC-04 (Plagiarism), ACC-03 (RAG), GOV-02 (IP Clauses)
6. **Availability** → SEC-01 (Infrastructure), GOV-02 (SLAs), GOV-03 (Monitoring)

## Next Steps
1. Review and approve these associations
2. Implement the risk-control relationships in the database
3. Update the UI to display associated controls for each risk
4. Establish monitoring and compliance reporting based on these relationships

## Files to Update
- Risk data in Google Drive Excel file
- Database through API endpoints
- Frontend components displaying risk-control relationships
- Compliance reporting modules
