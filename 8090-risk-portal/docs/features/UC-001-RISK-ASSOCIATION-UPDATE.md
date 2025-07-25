# UC-001 Risk Association Update

## Summary
Updated risk associations for UC-001 "Medical Inquiry Response Documents (CRD/SRD)" to properly reflect all compliance, regulatory, and security risks relevant to medical document generation.

## Changes Made
**Date**: July 24, 2025  
**Updated via**: PUT /api/v1/usecases/UC-001/risks  
**Risk Count**: Increased from 3 to 10 risks

### Previous Risk Associations (3 risks)
1. RISK-OUTDATED-INFORMATION
2. RISK-SCOPE-VIOLATIONS
3. RISK-BIASED-OUTPUTS

### Updated Risk Associations (10 risks)

#### Retained Risks
1. **RISK-OUTDATED-INFORMATION** - Medical knowledge cutoffs critical for accuracy
2. **RISK-BIASED-OUTPUTS** - Medical bias could affect patient care decisions

#### New Critical Risks Added
3. **RISK-GXP-RISK** (Initial: 16, Residual: 6)
   - Essential for pharmaceutical GxP compliance
   - Addresses evolving regulations for AI in GxP environments
   
4. **RISK-SENSITIVE-INFORMATION-LEAKAGE** (Initial: 25, Residual: 8)
   - Critical for PHI/PII protection in CRDs/SRDs
   - Implements zero-trust architecture with encryption
   
5. **RISK-FAILING-TO-KEEP-UP-WITH-REGULATIONS** (Initial: 16, Residual: 4)
   - Covers HIPAA, GDPR, EU AI Act compliance
   - Includes EMA/FDA guidance monitoring
   
6. **RISK-LACK-OF-EXPLAINABILITY** (Initial: 12, Residual: 4)
   - Required for 21 CFR Part 11 audit trails
   - Ensures traceability for medical decisions

#### Additional Relevant Risks
7. **RISK-UNAUTHORIZED-INFORMATION-ACCESS-VIA-LLMS** (Initial: 12, Residual: 4)
   - Protects internal CSRs, TLFs, study protocols
   - Implements attribute-based access controls
   
8. **RISK-REPUTATIONAL-RISK** (Initial: 20, Residual: 6)
   - Medical errors could severely impact reputation
   - Requires human verification for critical outputs
   
9. **RISK-COPYRIGHT-INFRINGEMENTS** (Initial: 10, Residual: 3)
   - Important for PubMed/Embase content usage
   - Manages third-party database T&C compliance
   
10. **RISK-IP-RISK** (Initial: 12, Residual: 4)
    - Clarifies ownership of AI-generated medical content
    - Addresses patent and confidentiality concerns

### Removed Risk
- **RISK-SCOPE-VIOLATIONS** - Less relevant for focused medical document generation

## Rationale
UC-001 involves:
- Accessing external medical databases (PubMed, Embase)
- Processing internal confidential documents (CSRs, TLFs)
- Handling PHI/PII data requiring HIPAA/GDPR compliance
- Operating in GxP-regulated pharmaceutical environment
- Generating medical content requiring accuracy and traceability

The updated risk profile better reflects these critical requirements and ensures comprehensive risk coverage for medical document generation.

## Impact
- Improved risk visibility for medical AI use case
- Better alignment with regulatory requirements
- Enhanced focus on data protection and compliance
- Clearer mitigation strategies for medical-specific risks

## Verification
- API response confirmed successful update
- Risk count increased from 3 to 10
- All risk associations persisted to Google Drive Excel
- UI reflects updated risk relationships