# Risk-Control Associations Table

## Summary Table

| Risk Name | Risk Category | Risk Level | Associated Controls | Total Controls |
|-----------|---------------|------------|-------------------|----------------|
| Sensitive Information Leakage | Security & Data | 20 (Critical) | SEC-04, SEC-03, SEC-02, LOG-01 | 4 |
| Accuracy | Behavioral | 20 (Critical) | ACC-01, ACC-03, LOG-02 | 3 |
| Unauthorized Information Access | Security & Data | 20 (Critical) | SEC-02, SEC-09, SEC-01, LOG-01 | 4 |
| Copyright Infringements | Security & Data | 16 (Critical) | ACC-04, ACC-03, GOV-02 | 3 |
| Hackers Abuse GenAI Solutions | Security & Data | 16 (Critical) | SEC-01, SEC-06, SEC-05, LOG-01 | 4 |
| Availability | Behavioral | 16 (Critical) | SEC-01, GOV-02, GOV-03 | 3 |
| Biased Outputs | Behavioral | 12 (High) | ACC-01, ACC-02, SEC-05, GOV-04 | 4 |
| Outdated Information | Behavioral | 12 (High) | ACC-03, LOG-02, GOV-03 | 3 |
| Scope Violations | Behavioral | 12 (High) | ACC-03, SEC-05, GOV-04 | 3 |
| Lack of Explainability | Transparency | 12 (High) | LOG-02, ACC-02, LOG-01 | 3 |
| Failing to Keep Up With Regulations | Other | 12 (High) | GOV-01, GOV-03, ACC-02 | 3 |
| Employees Abusing GenAI | Other | 12 (High) | GOV-04, LOG-01, ACC-02, SEC-02 | 4 |
| Limited Vendor Liabilities | Behavioral | 9 (Medium) | GOV-02, ACC-01, GOV-03 | 3 |
| Failure to Disclose AI | Transparency | 9 (Medium) | GOV-04, ACC-02, LOG-01 | 3 |
| Sustainability/Energy Waste | Other | 6 (Medium) | GOV-01, GOV-03 | 2 |
| Psychological Harm | AI Human Impact | 6 (Medium) | GOV-04, ACC-02 | 2 |
| Consent & Transparency Gaps | AI Human Impact | 4 (Low) | ACC-02, LOG-01, GOV-04 | 3 |
| Discrimination Risk | AI Human Impact | 1 (Low) | GOV-04, ACC-02 | 2 |

## Detailed Risk-Control Mappings

### CRITICAL RISKS (Level 16-25)

#### 1. Sensitive Information Leakage (Risk Level: 20)
| Control ID | Control Description | Rationale | Compliance |
|------------|-------------------|-----------|------------|
| SEC-04 | Data Loss Prevention (DLP) scanning | Directly prevents sensitive data exposure | GDPR Art. 25, 21 CFR 11.10(c) |
| SEC-03 | Encryption at rest and in transit | Protects data during processing/storage | GDPR Art. 32(1)(a), HIPAA § 164.312(e)(1) |
| SEC-02 | Role-based access controls (RBAC) | Limits access based on need-to-know | 21 CFR 11.10(d), GDPR Art. 32(1)(b) |
| LOG-01 | Immutable logging of interactions | Audit trail for security incidents | 21 CFR 11.10(e), HIPAA § 164.312(b) |

#### 2. Accuracy (Risk Level: 20)
| Control ID | Control Description | Rationale | Compliance |
|------------|-------------------|-----------|------------|
| ACC-01 | Human-in-the-Loop (HITL) Verification | Requires human verification before GxP decisions | 21 CFR 11.10(a), EU Annex 11.1, GDPR Art. 22 |
| ACC-03 | RAG Architecture with validated corpus | Prevents hallucinations, grounds in approved docs | 21 CFR 11.10(a), EU Annex 11.4 |
| LOG-02 | Precise citations to source documents | Enables verification and traceability | 21 CFR 11.10(b), EU AI Act Art. 13 |

#### 3. Unauthorized Information Access (Risk Level: 20)
| Control ID | Control Description | Rationale | Compliance |
|------------|-------------------|-----------|------------|
| SEC-02 | Strict RBAC with least privilege | Primary control for preventing unauthorized access | 21 CFR 11.10(d), NIST 800-53 AC-2 |
| SEC-09 | Attribute-Based Access Control (ABAC) | Fine-grained access control | NIST 800-53 AC-2 |
| SEC-01 | Infrastructure isolation with WAF | Limits lateral movement if compromised | NIST 800-53 SC-7 |
| LOG-01 | Access logging and monitoring | Detects unauthorized access attempts | 21 CFR 11.10(e), HIPAA § 164.312(b) |

#### 4. Copyright Infringements (Risk Level: 16)
| Control ID | Control Description | Rationale | Compliance |
|------------|-------------------|-----------|------------|
| ACC-04 | Plagiarism detection & originality review | Identifies potential copyright violations | Copyright law compliance |
| ACC-03 | RAG with controlled corpus | Limits AI to pre-approved, licensed content | 21 CFR 11.10(a) |
| GOV-02 | Vendor IP indemnification clauses | Transfers some copyright liability to vendors | Contract law |

#### 5. Hackers Abuse GenAI Solutions (Risk Level: 16)
| Control ID | Control Description | Rationale | Compliance |
|------------|-------------------|-----------|------------|
| SEC-01 | Infrastructure isolation with WAF | Primary defense against external attacks | 21 CFR 11.10(d), NIST 800-53 SC-7 |
| SEC-06 | Secure Application Gateway/WAF | Additional layer of web attack protection | NIST 800-53 SC-7 |
| SEC-05 | Red Teaming and penetration testing | Proactively identifies security vulnerabilities | EU AI Act Art. 15, NIST 800-53 CA-8 |
| LOG-01 | Comprehensive security logging | Enables detection and investigation | 21 CFR 11.10(e), NIST 800-53 AU-2 |

#### 6. Availability (Risk Level: 16)
| Control ID | Control Description | Rationale | Compliance |
|------------|-------------------|-----------|------------|
| SEC-01 | Infrastructure isolation with WAF | High-availability architecture across zones | 21 CFR 11.10(d), EU Annex 11.12 |
| GOV-02 | Vendor contracts with SLA requirements | Ensures uptime commitments and penalties | EU Annex 11.3 |
| GOV-03 | Continuous Validation with monitoring | Detects performance issues proactively | EU AI Act Art. 9(2) |

### HIGH RISKS (Level 11-15)

#### 7. Biased Outputs (Risk Level: 12)
| Control ID | Control Description | Rationale | Compliance |
|------------|-------------------|-----------|------------|
| ACC-01 | Human-in-the-Loop (HITL) Verification | Human reviewers identify/correct bias | GDPR Art. 22, EU AI Act Art. 14 |
| ACC-02 | Training on AI limitations | Educates users to recognize bias | EU AI Act Art. 14(5) |
| SEC-05 | Adversarial testing (Red Teaming) | Proactively identifies bias patterns | EU AI Act Art. 15, Art. 9(6) |
| GOV-04 | Acceptable Use Policy (AUP) | Prohibits use in high-risk HR decisions | EU AI Act Annex III.21 |

#### 8. Outdated Information (Risk Level: 12)
| Control ID | Control Description | Rationale | Compliance |
|------------|-------------------|-----------|------------|
| ACC-03 | RAG with version-controlled corpus | Ensures AI uses current document versions | 21 CFR 11.10(a), EU Annex 11.4 |
| LOG-02 | Citations with version information | Enables users to verify information currency | 21 CFR 11.10(b) |
| GOV-03 | Continuous Validation framework | Regular updates and validation | EU AI Act Art. 9(2) |

#### 9. Scope Violations (Risk Level: 12)
| Control ID | Control Description | Rationale | Compliance |
|------------|-------------------|-----------|------------|
| ACC-03 | RAG with strict context grounding | Limits responses to approved corpus only | 21 CFR 11.10(a) |
| SEC-05 | Red Teaming for scope testing | Identifies out-of-scope response prompts | EU AI Act Art. 15 |
| GOV-04 | AUP defining permitted use cases | Clearly defines system boundaries | EU AI Act Art. 14 |

#### 10. Lack of Explainability (Risk Level: 12)
| Control ID | Control Description | Rationale | Compliance |
|------------|-------------------|-----------|------------|
| LOG-02 | Precise citations to source documents | Provides transparency through traceability | EU AI Act Art. 13, GDPR Art. 15 |
| ACC-02 | User training on capabilities/limitations | Educates users on system functionality | EU AI Act Art. 14(5) |
| LOG-01 | Comprehensive audit logging | Maintains record for review and analysis | 21 CFR 11.10(e), EU AI Act Art. 12 |

#### 11. Failing to Keep Up With Regulations (Risk Level: 12)
| Control ID | Control Description | Rationale | Compliance |
|------------|-------------------|-----------|------------|
| GOV-01 | AI Governance with regulatory intelligence | Proactively monitors regulatory changes | EU AI Act Art. 9, GDPR Art. 24 |
| GOV-03 | Continuous Validation framework | Ensures ongoing compliance | EU AI Act Art. 9(2), 21 CFR 11.10(a) |
| ACC-02 | Regular training on regulatory changes | Keeps staff informed of evolving requirements | EU AI Act Art. 14(5) |

#### 12. Employees Abusing GenAI (Risk Level: 12)
| Control ID | Control Description | Rationale | Compliance |
|------------|-------------------|-----------|------------|
| GOV-04 | Comprehensive Acceptable Use Policy | Defines prohibited uses and consequences | Corporate governance best practices |
| LOG-01 | User activity monitoring and logging | Detects policy violations | 21 CFR 11.10(e) |
| ACC-02 | Training on appropriate AI usage | Educates on proper/improper uses | EU AI Act Art. 14(5) |
| SEC-02 | Access controls limiting capabilities | Prevents access beyond user's role | NIST 800-53 AC-6 |

### MEDIUM RISKS (Level 6-10)

#### 13. Limited Vendor Liabilities (Risk Level: 9)
| Control ID | Control Description | Rationale | Compliance |
|------------|-------------------|-----------|------------|
| GOV-02 | Vendor contracts with IP indemnification | Addresses liability limitations contractually | GDPR Art. 28, EU AI Act Art. 28 |
| ACC-01 | Independent validation of vendor outputs | Reduces reliance on vendor guarantees | 21 CFR 11.10(a) |
| GOV-03 | Continuous Validation framework | Independent testing protocols | EU AI Act Art. 9(2) |

#### 14. Failure to Disclose AI (Risk Level: 9)
| Control ID | Control Description | Rationale | Compliance |
|------------|-------------------|-----------|------------|
| GOV-04 | AUP with disclosure requirements | Mandates clear disclosure of AI involvement | EU AI Act Art. 13 |
| ACC-02 | Training on disclosure obligations | Ensures users understand disclosure requirements | EU AI Act Art. 14(5) |
| LOG-01 | Audit trail of AI usage | Maintains record for compliance verification | EU AI Act Art. 12 |

#### 15. Sustainability/Energy Waste (Risk Level: 6)
| Control ID | Control Description | Rationale | Compliance |
|------------|-------------------|-----------|------------|
| GOV-01 | AI Governance with sustainability oversight | Incorporates environmental considerations | ESG reporting requirements |
| GOV-03 | Continuous monitoring of resource usage | Tracks and optimizes energy consumption | Environmental management standards |

#### 16. Psychological Harm (Risk Level: 6)
| Control ID | Control Description | Rationale | Compliance |
|------------|-------------------|-----------|------------|
| GOV-04 | AUP prohibiting performance evaluation uses | Prevents AI use in harmful contexts | EU AI Act high-risk categories |
| ACC-02 | Training on ethical AI use | Educates on responsible AI deployment | Ethics and governance best practices |

### LOW RISKS (Level 1-5)

#### 17. Consent & Transparency Gaps (Risk Level: 4)
| Control ID | Control Description | Rationale | Compliance |
|------------|-------------------|-----------|------------|
| ACC-02 | Comprehensive user training on data usage | Ensures understanding of data processing | GDPR transparency principles |
| LOG-01 | Transparent logging of user interactions | Clear record of data processing activities | GDPR Art. 30, EU AI Act Art. 12 |
| GOV-04 | Clear consent mechanisms in AUP | Obtains proper consent for data processing | GDPR Art. 6, Art. 7 |

#### 18. Discrimination Risk (Risk Level: 1)
| Control ID | Control Description | Rationale | Compliance |
|------------|-------------------|-----------|------------|
| GOV-04 | AUP explicitly prohibiting HR-related uses | Prevents AI use in discriminatory contexts | EU AI Act Annex III.21, employment law |
| ACC-02 | Training on bias awareness and prevention | Educates users on discrimination risks | EU AI Act Art. 14(5) |

## Control Usage Summary

| Control ID | Control Name | Used by # Risks | Risk Categories Covered |
|------------|--------------|-----------------|------------------------|
| ACC-02 | Training on AI limitations | 7 | All categories |
| LOG-01 | Immutable logging | 6 | Security, Behavioral, Other, AI Human Impact |
| GOV-04 | Acceptable Use Policy | 6 | Behavioral, Transparency, Other, AI Human Impact |
| ACC-01 | Human-in-the-Loop Verification | 4 | Behavioral, AI Human Impact |
| ACC-03 | RAG Architecture | 4 | Behavioral, Security |
| SEC-01 | Infrastructure isolation with WAF | 4 | Security, Behavioral |
| GOV-03 | Continuous Validation | 4 | Behavioral, Other |
| SEC-02 | Role-based access controls | 3 | Security, Other |
| SEC-05 | Red Teaming | 3 | Behavioral, Security |
| GOV-02 | Vendor contracts with indemnification | 3 | Behavioral, Security |
| LOG-02 | Precise citations | 3 | Behavioral, Transparency |
| GOV-01 | AI Governance Committee | 2 | Other |
| SEC-03 | Encryption | 1 | Security |
| SEC-04 | Data Loss Prevention | 1 | Security |
| SEC-06 | Secure Application Gateway | 1 | Security |
| SEC-09 | Attribute-Based Access Control | 1 | Security |
| ACC-04 | Plagiarism detection | 1 | Security |

**Total Risk-Control Associations: 55 mappings across 18 risks and 17 controls**
